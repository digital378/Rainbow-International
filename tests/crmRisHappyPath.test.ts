/**
 * End-to-end happy-path tests for the RIS CRM dashboard data pipeline.
 *
 * Mirrors crmRpsHappyPath.test.ts for the RIS brand.
 *
 * Verifies that when the walkin_leads DB table has RIS leads:
 *   1. readCrmLeadsTrackerStats("RIS") reports DB-only source health in tests
 *   2. kpis.totalLeads > 0 (no silent zero-out)
 *   3. Individual KPIs (totalLeads, admissions, walkins, bookings) match
 *      a hand-counted synthetic dataset
 *   4. The `warning` field is absent (so the frontend banner does NOT render)
 *   5. brand field equals "RIS"
 *
 * No real database or Google Sheets calls are made; all I/O is mocked.
 *
 * NOTE: readCrmLeadsTrackerStats reads the walkin_leads DB table (the single
 * source of truth), not the Google Sheet directly.  The RIS sheet column
 * layout (Status at [6], no Centre column) is irrelevant here — KPIs are
 * derived from the DB status field, not raw sheet columns.
 *
 * Synthetic dataset — 12 rows, all in Aug-26 (current academic year):
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
// RIS-specific programs reflect the real grade range (Pre-Nursery through Class 12).
interface FakeLead {
  monthLabel: string;
  status: string;
  source: string;
  leadOwner: string;
  program: string;
  branchId: number | null;
}

const RIS_DB_ROWS: FakeLead[] = [
  // idx0  OPEN
  { monthLabel: "Aug-26", status: "OPEN",              source: "Walk-In",   leadOwner: "Anjali",  program: "Jr. KG",    branchId: 2 },
  // idx1  WALK-IN BOOKED → booking
  { monthLabel: "Aug-26", status: "WALK-IN BOOKED",    source: "Social",    leadOwner: "Priya",   program: "Nursery",   branchId: 2 },
  // idx2  WALK-IN COMPLETED → walkin
  { monthLabel: "Aug-26", status: "WALK-IN COMPLETED", source: "Referral",  leadOwner: "Anjali",  program: "Sr. KG",    branchId: 2 },
  // idx3  ADMISSION DONE → walkin + admission
  { monthLabel: "Aug-26", status: "ADMISSION DONE",    source: "Online",    leadOwner: "Priya",   program: "Class 1",   branchId: 2 },
  // idx4  CLOSED
  { monthLabel: "Aug-26", status: "CLOSED",            source: "Walk-In",   leadOwner: "Anjali",  program: "Pre-Nursery", branchId: 2 },
  // idx5  WALK-IN BOOKED → booking
  { monthLabel: "Aug-26", status: "WALK-IN BOOKED",    source: "Referral",  leadOwner: "Priya",   program: "Jr. KG",    branchId: 2 },
  // idx6  FOLLOW-UP
  { monthLabel: "Aug-26", status: "FOLLOW-UP",         source: "Social",    leadOwner: "Anjali",  program: "Class 3",   branchId: 2 },
  // idx7  WALK-IN COMPLETED → walkin
  { monthLabel: "Aug-26", status: "WALK-IN COMPLETED", source: "Online",    leadOwner: "Priya",   program: "Sr. KG",    branchId: 2 },
  // idx8  ADMISSION DONE → walkin + admission
  { monthLabel: "Aug-26", status: "ADMISSION DONE",    source: "Walk-In",   leadOwner: "Anjali",  program: "Nursery",   branchId: 2 },
  // idx9  OPEN
  { monthLabel: "Aug-26", status: "OPEN",              source: "Social",    leadOwner: "Priya",   program: "Class 2",   branchId: 2 },
  // idx10 CLOSED
  { monthLabel: "Aug-26", status: "CLOSED",            source: "Referral",  leadOwner: "Anjali",  program: "Class 5",   branchId: 2 },
  // idx11 ADMISSION DONE → walkin + admission
  { monthLabel: "Aug-26", status: "ADMISSION DONE",    source: "Online",    leadOwner: "Priya",   program: "Class 4",   branchId: 2 },
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
  mockDbFrom.mockImplementation(() => ({ where: mockDbWhere }));
  mockDbSelect.mockImplementation(() => ({ from: mockDbFrom }));
  mockDbWhere.mockResolvedValue(RIS_DB_ROWS);
  bustCrmStatsCache();
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("RIS CRM dashboard — happy path (DB populated)", () => {

  it("returns dataSource === 'database' when the supplementary source is unavailable", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.dataSource).toBe("database");
    expect(stats.sourceHealth.supplementary).toBe("unavailable");
  });

  it("kpis.totalLeads is greater than zero", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.kpis.totalLeads).toBeGreaterThan(0);
  });

  it("totalLeads matches the DB row count", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.kpis.totalLeads).toBe(EXPECTED.totalLeads);
  });

  it("admissions matches ADMISSION DONE rows", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.kpis.admissions).toBe(EXPECTED.admissions);
  });

  it("walkins counts WALK-IN COMPLETED + ADMISSION DONE rows", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.kpis.walkins).toBe(EXPECTED.walkins);
  });

  it("bookings counts only WALK-IN BOOKED rows", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.kpis.bookings).toBe(EXPECTED.bookings);
  });

  it("warning field is absent when data is healthy (so frontend banner does not render)", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.warning).toBeUndefined();
  });

  it("brand field equals 'RIS'", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.brand).toBe("RIS");
  });

  it("queries the database (db.select is called)", async () => {
    await readCrmLeadsTrackerStats("RIS");
    expect(mockDbSelect).toHaveBeenCalled();
  });

  it("statusBreakdown totals equal totalLeads", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    const sum = stats.statusBreakdown.reduce((a, s) => a + s.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("monthly totals sum to totalLeads", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    const sum = stats.monthly.reduce((a, m) => a + m.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("all 12 rows land in Aug-26 (all monthLabels are Aug-26)", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    expect(stats.monthly).toEqual([{ month: "Aug-26", cnt: 12 }]);
  });

  it("bySource totals equal totalLeads", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    const sum = stats.bySource.reduce((a, s) => a + s.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("byProgram totals equal totalLeads", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    const sum = stats.byProgram.reduce((a, p) => a + p.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("byCounsellor walkins sum equals kpis.walkins", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    const sum = stats.byCounsellor.reduce((a, c) => a + c.walkins, 0);
    expect(sum).toBe(stats.kpis.walkins);
  });

  it("byCounsellor admissions sum equals kpis.admissions", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    const sum = stats.byCounsellor.reduce((a, c) => a + c.admissions, 0);
    expect(sum).toBe(stats.kpis.admissions);
  });
});

// ── Source-health banner condition mirroring the frontend TSX guard ────────────
describe("RIS source-health banner condition — frontend guard verification", () => {

  it("banner shows when supplementary figures are unavailable", async () => {
    const stats = await readCrmLeadsTrackerStats("RIS");
    const bannerShouldShow = stats.stale || stats.sourceHealth.supplementary === "unavailable";
    expect(bannerShouldShow).toBe(true);
    expect(stats.sourceHealth.warning).toBeTruthy();
  });

  it("cold-start zero data remains explicitly marked incomplete", async () => {
    mockDbWhere.mockResolvedValueOnce([]);
    const stats = await readCrmLeadsTrackerStats("RIS");
    const bannerShouldShow = stats.stale || stats.sourceHealth.supplementary === "unavailable";
    expect(bannerShouldShow).toBe(true);
    expect(stats.kpis.totalLeads).toBe(0);
  });

  it("result is consistent between two calls within the cache TTL", async () => {
    const first  = await readCrmLeadsTrackerStats("RIS");
    const second = await readCrmLeadsTrackerStats("RIS");
    // Second call is served from cache — DB queried only once
    expect(mockDbSelect).toHaveBeenCalledTimes(1);
    expect(second.kpis.totalLeads).toBe(first.kpis.totalLeads);
    expect(second.dataSource).toBe("database");
  });
});
