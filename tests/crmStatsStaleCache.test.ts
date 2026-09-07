/**
 * Tests stale-cache fallback for readCrmLeadsTrackerStats.
 *
 * When the DB fetch throws (simulating a transient outage), the function
 * should return the last successfully cached value with `stale: true`.
 * If there is no prior cached data, the error should propagate so the
 * route returns a 500 rather than silently returning zeros.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Hoist mocks so they are available inside vi.mock() factories ─────────────
const mockWhere = vi.hoisted(() => vi.fn());
const mockFrom  = vi.hoisted(() => vi.fn());

vi.mock("../server/marketing2728Sheets", () => ({
  readMarketing2728Supplement: vi.fn().mockResolvedValue({
    leads: [],
    months: [],
    fetchedAt: "2026-09-07T10:00:00.000Z",
    available: true,
    mode: "oauth",
  }),
  supplementLeadKey: (lead: any) => [
    lead.enquiryDate ?? "",
    lead.phone ?? "",
    lead.childName ?? "",
  ].join("|"),
}));

vi.mock("../server/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: mockFrom,
    }),
  },
}));

vi.mock("../shared/schema", () => ({
  walkinLeads: {},
}));

// googleapis is imported at the top of walkinSheets.ts — provide a minimal stub.
vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: vi.fn(function (this: any) {
        this.setCredentials = vi.fn();
      }),
    },
    sheets: vi.fn(),
  },
}));

// drizzle operators used in the query — stubs are fine because the mock
// intercepts before any real DB evaluation occurs.
vi.mock("drizzle-orm", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    eq:  vi.fn((...a: any[]) => a),
    and: vi.fn((...a: any[]) => a),
  };
});

// ── Import under test (after mocks are registered) ───────────────────────────
import { readCrmLeadsTrackerStats, bustCrmStatsCache } from "../server/walkinSheets";

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeLeadRow(overrides: Partial<{
  monthLabel: string; status: string; source: string;
  leadOwner: string; program: string; branchId: number | null;
}> = {}) {
  return {
    monthLabel: "Jul-27",
    status:     "OPEN",
    source:     "DM",
    leadOwner:  "Priya",
    program:    "Class 1",
    branchId:   null,
    ...overrides,
  };
}

function resolveDb(rows: any[]) {
  mockFrom.mockReturnValue({ where: mockWhere });
  mockWhere.mockResolvedValue(rows);
}

function rejectDb(message = "Connection refused") {
  mockFrom.mockReturnValue({ where: mockWhere });
  mockWhere.mockRejectedValue(new Error(message));
}

// ── Setup ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  // Reset call history
  mockFrom.mockReset();
  mockWhere.mockReset();
  // Wipe the short-TTL cache before each test
  bustCrmStatsCache();
  // Default: healthy DB with no rows
  resolveDb([]);
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("readCrmLeadsTrackerStats — stale-cache fallback", () => {
  it("returns stale:true with last-known-good data when the DB fetch fails after a prior success", async () => {
    // 1. Warm with a healthy fetch (5 leads)
    resolveDb(Array.from({ length: 5 }, () => makeLeadRow()));
    const first = await readCrmLeadsTrackerStats("RIS", { bust: true });
    expect(first.kpis.totalLeads).toBe(5);
    expect(first.stale).toBeUndefined(); // fresh data must NOT be marked stale

    // 2. Bust the short-TTL cache (simulates TTL expiry or explicit admin bust)
    bustCrmStatsCache("RIS");

    // 3. DB goes down on the next fetch
    rejectDb("ECONNREFUSED: DB unreachable");

    // 4. Must return last-good data marked stale — not throw
    const staleResult = await readCrmLeadsTrackerStats("RIS", { bust: true });
    expect(staleResult.stale).toBe(true);
    expect(staleResult.kpis.totalLeads).toBe(5);
    expect(typeof staleResult.cachedAt).toBe("string");
  });

  it("propagates the error when there is no prior cached data (no silent zeros)", async () => {
    // DB is broken from the very first call — no last-good data exists yet
    rejectDb("ECONNREFUSED: DB unreachable");

    await expect(
      readCrmLeadsTrackerStats("RPS", { bust: true }),
    ).rejects.toThrow("ECONNREFUSED");
  });

  it("stale fallback is brand-scoped: RIS outage does not serve RPS stale data", async () => {
    // Warm only RIS
    resolveDb(Array.from({ length: 3 }, () => makeLeadRow()));
    await readCrmLeadsTrackerStats("RIS", { bust: true });

    bustCrmStatsCache("RIS");
    rejectDb("DB down");

    // RIS should fall back to stale
    const staleRis = await readCrmLeadsTrackerStats("RIS", { bust: true });
    expect(staleRis.stale).toBe(true);
    expect(staleRis.brand).toBe("RIS");

    // RPS has no prior data → error propagates
    await expect(
      readCrmLeadsTrackerStats("RPS", { bust: true }),
    ).rejects.toThrow("DB down");
  });

  it("returns fresh (non-stale) data once the DB recovers", async () => {
    // Phase 1: healthy fetch
    resolveDb(Array.from({ length: 2 }, () => makeLeadRow()));
    await readCrmLeadsTrackerStats("RIS", { bust: true });

    // Phase 2: DB outage
    bustCrmStatsCache("RIS");
    rejectDb("outage");
    const stale = await readCrmLeadsTrackerStats("RIS", { bust: true });
    expect(stale.stale).toBe(true);

    // Phase 3: DB recovers with 7 leads
    bustCrmStatsCache("RIS");
    resolveDb(Array.from({ length: 7 }, () => makeLeadRow()));
    const fresh = await readCrmLeadsTrackerStats("RIS", { bust: true });
    expect(fresh.stale).toBeUndefined();
    expect(fresh.kpis.totalLeads).toBe(7);
  });
});
