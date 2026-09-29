import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ transaction: vi.fn() }));
vi.mock("../server/db", () => ({ db: { transaction: mocks.transaction } }));

import { walkinLeads, walkinLeadAuditLog, walkinSources, walkinSyncReconciliations } from "../shared/schema";
import { consolidateWalkinDigitalMarketingSources } from "../server/walkinSourceMigration";

describe("existing CRM source consolidation", () => {
  it("audits changes, hides separate source labels and requests incremental mirrors", async () => {
    const writes: Array<{ table: unknown; values: Record<string, unknown> }> = [];
    const updates: Array<{ table: unknown; values: Record<string, unknown> }> = [];
    const sourceRows = [
      { id: 1, label: "DM", brand: null, isActive: true },
      { id: 2, label: "GOOGLE", brand: null, isActive: true },
    ];
    const leadRows = [
      { id: "lead-1", brand: "RIS", source: "Google", isArchived: false },
      { id: "lead-2", brand: "RPS", source: "Meta", isArchived: true },
      { id: "lead-3", brand: "RIS", source: "Referral", isArchived: false },
    ];
    const tx = {
      select: () => ({
        from: (table: unknown) => table === walkinSources
          ? Promise.resolve(sourceRows)
          : { where: () => Promise.resolve(leadRows) },
      }),
      update: (table: unknown) => ({
        set: (values: Record<string, unknown>) => ({
          where: () => {
            updates.push({ table, values });
            return { returning: () => Promise.resolve([{ id: "lead-1" }]) };
          },
        }),
      }),
      insert: (table: unknown) => ({
        values: (values: Record<string, unknown>) => {
          writes.push({ table, values });
          return { onConflictDoUpdate: () => Promise.resolve() };
        },
      }),
    };
    mocks.transaction.mockImplementationOnce(async (fn: (transaction: typeof tx) => Promise<number>) => fn(tx));

    expect(await consolidateWalkinDigitalMarketingSources()).toBe(2);
    expect(updates.filter(item => item.table === walkinLeads).map(item => item.values.source))
      .toEqual(["DM", "DM"]);
    expect(updates.filter(item => item.table === walkinSources)).toHaveLength(1);
    expect(writes.filter(item => item.table === walkinLeadAuditLog).map(item => item.values.oldValue))
      .toEqual(["Google", "Meta"]);
    expect(writes.filter(item => item.table === walkinSyncReconciliations).map(item => item.values.scope))
      .toEqual(["RIS", "MASTER"]);
  });
});