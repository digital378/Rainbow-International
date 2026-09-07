/**
 * End-to-end happy-path tests for the RPS CRM dashboard data pipeline.
 *
 * Verifies that when the walkin_leads DB table has RPS leads:
 *   1. readCrmLeadsTrackerStats("RPS") identifies DB-only data correctly
 *   2. kpis.totalLeads > 0 (no silent zero-out)
 *   3. Individual KPIs (totalLeads, admissions, walkins, bookings) match
 *      a hand-counted synthetic dataset
 *   4. The `warning` field is absent (so the frontend banner does NOT render)
 *   5. brand field equals "RPS"
 *
 * No real database or Google Sheets calls are made; all I/O is mocked.
 *
 * NOTE: readCrmLeadsTrackerStats was migrated from reading Google Sheets
 * directly to reading the walkin_leads DB table (the single source of truth).
 * Tests here mock the Drizzle ORM select chain accordingly.
 *
 * Synthetic dataset — 12 rows, all in Jul-27:
 *
 *   idx0  OPEN
 *   idx1  WALK-IN BOOKED      → booking
 *   idx2  WALK-IN COMPLETED   → walkin
 *   idx3  ADMISSION DONE      → walkin + admission
 *   idx4  CLOSED
 *   idx5  WALK-IN BOOKED      → booking
 *   idx6  FOLLOW-UP
 *   idx7  WALK-IN COMPLETED   → walkin
 *   idx8  ADMISSION DONE      → walkin + admission
 *   idx9  OPEN
 *   idx10 CLOSED
 *   idx11 ADMISSION DONE      → walkin + admission
 *
 *   totalLeads = 12, bookings = 2, walkins = 5, admissions = 3
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
  // Other exports referenced at module load time
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

import { readCrmLeadsTrackerStats, bustCrmStatsCache } from "../server/walkinSheets";

// ── Synthetic DB rows ─────────────────────────────────────────────────────────
// Shape matches the columns selected in readCrmLeadsTrackerStats.
interface FakeLead {
  monthLabel: string;
  status: string;
  source: string;
  leadOwner: string;
  program: string;
  branchId: number | null;
}

const RPS_DB_ROWS: FakeLead[] = [
  { monthLabel: "Jul-27", status: "OPEN",               source: "Walk-In",  leadOwner: "Deepa",  program: "Nursery",   branchId: 1 },
  { monthLabel: "Jul-27", status: "WALK-IN BOOKED",     source: "Social",   leadOwner: "Kavita", program: "Junior KG", branchId: 1 },
  { monthLabel: "Jul-27", status: "WALK-IN COMPLETED",  source: "Referral", leadOwner: "Deepa",  program: "Senior KG", branchId: 1 },
  { monthLabel: "Jul-27", status: "ADMISSION DONE",     source: "Online",   leadOwner: "Kavita", program: "Class 1",   branchId: 1 },
  { monthLabel: "Jul-27", status: "CLOSED",             source: "Walk-In",  leadOwner: "Deepa",  program: "Nursery",   branchId: 1 },
  { monthLabel: "Jul-27", status: "WALK-IN BOOKED",     source: "Referral", leadOwner: "Kavita", program: "Junior KG", branchId: 1 },
  { monthLabel: "Jul-27", status: "FOLLOW-UP",          source: "Social",   leadOwner: "Deepa",  program: "Class 2",   branchId: 1 },
  { monthLabel: "Jul-27", status: "WALK-IN COMPLETED",  source: "Online",   leadOwner: "Kavita", program: "Senior KG", branchId: 1 },
  { monthLabel: "Jul-27", status: "ADMISSION DONE",     source: "Walk-In",  leadOwner: "Deepa",  program: "Nursery",   branchId: 1 },
  { monthLabel: "Jul-27", status: "OPEN",               source: "Social",   leadOwner: "Kavita", program: "Class 1",   branchId: 1 },
  { monthLabel: "Jul-27", status: "CLOSED",             source: "Referral", leadOwner: "Deepa",  program: "Junior KG", branchId: 1 },
  { monthLabel: "Jul-27", status: "ADMISSION DONE",     source: "Online",   leadOwner: "Kavita", program: "Class 2",   branchId: 1 },
];

// Hand-verified expected KPIs
const EXPECTED = {
  totalLeads:  12,
  bookings:     2,  // idx1, idx5  (WALK-IN BOOKED)
  walkins:      5,  // idx2, idx3, idx7, idx8, idx11  (WALK-IN COMPLETED + ADMISSION DONE)
  admissions:   3,  // idx3, idx8, idx11  (ADMISSION DONE)
};

// ── Test setup ────────────────────────────────────────────────────────────────
beforeEach(() => {
  mockDbSelect.mockClear();
  mockDbFrom.mockClear();
  mockDbWhere.mockClear();
  // Restore the default chain shape after any per-test overrides
  mockDbFrom.mockImplementation(() => ({ where: mockDbWhere }));
  mockDbSelect.mockImplementation(() => ({ from: mockDbFrom }));
  mockDbWhere.mockResolvedValue(RPS_DB_ROWS);
  bustCrmStatsCache();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("RPS CRM dashboard — happy path (DB populated)", () => {

  it("returns dataSource === 'database' when only DB data is available", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.dataSource).toBe("database");
    expect(stats.sourceHealth.database).toBe("available");
  });

  it("kpis.totalLeads is greater than zero", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.totalLeads).toBeGreaterThan(0);
  });

  it("totalLeads matches the DB row count", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.totalLeads).toBe(EXPECTED.totalLeads);
  });

  it("admissions matches ADMISSION DONE rows", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.admissions).toBe(EXPECTED.admissions);
  });

  it("walkins counts WALK-IN COMPLETED + ADMISSION DONE rows", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.walkins).toBe(EXPECTED.walkins);
  });

  it("bookings counts only WALK-IN BOOKED rows", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.bookings).toBe(EXPECTED.bookings);
  });

  it("warning field is absent when data is healthy (so frontend banner does not render)", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.warning).toBeUndefined();
  });

  it("brand field equals 'RPS'", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.brand).toBe("RPS");
  });

  it("queries the database (db.select is called)", async () => {
    await readCrmLeadsTrackerStats("RPS");
    expect(mockDbSelect).toHaveBeenCalled();
  });

  it("statusBreakdown totals equal totalLeads", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    const sum = stats.statusBreakdown.reduce((a, s) => a + s.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("monthly totals sum to totalLeads", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    const sum = stats.monthly.reduce((a, m) => a + m.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("all 12 rows land in Jul-27 (all monthLabels are Jul-27)", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.monthly).toEqual([{ month: "Jul-27", cnt: 12 }]);
  });
});

// ── Source-health banner condition mirroring the frontend guard ────────────────
describe("Source-health banner condition — frontend guard verification", () => {
  it("banner shows when supplementary figures are unavailable", async () => {
    const stats = await readCrmLeadsTrackerStats("RPS");
    const bannerShouldShow = stats.stale || stats.sourceHealth.supplementary === "unavailable";
    expect(bannerShouldShow).toBe(true);
    expect(stats.sourceHealth.warning).toBeTruthy();
  });

  it("cold-start zero data remains explicitly marked incomplete", async () => {
    mockDbWhere.mockResolvedValueOnce([]);
    const stats = await readCrmLeadsTrackerStats("RPS");
    const bannerShouldShow = stats.stale || stats.sourceHealth.supplementary === "unavailable";
    expect(bannerShouldShow).toBe(true);
    expect(stats.kpis.totalLeads).toBe(0);
  });
});
