/**
 * Integration test: CRM stats cache behaviour — website enquiry and callback-request paths.
 *
 * Confirms that:
 *   1. `readCrmLeadsTrackerStats` serves a cached result on a second call
 *      (no extra DB query is made within the TTL).
 *   2. `bustCrmStatsCache` — called by /api/inquiries and /api/callback-requests
 *      after appending — invalidates that cache entry.
 *   3. The very next `readCrmLeadsTrackerStats` call makes a fresh DB query
 *      instead of returning the stale cached result.
 *
 * No real database or Google Sheets calls are made; all external I/O is mocked.
 *
 * NOTE: readCrmLeadsTrackerStats was migrated from reading Google Sheets
 * directly to reading the walkin_leads DB table. Mocks reflect the Drizzle
 * ORM select chain rather than the Sheets API.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Hoist DB mock spies ───────────────────────────────────────────────────────
const mockDbWhere  = vi.hoisted(() => vi.fn());
const mockDbFrom   = vi.hoisted(() => vi.fn(() => ({ where: mockDbWhere })));
const mockDbSelect = vi.hoisted(() => vi.fn(() => ({ from: mockDbFrom })));

// ── Module mocks ──────────────────────────────────────────────────────────────
vi.mock("../server/db", () => ({
  db: { select: mockDbSelect },
}));

vi.mock("../shared/schema", () => ({
  walkinLeads: {
    monthLabel:   "monthLabel",
    status:       "status",
    source:       "source",
    leadOwner:    "leadOwner",
    program:      "program",
    branchId:     "branchId",
    brand:        "brand",
    academicYear: "academicYear",
    isArchived:   "isArchived",
  },
  walkinBranches:      {},
  walkinLeadAuditLog:  {},
  walkinStatuses:      {},
  walkinCloseReasons:  {},
  walkinPrograms:      {},
  walkinSources:       {},
  walkinStaff:         {},
}));

vi.mock("drizzle-orm", () => ({
  eq:     vi.fn(),
  and:    vi.fn(),
  or:     vi.fn(),
  isNull: vi.fn(),
  sql:    vi.fn(),
}));

vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: vi.fn(function (this: any) {
        this.setCredentials = vi.fn();
      }),
    },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: { values: { get: vi.fn() } },
    }),
  },
}));

// ── Import after mocks are in place ──────────────────────────────────────────
import { readCrmLeadsTrackerStats, bustCrmStatsCache } from "../server/walkinSheets";

// ── Helper: build N fake DB lead rows ────────────────────────────────────────
function makeDbRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    monthLabel:  "Jul-27",
    status:      "OPEN",
    source:      "Walk-In",
    leadOwner:   `Owner ${i + 1}`,
    program:     "Class 1",
    branchId:    1,
  }));
}

// ── Test setup ────────────────────────────────────────────────────────────────
beforeEach(() => {
  mockDbSelect.mockClear();
  mockDbFrom.mockClear();
  mockDbWhere.mockClear();
  mockDbFrom.mockImplementation(() => ({ where: mockDbWhere }));
  mockDbSelect.mockImplementation(() => ({ from: mockDbFrom }));
  // Default: return 3 rows
  mockDbWhere.mockResolvedValue(makeDbRows(3));
  bustCrmStatsCache();
});

// ── Tests: website-enquiry path ───────────────────────────────────────────────
describe("CRM stats cache-bust after website enquiry", () => {

  it("caches the result so a second call within the TTL skips the DB query", async () => {
    // First call: cache miss → DB queried once
    const first = await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(1);
    expect(first.kpis.totalLeads).toBe(3);

    // Second call: cache hit → DB NOT queried again
    const second = await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(1); // still 1, no new call
    expect(second.kpis.totalLeads).toBe(3);
  });

  it("bustCrmStatsCache forces a fresh DB fetch on the next readCrmLeadsTrackerStats call", async () => {
    // First response: 3 leads (before enquiry)
    // Second response: 4 leads (after enquiry appended)
    mockDbWhere
      .mockResolvedValueOnce(makeDbRows(3))
      .mockResolvedValueOnce(makeDbRows(4));

    // Warm the cache
    const before = await readCrmLeadsTrackerStats("RIS");
    expect(before.kpis.totalLeads).toBe(3);
    expect(mockDbWhere).toHaveBeenCalledTimes(1);

    // Simulate what /api/inquiries does after a new lead is created
    bustCrmStatsCache("RIS");

    // Next call must NOT serve the stale cached value; it must re-fetch
    const after = await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2); // second DB call made
    expect(after.kpis.totalLeads).toBe(4);        // fresh data returned
  });

  it("bustCrmStatsCache for RIS does not invalidate the RPS cache entry", async () => {
    mockDbWhere.mockResolvedValue(makeDbRows(5));

    // Warm both brand caches
    await readCrmLeadsTrackerStats("RIS");
    await readCrmLeadsTrackerStats("RPS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2);

    // Bust only RIS
    bustCrmStatsCache("RIS");

    // RPS should still be cached → no new DB call
    await readCrmLeadsTrackerStats("RPS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2); // unchanged

    // RIS should make a fresh call
    await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(3); // +1 for fresh RIS fetch
  });

  it("bustCrmStatsCache with no argument clears all brand caches", async () => {
    mockDbWhere.mockResolvedValue(makeDbRows(2));

    // Warm both
    await readCrmLeadsTrackerStats("RIS");
    await readCrmLeadsTrackerStats("RPS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2);

    // Bust all
    bustCrmStatsCache();

    // Both should re-fetch
    await readCrmLeadsTrackerStats("RIS");
    await readCrmLeadsTrackerStats("RPS");
    expect(mockDbWhere).toHaveBeenCalledTimes(4);
  });

  it("returns fresh data after bust even when called back-to-back (no in-flight coalescing issue)", async () => {
    mockDbWhere
      .mockResolvedValueOnce(makeDbRows(6))
      .mockResolvedValueOnce(makeDbRows(7));

    // Call 1: populates cache
    await readCrmLeadsTrackerStats("RIS");

    // Bust (as the inquiries route does)
    bustCrmStatsCache("RIS");

    // Call 2 immediately after bust — must trigger a real fetch
    const result = await readCrmLeadsTrackerStats("RIS");
    expect(result.kpis.totalLeads).toBe(7);
    expect(mockDbWhere).toHaveBeenCalledTimes(2);
  });
});

// ── Tests: callback-request path ─────────────────────────────────────────────
//
// The /api/callback-requests handler atomically inserts into callback_requests
// and walkin_leads (in a DB transaction), then calls bustCrmStatsCache("RIS").
//
// These tests confirm the cache-bust pattern used by that route actually
// invalidates the CRM stats cache so the next dashboard read returns fresh data.
describe("CRM stats cache-bust after callback request", () => {
  it("cache is invalidated when bustCrmStatsCache fires after the DB transaction commits", async () => {
    // Before: 2 leads; after the walkin_leads row is committed: 3 leads
    mockDbWhere
      .mockResolvedValueOnce(makeDbRows(2))
      .mockResolvedValueOnce(makeDbRows(3));

    // Warm the cache (state before the callback request)
    const before = await readCrmLeadsTrackerStats("RIS");
    expect(before.kpis.totalLeads).toBe(2);
    expect(mockDbWhere).toHaveBeenCalledTimes(1);

    // Simulate what /api/callback-requests does after the transaction commits
    bustCrmStatsCache("RIS");

    // The next /api/walkin/crm-stats read must NOT serve the stale cached value
    const after = await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2); // fresh DB query made
    expect(after.kpis.totalLeads).toBe(3);        // updated total returned
  });

  it("callback-request bust does not invalidate the RPS cache (brand isolation)", async () => {
    mockDbWhere.mockResolvedValue(makeDbRows(4));

    // Warm both brand caches
    await readCrmLeadsTrackerStats("RIS");
    await readCrmLeadsTrackerStats("RPS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2);

    // Callback request only busts RIS (the route always calls bustCrmStatsCache("RIS"))
    bustCrmStatsCache("RIS");

    // RPS cache should still be valid — no extra DB query
    await readCrmLeadsTrackerStats("RPS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2);

    // RIS must re-fetch
    await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(3);
  });

  it("dashboard total reflects the new callback-request lead on the very next read after bust", async () => {
    // 5 leads before and 6 after a callback request is committed
    mockDbWhere
      .mockResolvedValueOnce(makeDbRows(5))
      .mockResolvedValueOnce(makeDbRows(6));

    await readCrmLeadsTrackerStats("RIS"); // warm cache

    bustCrmStatsCache("RIS");

    const fresh = await readCrmLeadsTrackerStats("RIS");
    expect(fresh.kpis.totalLeads).toBe(6);
    expect(mockDbWhere).toHaveBeenCalledTimes(2);
  });
});

// ── Tests: generation guard — stale in-flight fetch cannot overwrite fresh cache ─
//
// Scenario: a cache-miss fetch starts (deferred), a bust fires (insert committed),
// a fresh fetch starts and settles with the new total, then the original deferred
// fetch finally resolves with the stale total.
//
// The generation counter in bustCrmStatsCache / readCrmLeadsTrackerStats ensures
// the stale result is discarded and the fresh result stays in cache.
describe("Generation guard — stale in-flight fetch discarded after bust", () => {
  it("stale pre-bust in-flight fetch settling after a bust cannot overwrite the fresh post-bust cache result", async () => {
    // -- Step 1: warm the cache --
    mockDbWhere.mockResolvedValueOnce(makeDbRows(3));
    await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(1);

    // -- Step 2: bust (generation 0 → 1), starting a deferred stale re-fetch --
    bustCrmStatsCache("RIS");

    let resolveStale!: (rows: ReturnType<typeof makeDbRows>) => void;
    const staleReadPending = new Promise<ReturnType<typeof makeDbRows>>(
      (resolve) => { resolveStale = resolve; }
    );
    mockDbWhere.mockReturnValueOnce(staleReadPending); // paused — won't resolve yet

    // Start the stale read (generation=1) — hangs waiting for staleReadPending
    const staleReadPromise = readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2); // deferred DB query started

    // -- Step 3: second bust (generation 1 → 2), simulating the callback route
    //    committing its transaction and calling bustCrmStatsCache("RIS") --
    bustCrmStatsCache("RIS");

    // -- Step 4: fresh post-bust read resolves immediately with 4 leads --
    mockDbWhere.mockResolvedValueOnce(makeDbRows(4));
    const fresh = await readCrmLeadsTrackerStats("RIS");
    expect(fresh.kpis.totalLeads).toBe(4); // fresh result
    expect(mockDbWhere).toHaveBeenCalledTimes(3); // three DB queries so far

    // -- Step 5: resolve the stale read with the pre-insert total --
    resolveStale(makeDbRows(3));
    await staleReadPromise; // wait for it to finish processing

    // -- Step 6: cache must still hold the fresh result (4, not 3) --
    const cached = await readCrmLeadsTrackerStats("RIS");
    expect(cached.kpis.totalLeads).toBe(4);        // stale overwrite prevented
    expect(mockDbWhere).toHaveBeenCalledTimes(3);   // no new DB query (still cached)
  });
});
