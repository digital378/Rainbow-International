import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "./db";

const LEASE_NAME = "walkin-sheets";
const LEASE_TTL_MS = 90_000;
const RENEW_INTERVAL_MS = 25_000;
const instanceId = `${process.pid}:${randomUUID()}`;

let isDraining = false;
let activeOperations = 0;
let drainWaiters: Array<() => void> = [];
let localOperationTail: Promise<void> = Promise.resolve();

export class WalkinSyncBusyError extends Error {
  constructor() {
    super("Another application instance is already synchronizing walk-in sheets");
    this.name = "WalkinSyncBusyError";
  }
}

function finishOperation() {
  activeOperations = Math.max(0, activeOperations - 1);
  if (activeOperations === 0) {
    for (const resolve of drainWaiters) resolve();
    drainWaiters = [];
  }
}

async function claimLease(): Promise<boolean> {
  const result = await db.execute<{ owner_id: string }>(sql`
    INSERT INTO walkin_sync_leases (lease_name, owner_id, expires_at, updated_at)
    VALUES (${LEASE_NAME}, ${instanceId}, NOW() + INTERVAL '90 seconds', NOW())
    ON CONFLICT (lease_name) DO UPDATE
      SET owner_id = EXCLUDED.owner_id,
          expires_at = EXCLUDED.expires_at,
          updated_at = NOW()
      WHERE walkin_sync_leases.expires_at < NOW()
         OR walkin_sync_leases.owner_id = ${instanceId}
    RETURNING owner_id
  `);
  return result.rows[0]?.owner_id === instanceId;
}

async function renewLease(): Promise<boolean> {
  const result = await db.execute<{ owner_id: string }>(sql`
    UPDATE walkin_sync_leases
    SET expires_at = NOW() + INTERVAL '90 seconds', updated_at = NOW()
    WHERE lease_name = ${LEASE_NAME} AND owner_id = ${instanceId}
    RETURNING owner_id
  `);
  return result.rows[0]?.owner_id === instanceId;
}

async function releaseLease(): Promise<void> {
  await db.execute(sql`
    UPDATE walkin_sync_leases
    SET expires_at = NOW(), updated_at = NOW()
    WHERE lease_name = ${LEASE_NAME} AND owner_id = ${instanceId}
  `);
}

/**
 * Runs one complete walk-in sheet operation while holding a durable lease.
 * An expired lease can be recovered by a replacement process; an active lease
 * prevents an Autoscale overlap from issuing competing sheet writes.
 */
export async function runWalkinSheetOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
): Promise<T> {
  let releaseLocalSlot!: () => void;
  const priorLocalOperation = localOperationTail;
  localOperationTail = new Promise<void>((resolve) => { releaseLocalSlot = resolve; });
  await priorLocalOperation;

  try {
    if (isDraining) {
      throw new Error("Walk-in synchronization is draining for shutdown");
    }
    if (!(await claimLease())) {
      throw new WalkinSyncBusyError();
    }

    activeOperations++;
    let leaseLost = false;
    const renewal = setInterval(() => {
      renewLease()
        .then((renewed) => {
          if (!renewed) leaseLost = true;
        })
        .catch(() => {
          leaseLost = true;
        });
    }, RENEW_INTERVAL_MS);
    renewal.unref?.();

    try {
      if (leaseLost || isDraining) {
        throw new Error(`Walk-in ${operationName} was stopped before external writes began`);
      }
      return await operation();
    } finally {
      clearInterval(renewal);
      try {
        await releaseLease();
      } catch (error: any) {
        console.error("[walkin/lease] Could not release lease:", error?.message);
      }
      finishOperation();
    }
  } finally {
    releaseLocalSlot();
  }
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