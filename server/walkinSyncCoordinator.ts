import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { assertDestinationWritable } from "./destinationReadOnly";

const LEASE_NAME = "walkin-sheets";
const LEASE_TTL_MS = 90_000;
const RENEW_INTERVAL_MS = 25_000;
const instanceId = `${process.pid}:${randomUUID()}`;

type LeaseStore = {
  claim(ownerId: string): Promise<boolean>;
  renew(ownerId: string): Promise<boolean>;
  release(ownerId: string): Promise<void>;
  isHeld(ownerId: string): Promise<boolean>;
};

type WalkinLeaseCoordinatorOptions = {
  ownerId: string;
  store: LeaseStore;
  shouldDrain?: () => boolean;
  renewIntervalMs?: number;
};

export class WalkinSyncBusyError extends Error {
  constructor() {
    super("Another application instance is already synchronizing walk-in sheets");
    this.name = "WalkinSyncBusyError";
  }
}

/** Thrown before an external Sheets mutation when this instance no longer owns the lease. */
export class WalkinSyncLeaseLostError extends Error {
  constructor(writeName: string) {
    super(`Walk-in sheet write rejected: lease was lost before ${writeName}`);
    this.name = "WalkinSyncLeaseLostError";
  }
}

/**
 * Owns one durable walk-in Sheets lease. The lease is checked again immediately
 * before every external mutation rather than only when a sync cycle starts.
 *
 * The injected store keeps failure behaviour deterministic in tests while the
 * production singleton below uses PostgreSQL for cross-instance coordination.
 */
export class WalkinLeaseCoordinator {
  private leaseActive = false;
  private leaseLost = false;

  constructor(private readonly options: WalkinLeaseCoordinatorOptions) {}

  async tryClaimLease(): Promise<boolean> {
    const claimed = await this.options.store.claim(this.options.ownerId);
    if (claimed) {
      this.leaseActive = true;
      this.leaseLost = false;
    }
    return claimed;
  }

  /**
   * Fences a single external mutation. A stale holder cannot begin its next
   * Sheets write after another instance has claimed the expired lease.
   */
  async fencedWrite<T>(writeName: string, write: () => Promise<T>): Promise<T> {
    if (!this.leaseActive || this.leaseLost || !(await this.options.store.isHeld(this.options.ownerId))) {
      this.leaseLost = true;
      throw new WalkinSyncLeaseLostError(writeName);
    }
    return write();
  }

  async run<T>(operationName: string, operation: () => Promise<T>): Promise<T> {
    if (this.options.shouldDrain?.()) {
      throw new Error("Walk-in synchronization is draining for shutdown");
    }
    if (!(await this.tryClaimLease())) {
      throw new WalkinSyncBusyError();
    }

    const renewal = setInterval(() => {
      this.options.store.renew(this.options.ownerId)
        .then((renewed) => {
          if (!renewed) this.leaseLost = true;
        })
        .catch(() => {
          this.leaseLost = true;
        });
    }, this.options.renewIntervalMs ?? RENEW_INTERVAL_MS);
    renewal.unref?.();

    try {
      return await operation();
    } finally {
      clearInterval(renewal);
      this.leaseActive = false;
      try {
        await this.options.store.release(this.options.ownerId);
      } catch (error: any) {
        console.error("[walkin/lease] Could not release lease:", error?.message);
      }
    }
  }
}

const postgresLeaseStore: LeaseStore = {
  async claim(ownerId) {
    const result = await db.execute<{ owner_id: string }>(sql`
      INSERT INTO walkin_sync_leases (lease_name, owner_id, expires_at, updated_at)
      VALUES (${LEASE_NAME}, ${ownerId}, NOW() + INTERVAL '90 seconds', NOW())
      ON CONFLICT (lease_name) DO UPDATE
        SET owner_id = EXCLUDED.owner_id,
            expires_at = EXCLUDED.expires_at,
            updated_at = NOW()
        WHERE walkin_sync_leases.expires_at < NOW()
           OR walkin_sync_leases.owner_id = ${ownerId}
      RETURNING owner_id
    `);
    return result.rows[0]?.owner_id === ownerId;
  },

  async renew(ownerId) {
    const result = await db.execute<{ owner_id: string }>(sql`
      UPDATE walkin_sync_leases
      SET expires_at = NOW() + INTERVAL '90 seconds', updated_at = NOW()
      WHERE lease_name = ${LEASE_NAME}
        AND owner_id = ${ownerId}
        AND expires_at > NOW()
      RETURNING owner_id
    `);
    return result.rows[0]?.owner_id === ownerId;
  },

  async release(ownerId) {
    await db.execute(sql`
      UPDATE walkin_sync_leases
      SET expires_at = NOW(), updated_at = NOW()
      WHERE lease_name = ${LEASE_NAME} AND owner_id = ${ownerId}
    `);
  },

  async isHeld(ownerId) {
    const result = await db.execute<{ owner_id: string }>(sql`
      SELECT owner_id
      FROM walkin_sync_leases
      WHERE lease_name = ${LEASE_NAME}
        AND owner_id = ${ownerId}
        AND expires_at > NOW()
    `);
    return result.rows[0]?.owner_id === ownerId;
  },
};

let isDraining = false;
let activeOperations = 0;
let drainWaiters: Array<() => void> = [];
let localOperationTail: Promise<void> = Promise.resolve();

const coordinator = new WalkinLeaseCoordinator({
  ownerId: instanceId,
  store: postgresLeaseStore,
  shouldDrain: () => isDraining,
});

function finishOperation() {
  activeOperations = Math.max(0, activeOperations - 1);
  if (activeOperations === 0) {
    for (const resolve of drainWaiters) resolve();
    drainWaiters = [];
  }
}

/**
 * Runs one complete walk-in sheet operation while holding a durable lease.
 * Local serialization complements the durable lease for concurrent requests
 * handled by the same application process.
 */
export async function runWalkinSheetOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
): Promise<T> {
  assertDestinationWritable(operationName);

  let releaseLocalSlot!: () => void;
  const priorLocalOperation = localOperationTail;
  localOperationTail = new Promise<void>((resolve) => { releaseLocalSlot = resolve; });
  await priorLocalOperation;

  try {
    activeOperations++;
    return await coordinator.run(operationName, operation);
  } finally {
    finishOperation();
    releaseLocalSlot();
  }
}

/**
 * The only allowed gateway for a Google Sheets mutation in the walk-in sync.
 * It revalidates ownership at the point of writing, so a stale operation
 * fails before its next external write and leaves its reconciliation marker.
 */
export async function fencedWalkinSheetWrite<T>(
  writeName: string,
  write: () => Promise<T>,
): Promise<T> {
  assertDestinationWritable(writeName);
  return coordinator.fencedWrite(writeName, write);
}

export function beginWalkinSyncShutdown(): void {
  isDraining = true;
}

export function isWalkinSyncDraining(): boolean {
  return isDraining;
}

export async function waitForWalkinSyncDrain(timeoutMs = 25_000): Promise<boolean> {
  if (activeOperations === 0) return true;
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(false), timeoutMs);
    drainWaiters.push(() => {
      clearTimeout(timeout);
      resolve(true);
    });
  });
}