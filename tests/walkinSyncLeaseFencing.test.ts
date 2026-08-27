import { describe, expect, it, vi } from "vitest";
import {
  WalkinLeaseCoordinator,
  WalkinSyncLeaseLostError,
} from "../server/walkinSyncCoordinator";

/**
 * A deterministic in-memory stand-in for the durable database lease. The
 * clock moves only when a test asks it to, so these tests contain no sleeps or
 * timing races.
 */
function makeLeaseStore() {
  let now = 0;
  let lease: { ownerId: string; expiresAt: number } | null = null;

  return {
    advance(ms: number) {
      now += ms;
    },
    store: {
      async claim(ownerId: string) {
        if (!lease || lease.expiresAt <= now || lease.ownerId === ownerId) {
          lease = { ownerId, expiresAt: now + 90_000 };
          return true;
        }
        return false;
      },
      async renew(ownerId: string) {
        if (!lease || lease.ownerId !== ownerId || lease.expiresAt <= now) return false;
        lease.expiresAt = now + 90_000;
        return true;
      },
      async release(ownerId: string) {
        if (lease?.ownerId === ownerId) lease.expiresAt = now;
      },
      async isHeld(ownerId: string) {
        return lease?.ownerId === ownerId && lease.expiresAt > now;
      },
    },
  };
}

function coordinator(ownerId: string, store: ReturnType<typeof makeLeaseStore>["store"]) {
  // A long interval means the tests exercise explicit, point-of-write fencing
  // rather than relying on a background timer.
  return new WalkinLeaseCoordinator({ ownerId, store, renewIntervalMs: 60 * 60 * 1000 });
}

describe("walk-in Sheets durable lease fencing", () => {
  it("recovers deterministically after an instance is killed without SIGTERM mid-cycle", async () => {
    const lease = makeLeaseStore();
    const killedInstance = coordinator("killed-instance", lease.store);
    const replacement = coordinator("replacement-instance", lease.store);

    // Simulates a process that acquired the lease and then died: it never calls
    // release(), so the replacement must wait for durable TTL expiry.
    expect(await killedInstance.tryClaimLease()).toBe(true);
    expect(await replacement.tryClaimLease()).toBe(false);

    lease.advance(90_001);

    expect(await replacement.tryClaimLease()).toBe(true);
  });

  it("rejects a stale holder's next write after TTL expiry while it is mid-cycle", async () => {
    const lease = makeLeaseStore();
    const staleHolder = coordinator("stale-holder", lease.store);
    const replacement = coordinator("replacement-instance", lease.store);
    const staleWrite = vi.fn().mockResolvedValue(undefined);

    await staleHolder.run("mid-cycle operation", async () => {
      // The operation began while this holder owned the lease. Before it
      // reaches its next Google mutation, its TTL expires and the replacement
      // atomically claims the durable lease.
      lease.advance(90_001);
      expect(await replacement.tryClaimLease()).toBe(true);

      // This is the critical assertion: the stale holder's write is actively
      // rejected at the write boundary and the external writer is never called.
      await expect(staleHolder.fencedWrite("stale Google Sheets update", staleWrite))
        .rejects.toBeInstanceOf(WalkinSyncLeaseLostError);
      expect(staleWrite).not.toHaveBeenCalled();
    });
  });

  it("allows exactly one of two simultaneously starting instances to claim the lease", async () => {
    const lease = makeLeaseStore();
    const first = coordinator("first-instance", lease.store);
    const second = coordinator("second-instance", lease.store);

    const results = await Promise.all([
      first.tryClaimLease(),
      second.tryClaimLease(),
    ]);

    expect(results.filter(Boolean)).toHaveLength(1);
  });
});