/**
 * End-to-end happy-path tests for the RPS CRM dashboard data pipeline.
 *
 * Verifies that when the "CRM Leads Tracker" tab in the RPS Google Sheet
 * exists and has data rows:
 *   1. readCrmLeadsTrackerStats("RPS") returns dataSource === "sheet"
 *   2. kpis.totalLeads > 0 (no silent zero-out)
 *   3. Individual KPIs (totalLeads, admissions, walkins, bookings) match
 *      a hand-counted synthetic sheet
 *   4. The `warning` field is absent (so the frontend banner does NOT render)
 *   5. The RPS sheet ID env-var path (RPS_WALKIN_SHEET_ID_2728) is wired
 *      correctly through getSheetId() → the Sheets API call
 *
 * No real Google Sheets or database calls are made; all I/O is mocked.
 *
 * Column layout used (0-based, matching the live "CRM Leads Tracker" tab):
 *   [0] Date  [1] Time  [2] Parent  [3] Child  [4] Phone  [5] Program
 *   [6] Status  [7] Remark  [8] Lead Owner  [9] Source
 *   [10] Walk-In Date  [11] Revisit Date  [12] Email ID
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Hoist mocks ──────────────────────────────────────────────────────────────
const mockSheetsGet = vi.hoisted(() => vi.fn());
const mockOAuth2Constructor = vi.hoisted(() =>
  vi.fn(function (this: any) {
    this.setCredentials = vi.fn();
  })
);

vi.mock("googleapis", () => ({
  google: {
    auth: { OAuth2: mockOAuth2Constructor },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: { values: { get: mockSheetsGet } },
    }),
  },
}));
vi.mock("../server/db", () => ({ db: {} }));
vi.mock("../shared/schema", () => ({}));

import { readCrmLeadsTrackerStats, bustCrmStatsCache } from "../server/walkinSheets";

// ── Synthetic RPS sheet content ──────────────────────────────────────────────
// 12 data rows modelled on a real RPS "CRM Leads Tracker" tab.
// Expected counts (manually verified):
//   totalLeads  = 12   (all rows have a non-blank Date)
//   admissions  =  3   (ADMISSION DONE rows: idx3, idx7, idx10)
//   walkins     =  5   (WALK-IN COMPLETED idx2, idx6, idx9  + ADMISSION DONE idx3, idx7, idx10 = 5 walkins; wait, let me re-count)
//   bookings    =  2   (WALK-IN BOOKED rows: idx1, idx5)
//
// Walkins = WALK-IN COMPLETED + ADMISSION DONE
//   WALK-IN COMPLETED: idx2, idx6, idx9  → 3 rows
//   ADMISSION DONE:    idx3, idx7, idx10 → 3 rows
//   total walkins = 6... let me re-count carefully:
//
// idx0  OPEN
// idx1  WALK-IN BOOKED      → booking
// idx2  WALK-IN COMPLETED   → walkin
// idx3  ADMISSION DONE      → walkin + admission
// idx4  CLOSED
// idx5  WALK-IN BOOKED      → booking
// idx6  FOLLOW-UP
// idx7  WALK-IN COMPLETED   → walkin
// idx8  ADMISSION DONE      → walkin + admission
// idx9  OPEN
// idx10 CLOSED
// idx11 ADMISSION DONE      → walkin + admission
//
// totalLeads = 12, bookings = 2, walkins = 5 (idx2+idx3+idx7+idx8+idx11),
// admissions = 3 (idx3, idx8, idx11)

const RPS_HEADER = [
  "Date", "Time", "Parent Name", "Child Name", "Phone", "Program",
  "Status", "Remark", "Lead Owner", "Source", "Walk-In Date", "Revisit Date", "Email",
];

const RPS_DATA_ROWS: string[][] = [
  // idx0
  ["01/07/2027", "09:00", "Anjali Mehta",   "Riya M",    "9000000001", "Nursery",   "OPEN",               "", "Deepa",  "Walk-In",  "",           "", ""],
  // idx1
  ["02/07/2027", "10:00", "Suresh Rao",     "Arjun R",   "9000000002", "Junior KG", "WALK-IN BOOKED",     "", "Kavita", "Social",   "",           "", ""],
  // idx2
  ["03/07/2027", "11:00", "Priya Nair",     "Anaya N",   "9000000003", "Senior KG", "WALK-IN COMPLETED",  "", "Deepa",  "Referral", "05/07/2027", "", ""],
  // idx3
  ["04/07/2027", "12:00", "Mohan Das",      "Dev D",     "9000000004", "Class 1",   "ADMISSION DONE",     "", "Kavita", "Online",   "06/07/2027", "", ""],
  // idx4
  ["05/07/2027", "13:00", "Lata Pillai",    "Sneha P",   "9000000005", "Nursery",   "CLOSED",             "", "Deepa",  "Walk-In",  "",           "", ""],
  // idx5
  ["06/07/2027", "14:00", "Rahul Iyer",     "Meera I",   "9000000006", "Junior KG", "WALK-IN BOOKED",     "", "Kavita", "Referral", "",           "", ""],
  // idx6
  ["07/07/2027", "09:30", "Sunita Verma",   "Karan V",   "9000000007", "Class 2",   "FOLLOW-UP",          "", "Deepa",  "Social",   "",           "", ""],
  // idx7
  ["08/07/2027", "10:30", "Ganesh Sharma",  "Pooja S",   "9000000008", "Senior KG", "WALK-IN COMPLETED",  "", "Kavita", "Online",   "09/07/2027", "", ""],
  // idx8
  ["09/07/2027", "11:30", "Rekha Gupta",    "Rohan G",   "9000000009", "Nursery",   "ADMISSION DONE",     "", "Deepa",  "Walk-In",  "10/07/2027", "", ""],
  // idx9
  ["10/07/2027", "12:30", "Vikram Singh",   "Tanvi S",   "9000000010", "Class 1",   "OPEN",               "", "Kavita", "Social",   "",           "", ""],
  // idx10
  ["11/07/2027", "13:30", "Nandita Joshi",  "Aditya J",  "9000000011", "Junior KG", "CLOSED",             "", "Deepa",  "Referral", "",           "", ""],
  // idx11
  ["12/07/2027", "14:30", "Prakash Kumar",  "Preethi K", "9000000012", "Class 2",   "ADMISSION DONE",     "", "Kavita", "Online",   "13/07/2027", "", ""],
];

// Hand-verified expected KPIs
const EXPECTED = {
  totalLeads:  12,
  bookings:     2,  // idx1 (WALK-IN BOOKED), idx5 (WALK-IN BOOKED)
  walkins:      5,  // idx2 (WIC), idx3 (AD), idx7 (WIC), idx8 (AD), idx11 (AD)
  admissions:   3,  // idx3, idx8, idx11 (ADMISSION DONE)
};

function makeFakeRpsResponse() {
  return { data: { values: [RPS_HEADER, ...RPS_DATA_ROWS] } };
}

// ── Test setup ───────────────────────────────────────────────────────────────
beforeEach(() => {
  process.env.GOOGLE_REFRESH_TOKEN     = "test-refresh-token";
  process.env.GOOGLE_CLIENT_ID         = "test-client-id";
  process.env.GOOGLE_CLIENT_SECRET     = "test-client-secret";
  process.env.RPS_WALKIN_SHEET_ID_2728 = "test-sheet-id-rps";
  mockSheetsGet.mockReset();
  bustCrmStatsCache();
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("RPS CRM dashboard — happy path (sheet tab populated)", () => {

  it("returns dataSource === 'sheet' when the tab has data rows", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.dataSource).toBe("sheet");
  });

  it("kpis.totalLeads is greater than zero", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.totalLeads).toBeGreaterThan(0);
  });

  it("totalLeads matches the non-blank row count in the sheet", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.totalLeads).toBe(EXPECTED.totalLeads);
  });

  it("admissions matches ADMISSION DONE rows", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.admissions).toBe(EXPECTED.admissions);
  });

  it("walkins counts WALK-IN COMPLETED + ADMISSION DONE rows", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.walkins).toBe(EXPECTED.walkins);
  });

  it("bookings counts only WALK-IN BOOKED rows", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.kpis.bookings).toBe(EXPECTED.bookings);
  });

  it("warning field is absent when data is healthy (so frontend banner does not render)", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.warning).toBeUndefined();
  });

  it("brand field equals 'RPS'", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.brand).toBe("RPS");
  });

  it("uses the RPS sheet ID env-var (RPS_WALKIN_SHEET_ID_2728) for the API call", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    await readCrmLeadsTrackerStats("RPS");
    expect(mockSheetsGet).toHaveBeenCalledWith(
      expect.objectContaining({ spreadsheetId: "test-sheet-id-rps" })
    );
  });

  it("statusBreakdown totals equal totalLeads", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    const sum = stats.statusBreakdown.reduce((a, s) => a + s.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("monthly totals sum to totalLeads", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    const sum = stats.monthly.reduce((a, m) => a + m.cnt, 0);
    expect(sum).toBe(stats.kpis.totalLeads);
  });

  it("all 12 rows land in Jul-27 (all dates are in July 2027)", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.monthly).toEqual([{ month: "Jul-27", cnt: 12 }]);
  });
});

// ── Warning-banner condition mirroring the frontend guard ────────────────────
// The dashboard renders the banner when:
//   data.dataSource && data.dataSource !== "sheet" && data.warning
// These tests confirm the condition is correctly absent for the happy path
// and correctly set for the two unhealthy states.
describe("Warning banner condition — frontend guard verification", () => {
  it("banner does NOT show when dataSource is 'sheet' (healthy data)", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeRpsResponse());
    const stats = await readCrmLeadsTrackerStats("RPS");
    // Replicate the exact TSX guard: dataSource !== "sheet" && warning exists
    const bannerShouldShow = stats.dataSource !== "sheet" && Boolean(stats.warning);
    expect(bannerShouldShow).toBe(false);
  });

  it("banner DOES show when dataSource is 'tab_missing'", async () => {
    // Simulate Google Sheets 400 "Unable to parse range" (tab not found)
    mockSheetsGet.mockRejectedValue(
      Object.assign(new Error("Unable to parse range: 'CRM Leads Tracker'!A:M"), { code: 400 })
    );
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.dataSource).toBe("tab_missing");
    const bannerShouldShow = stats.dataSource !== "sheet" && Boolean(stats.warning);
    expect(bannerShouldShow).toBe(true);
  });

  it("banner DOES show when dataSource is 'empty' (tab exists, no data)", async () => {
    // Return only the header row, no data rows
    mockSheetsGet.mockResolvedValue({ data: { values: [RPS_HEADER] } });
    const stats = await readCrmLeadsTrackerStats("RPS");
    expect(stats.dataSource).toBe("empty");
    const bannerShouldShow = stats.dataSource !== "sheet" && Boolean(stats.warning);
    expect(bannerShouldShow).toBe(true);
  });
});
