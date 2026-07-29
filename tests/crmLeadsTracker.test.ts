/**
 * Unit tests for the CRM Leads Tracker sheet parser.
 *
 * These tests exercise `aggregateCrmRows()` and `parseCrmMonthLabel()` —
 * the pure functions that convert raw Google Sheets row data into dashboard
 * KPIs — without making any network or database calls.
 *
 * Confirmed date format:
 *   The "CRM Leads Tracker" tab stores dates in **DD/MM/YYYY** (e.g. "15/07/2027").
 *   The system also accepts YYYY-MM-DD as a fallback (e.g. from automated writes).
 *   Both formats are parsed correctly by parseCrmMonthLabel().
 *
 * Column layout verified against the live sheet (0-based):
 *   [0] Date  [1] Time  [2] Parent's Name  [3] Child's Name
 *   [4] Phone  [5] Program  [6] Status  [7] Remark
 *   [8] Lead Owner  [9] Source  [10] Walk-In Date  [11] Revisit Date  [12] Email ID
 */

import { describe, it, expect } from "vitest";

// ── Import the pure functions under test ─────────────────────────
// We mock only the modules that make external calls; the pure functions
// (`aggregateCrmRows`, `parseCrmMonthLabel`) have no side effects.
vi.mock("googleapis", () => ({
  google: {
    auth: { OAuth2: vi.fn() },
    sheets: vi.fn(),
  },
}));
vi.mock("../server/db", () => ({ db: {} }));
vi.mock("../shared/schema", () => ({}));

import { aggregateCrmRows } from "../server/walkinSheets";

// ── Synthetic sheet data ──────────────────────────────────────────
// 20 rows modelled on a real CRM Leads Tracker tab.
// Columns: Date · Time · Parent · Child · Phone · Program · Status ·
//          Remark · LeadOwner · Source · WalkInDate · RevisitDate · Email
//
// Date format is DD/MM/YYYY (the canonical format written by the sync system).

const SYNTHETIC_ROWS: string[][] = [
  // ── June 2027 ──────────────────────────────────────────────────
  ["15/06/2027", "10:00 AM", "Raj Kumar",     "Aarav K",  "9876543210", "Class 1",  "OPEN",                "", "Priya",   "Walk-In",   "", "", ""],
  ["16/06/2027", "11:30 AM", "Meena Sharma",  "Riya S",   "9876543211", "Nursery",  "FOLLOW-UP",           "", "Suresh",  "Referral",  "", "", ""],
  ["17/06/2027", "09:15 AM", "Anil Verma",    "Karan V",  "9876543212", "Class 2",  "WALK-IN BOOKED",      "", "Priya",   "Social",    "", "", ""],
  ["18/06/2027", "02:00 PM", "Sunita Patel",  "Ananya P", "9876543213", "Junior KG","WALK-IN COMPLETED",   "", "Suresh",  "Walk-In",   "20/06/2027", "", ""],
  ["19/06/2027", "04:30 PM", "Deepak Nair",   "Arjun N",  "9876543214", "Class 3",  "ADMISSION DONE",      "", "Priya",   "Online",    "21/06/2027", "", ""],
  ["20/06/2027", "10:45 AM", "Kavita Singh",  "Pooja S",  "9876543215", "Senior KG","CLOSED",              "", "Mohan",   "Walk-In",   "", "", ""],
  // ── July 2027 ──────────────────────────────────────────────────
  ["01/07/2027", "09:00 AM", "Ramesh Gupta",  "Dev G",    "9876543216", "Class 1",  "OPEN",                "", "Priya",   "Referral",  "", "", ""],
  ["02/07/2027", "11:00 AM", "Leela Iyer",    "Mira I",   "9876543217", "Nursery",  "FOLLOW-UP",           "", "Suresh",  "Online",    "", "", ""],
  ["03/07/2027", "01:30 PM", "Vijay Rao",     "Neha R",   "9876543218", "Class 4",  "WALK-IN BOOKED",      "", "Mohan",   "Social",    "", "", ""],
  ["04/07/2027", "03:00 PM", "Nisha Bose",    "Rohan B",  "9876543219", "Class 2",  "WALK-IN COMPLETED",   "", "Priya",   "Walk-In",   "05/07/2027", "", ""],
  ["05/07/2027", "10:00 AM", "Prakash Joshi", "Divya J",  "9876543220", "Junior KG","ADMISSION DONE",      "", "Suresh",  "Referral",  "06/07/2027", "", ""],
  ["06/07/2027", "11:30 AM", "Anita Das",     "Siddharth D","9876543221","Class 5", "ADMISSION DONE",      "", "Mohan",   "Online",    "07/07/2027", "", ""],
  ["07/07/2027", "09:45 AM", "Rohit Mehta",   "Tanvi M",  "9876543222", "Class 3",  "CLOSED",              "", "Priya",   "Walk-In",   "", "", ""],
  ["08/07/2027", "02:30 PM", "Seema Khanna",  "Aryan K",  "9876543223", "Senior KG","NEXT YEAR",           "", "Suresh",  "Social",    "", "", ""],
  ["09/07/2027", "04:00 PM", "Gopal Yadav",   "Ishaan Y", "9876543224", "Nursery",  "OPEN",                "", "Mohan",   "Referral",  "", "", ""],
  ["10/07/2027", "10:15 AM", "Pooja Tiwari",  "Sneha T",  "9876543225", "Class 1",  "WALK-IN BOOKED",      "", "Priya",   "Online",    "", "", ""],
  // ── Mixed: blank rows that should be skipped ──────────────────
  ["",           "",          "",               "",          "",           "",          "",                    "",  "",       "",           "", "", ""],
  ["",           "",          "",               "",          "",           "",          "",                    "",  "",       "",           "", "", ""],
  // ── July 2027 continued ───────────────────────────────────────
  ["11/07/2027", "11:00 AM", "Santosh Kumar", "Preethi K","9876543226", "Class 2",  "ADMISSION DONE",      "", "Suresh",  "Walk-In",   "12/07/2027", "", ""],
  ["12/07/2027", "03:30 PM", "Mala Reddy",    "Abhishek R","9876543227","Class 3",  "TRANSFERRED",         "", "Mohan",   "Referral",  "", "", ""],
];

// ── Non-blank row count (excludes the 2 blank rows above) ────────
const EXPECTED_TOTAL_LEADS = 18;

// ── Admission rows: rows 5(idx4), 11(idx10), 12(idx11), 19(idx18) = 4
const EXPECTED_ADMISSIONS = 4;

// ── Month buckets ─────────────────────────────────────────────────
// June-27: rows 1-6 → 6 leads
// July-27: rows 7-16 + rows 19-20 (minus 2 blank) → 12 leads
const EXPECTED_MONTHLY = [
  { month: "Jun-27", cnt: 6 },
  { month: "Jul-27", cnt: 12 },
];

// ─────────────────────────────────────────────────────────────────
describe("aggregateCrmRows — CRM Leads Tracker parser", () => {
  const result = aggregateCrmRows(SYNTHETIC_ROWS);

  // ── KPI: totalLeads ──────────────────────────────────────────
  it("totalLeads equals the count of non-blank Date-column rows", () => {
    expect(result.kpis.totalLeads).toBe(EXPECTED_TOTAL_LEADS);
  });

  // ── KPI: admissions ──────────────────────────────────────────
  it("admissions matches rows where Status = \"ADMISSION DONE\"", () => {
    expect(result.kpis.admissions).toBe(EXPECTED_ADMISSIONS);
  });

  // ── KPI: walkins (WALK-IN COMPLETED + ADMISSION DONE) ────────
  it("walkins counts both WALK-IN COMPLETED and ADMISSION DONE rows", () => {
    // 2 × WALK-IN COMPLETED (rows idx3, idx9) + 4 × ADMISSION DONE = 6
    expect(result.kpis.walkins).toBe(6);
  });

  // ── KPI: bookings ─────────────────────────────────────────────
  it("bookings counts only WALK-IN BOOKED rows", () => {
    // rows idx2, idx8, idx15 = 3
    expect(result.kpis.bookings).toBe(3);
  });

  // ── Monthly grouping ──────────────────────────────────────────
  it("groups leads into correct month buckets using DD/MM/YYYY dates", () => {
    expect(result.monthly).toEqual(EXPECTED_MONTHLY);
  });

  it("monthly totals sum to totalLeads", () => {
    const sum = result.monthly.reduce((acc, m) => acc + m.cnt, 0);
    expect(sum).toBe(result.kpis.totalLeads);
  });

  it("monthlyDetail leads also sum to totalLeads", () => {
    const sum = result.monthlyDetail.reduce((acc, m) => acc + m.leads, 0);
    expect(sum).toBe(result.kpis.totalLeads);
  });

  // ── Monthly detail: admissions per month ─────────────────────
  it("monthlyDetail shows correct admissions per month", () => {
    const jun = result.monthlyDetail.find(m => m.month === "Jun-27");
    const jul = result.monthlyDetail.find(m => m.month === "Jul-27");
    expect(jun?.admissions).toBe(1); // row idx4
    expect(jul?.admissions).toBe(3); // rows idx10, idx11, idx18
  });

  // ── Blank rows are skipped ─────────────────────────────────────
  it("blank rows (empty Date column) are not counted", () => {
    // There are 20 rows in SYNTHETIC_ROWS, 2 are blank → expect 18
    expect(result.kpis.totalLeads).toBe(SYNTHETIC_ROWS.length - 2);
  });

  // ── Status uppercasing ────────────────────────────────────────
  it("status values appear uppercased in statusBreakdown", () => {
    const statuses = result.statusBreakdown.map(s => s.status);
    for (const s of statuses) {
      expect(s).toBe(s.toUpperCase());
    }
  });

  // ── statusBreakdown totals match totalLeads ───────────────────
  it("statusBreakdown counts sum to totalLeads", () => {
    const sum = result.statusBreakdown.reduce((acc, s) => acc + s.cnt, 0);
    expect(sum).toBe(result.kpis.totalLeads);
  });

  // ── byOwner ──────────────────────────────────────────────────
  it("byOwner totals match totalLeads", () => {
    const sum = result.byOwner.reduce((acc, o) => acc + o.cnt, 0);
    expect(sum).toBe(result.kpis.totalLeads);
  });

  // ── byProgram ────────────────────────────────────────────────
  it("byProgram totals match totalLeads", () => {
    const sum = result.byProgram.reduce((acc, p) => acc + p.cnt, 0);
    expect(sum).toBe(result.kpis.totalLeads);
  });
});

// ── parseCrmMonthLabel — date format acceptance ───────────────────
// parseCrmMonthLabel is not exported directly, but its behaviour is
// fully exercised through aggregateCrmRows. We verify it via extra rows.
describe("aggregateCrmRows — date format handling", () => {
  it("parses DD/MM/YYYY correctly (canonical sheet format)", () => {
    const rows: string[][] = [
      ["29/07/2027", "", "", "", "", "Class 1", "OPEN", "", "", "Walk-In", "", "", ""],
      ["01/08/2027", "", "", "", "", "Class 1", "OPEN", "", "", "Walk-In", "", "", ""],
    ];
    const r = aggregateCrmRows(rows);
    expect(r.kpis.totalLeads).toBe(2);
    const months = r.monthly.map(m => m.month);
    expect(months).toContain("Jul-27");
    expect(months).toContain("Aug-27");
  });

  it("parses YYYY-MM-DD correctly (fallback format)", () => {
    const rows: string[][] = [
      ["2027-07-29", "", "", "", "", "Class 1", "OPEN", "", "", "Walk-In", "", "", ""],
      ["2027-08-01", "", "", "", "", "Class 1", "OPEN", "", "", "Walk-In", "", "", ""],
    ];
    const r = aggregateCrmRows(rows);
    expect(r.kpis.totalLeads).toBe(2);
    const months = r.monthly.map(m => m.month);
    expect(months).toContain("Jul-27");
    expect(months).toContain("Aug-27");
  });

  it("assigns 'Unknown' month label to unrecognised date formats without crashing", () => {
    const rows: string[][] = [
      ["July 2027",   "", "", "", "", "Class 1", "OPEN", "", "", "Walk-In", "", "", ""],
      ["not-a-date",  "", "", "", "", "Class 1", "OPEN", "", "", "Walk-In", "", "", ""],
    ];
    const r = aggregateCrmRows(rows);
    expect(r.kpis.totalLeads).toBe(2);
    expect(r.monthly.some(m => m.month === "Unknown")).toBe(true);
  });

  it("handles mixed DD/MM/YYYY and YYYY-MM-DD in the same sheet", () => {
    const rows: string[][] = [
      ["15/07/2027", "", "", "", "", "Class 1", "ADMISSION DONE", "", "", "", "", "", ""],
      ["2027-07-20", "", "", "", "", "Class 2", "ADMISSION DONE", "", "", "", "", "", ""],
    ];
    const r = aggregateCrmRows(rows);
    expect(r.kpis.totalLeads).toBe(2);
    expect(r.kpis.admissions).toBe(2);
    // Both should end up in Jul-27
    expect(r.monthly).toEqual([{ month: "Jul-27", cnt: 2 }]);
  });
});
