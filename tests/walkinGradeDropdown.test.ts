/**
 * Tests: Grade dropdown in WALKINs sheet reflects DB-backed programs
 *
 * Verifies that:
 *   1. Happy path — a new grade added to walkin_programs (via admin panel) is
 *      included in the Grade (col G = index 6) setDataValidation request sent
 *      to Google Sheets on the next resyncBrandToSheet("RIS") call, without
 *      any code change.
 *   2. Master sheet path — resyncMasterSheet() picks up grades from both brands
 *      (col H = index 7 in the master layout).
 *   3. Fallback path — if the DB query for programs throws (e.g. transient
 *      outage), the batchUpdate still fires with the hardcoded grade list so
 *      the sheet dropdown is never left empty.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mock refs (must be available inside vi.mock factories) ──────────────
const {
  mockSpreadsheetsGet,
  mockSpreadsheetsBatchUpdate,
  mockSheetsGet,
  mockSheetsUpdate,
  mockSheetsClear,
  mockSheetsAppend,
  mockSheetsBatchUpdate,
} = vi.hoisted(() => ({
  mockSpreadsheetsGet:         vi.fn(),
  mockSpreadsheetsBatchUpdate: vi.fn().mockResolvedValue({}),
  mockSheetsGet:               vi.fn().mockResolvedValue({ data: { values: [] } }),
  mockSheetsUpdate:            vi.fn().mockResolvedValue({}),
  mockSheetsClear:             vi.fn().mockResolvedValue({}),
  mockSheetsAppend:            vi.fn().mockResolvedValue({}),
  mockSheetsBatchUpdate:       vi.fn().mockResolvedValue({}),
}));

// ── Mock googleapis ───────────────────────────────────────────────────────────
vi.mock("googleapis", () => {
  class OAuth2 {
    setCredentials(_creds: object) {}
  }

  const sheetsClient = {
    spreadsheets: {
      get:         mockSpreadsheetsGet,
      batchUpdate: mockSpreadsheetsBatchUpdate,
      values: {
        get:        mockSheetsGet,
        update:     mockSheetsUpdate,
        clear:      mockSheetsClear,
        append:     mockSheetsAppend,
        batchUpdate: mockSheetsBatchUpdate,
      },
    },
  };

  return {
    google: {
      auth:   { OAuth2 },
      sheets: vi.fn().mockReturnValue(sheetsClient),
    },
  };
});

// ── Mock the DB module ────────────────────────────────────────────────────────
vi.mock("../server/db", () => ({
  db: {
    select:  vi.fn(),
    update:  vi.fn(),
    insert:  vi.fn(),
    execute: vi.fn(),
  },
}));

// Full resync is called directly here to isolate dropdown construction. Live
// routes acquire the durable lease first; lease behaviour is covered separately.
vi.mock("../server/walkinSyncCoordinator", () => ({
  beginWalkinSyncShutdown: vi.fn(),
  fencedWalkinSheetWrite: (_name: string, write: () => Promise<unknown>) => write(),
  isWalkinSyncDraining: () => false,
  runWalkinSheetOperation: (_name: string, operation: () => Promise<unknown>) => operation(),
  waitForWalkinSyncDrain: async () => true,
}));

// ── Import subjects under test ────────────────────────────────────────────────
import { resyncBrandToSheet, resyncMasterSheet, ALLOWED_GRADES_RIS, ALLOWED_GRADES_MASTER } from "../server/walkinSheets";
import { db } from "../server/db";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns a sheetsClient.spreadsheets.get response that reports an existing
 * "WALKINs" tab (so ensureLeadsTab and applyYellowColumnProtection both find it).
 */
function makeTabExistsResponse(tabName = "WALKINs") {
  return {
    data: {
      sheets: [
        {
          properties: { title: tabName, sheetId: 42 },
          protectedRanges: [],
        },
      ],
    },
  };
}

/**
 * Wire db.select() to:
 *   - programs query (fields !== undefined) → resolve with the given grade rows
 *   - leads query (fields === undefined)    → resolve with empty array
 */
function wireDbForGrades(gradeLabels: string[]) {
  vi.mocked(db.select).mockImplementation((fields?: any) => {
    if (fields !== undefined) {
      // walkinPrograms query: db.select({ label: ... }).from().where().orderBy()
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(
              gradeLabels.map((label) => ({ label })),
            ),
          }),
        }),
      } as any;
    }
    // walkinLeads query: db.select().from().where().orderBy()
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any;
  });
}

/**
 * Wire db.select() so the programs query throws (simulates a DB outage).
 * The leads query still returns an empty array so the rest of the resync
 * can complete.
 */
function wireDbWithBrokenProgramsQuery() {
  vi.mocked(db.select).mockImplementation((fields?: any) => {
    if (fields !== undefined) {
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockRejectedValue(new Error("DB connection refused")),
          }),
        }),
      } as any;
    }
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any;
  });
}

/**
 * Extract every setDataValidation request from all batchUpdate calls.
 */
function extractDataValidationRequests(): any[] {
  return mockSpreadsheetsBatchUpdate.mock.calls
    .flatMap((call: any[]) => call[0]?.requestBody?.requests ?? [])
    .filter((r: any) => "setDataValidation" in r);
}

/**
 * Find the setDataValidation request for a specific column index (0-based).
 */
function findDropdownForCol(colIndex: number): any | undefined {
  return extractDataValidationRequests().find(
    (r: any) => r.setDataValidation?.range?.startColumnIndex === colIndex,
  );
}

/**
 * Pull the grade labels out of a setDataValidation rule's ONE_OF_LIST values.
 */
function gradesFromDropdownRequest(req: any): string[] {
  return (req?.setDataValidation?.rule?.condition?.values ?? []).map(
    (v: any) => v.userEnteredValue,
  );
}

// ── Test setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Restore default mock implementations wiped by clearAllMocks
  mockSpreadsheetsBatchUpdate.mockResolvedValue({});
  mockSheetsGet.mockResolvedValue({ data: { values: [] } });
  mockSheetsUpdate.mockResolvedValue({});
  mockSheetsClear.mockResolvedValue({});
  mockSheetsAppend.mockResolvedValue({});
  mockSheetsBatchUpdate.mockResolvedValue({});

  // Tab already exists — no creation needed
  mockSpreadsheetsGet.mockResolvedValue(makeTabExistsResponse());

  // Minimum env vars for auth + sheet ID resolution
  process.env.GOOGLE_REFRESH_TOKEN     = "fake-refresh-token";
  process.env.GOOGLE_CLIENT_ID         = "fake-client-id";
  process.env.GOOGLE_CLIENT_SECRET     = "fake-client-secret";
  process.env.RIS_WALKIN_SHEET_ID_2728 = "fake-ris-sheet-id";
  process.env.RPS_WALKIN_SHEET_ID_2728 = "fake-rps-sheet-id";
  // Skip master propagation in brand tests (no env var set)
  delete process.env.MASTER_WALKIN_SHEET_ID_2728;
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("resyncBrandToSheet — Grade dropdown reflects DB programs", () => {

  it("includes a newly added grade in the col-G dropdown after resync", async () => {
    const newGrade = "Class 13 — Advanced";   // not in the hardcoded list
    wireDbForGrades(["Nursery", "Jr. KG", "Sr. KG", newGrade]);

    await resyncBrandToSheet("RIS");

    const dropdown = findDropdownForCol(6); // col G = GRADE in brand sheet
    expect(dropdown).toBeDefined();

    const grades = gradesFromDropdownRequest(dropdown);
    expect(grades).toContain(newGrade);
  });

  it("sends the full DB-backed list (not just the hardcoded one) in the dropdown", async () => {
    const dbGrades = ["Pre-Nursery", "Nursery", "Jr. KG", "Sr. KG", "Class 1"];
    wireDbForGrades(dbGrades);

    await resyncBrandToSheet("RIS");

    const dropdown = findDropdownForCol(6);
    expect(dropdown).toBeDefined();

    const grades = gradesFromDropdownRequest(dropdown);
    expect(grades).toEqual(dbGrades);
  });

  it("the grade dropdown targets col G (startColumnIndex = 6) in the brand sheet", async () => {
    wireDbForGrades(["Nursery"]);

    await resyncBrandToSheet("RIS");

    const dropdown = findDropdownForCol(6);
    expect(dropdown).toBeDefined();
    expect(dropdown.setDataValidation.range.startColumnIndex).toBe(6);
    expect(dropdown.setDataValidation.range.endColumnIndex).toBe(7);
  });

  it("the dropdown rule type is ONE_OF_LIST and strict is false (warning-only)", async () => {
    wireDbForGrades(["Nursery", "Jr. KG"]);

    await resyncBrandToSheet("RIS");

    const dropdown = findDropdownForCol(6);
    expect(dropdown).toBeDefined();
    expect(dropdown.setDataValidation.rule.condition.type).toBe("ONE_OF_LIST");
    expect(dropdown.setDataValidation.rule.strict).toBe(false);
  });

  it("falls back to the hardcoded RIS grade list when the DB programs query fails", async () => {
    wireDbWithBrokenProgramsQuery();

    // resync must still succeed (fallback is non-fatal)
    await expect(resyncBrandToSheet("RIS")).resolves.toBeDefined();

    const dropdown = findDropdownForCol(6);
    expect(dropdown).toBeDefined();

    const grades = gradesFromDropdownRequest(dropdown);
    // Fallback should cover all canonical RIS grades
    for (const grade of ALLOWED_GRADES_RIS) {
      expect(grades).toContain(grade);
    }
  });

  it("fallback dropdown does NOT include RPS-only grades (e.g. 'Playgroup')", async () => {
    wireDbWithBrokenProgramsQuery();

    await resyncBrandToSheet("RIS");

    const dropdown = findDropdownForCol(6);
    const grades = gradesFromDropdownRequest(dropdown);
    expect(grades).not.toContain("Playgroup");
  });

  it("removing a grade from DB means it is absent from the dropdown on next resync", async () => {
    // Simulate admin disabling "Class 10" — it no longer appears in query results
    const reducedGrades = ["Nursery", "Jr. KG", "Sr. KG", "Class 1"];
    wireDbForGrades(reducedGrades);

    await resyncBrandToSheet("RIS");

    const dropdown = findDropdownForCol(6);
    const grades = gradesFromDropdownRequest(dropdown);
    expect(grades).not.toContain("Class 10");
    expect(grades).toEqual(reducedGrades);
  });

  it("the batchUpdate is called even when there are zero leads to write", async () => {
    // DB returns empty leads + grades from DB
    wireDbForGrades(["Nursery"]);

    await resyncBrandToSheet("RIS");

    expect(mockSpreadsheetsBatchUpdate).toHaveBeenCalled();
  });

});

describe("resyncMasterSheet — Grade dropdown reflects DB programs", () => {

  beforeEach(() => {
    // Master sheet requires its own env var
    process.env.MASTER_WALKIN_SHEET_ID_2728 = "fake-master-sheet-id";

    // Master GET returns a tab with both RIS and RPS tabs visible; we reuse
    // the WALKINs tab name for simplicity since both brand and master share it.
    mockSpreadsheetsGet.mockResolvedValue(makeTabExistsResponse());
  });

  it("includes a newly added grade in the master col-H dropdown after resync", async () => {
    const newGrade = "IB Year 1";  // hypothetical new grade not in hardcoded list
    // Master fetches all grades regardless of brand
    vi.mocked(db.select).mockImplementation((fields?: any) => {
      if (fields !== undefined) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([
                { label: "Playgroup" },
                { label: "Nursery" },
                { label: newGrade },
              ]),
            }),
          }),
        } as any;
      }
      // leads query — both brands, return empty
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any;
    });

    await resyncMasterSheet();

    // Master Grade dropdown is col H = index 7
    const dropdown = findDropdownForCol(7);
    expect(dropdown).toBeDefined();

    const grades = gradesFromDropdownRequest(dropdown);
    expect(grades).toContain(newGrade);
  });

  it("falls back to the hardcoded master grade list when DB fails", async () => {
    vi.mocked(db.select).mockImplementation((fields?: any) => {
      if (fields !== undefined) {
        return {
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockRejectedValue(new Error("timeout")),
            }),
          }),
        } as any;
      }
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any;
    });

    await expect(resyncMasterSheet()).resolves.toBeDefined();

    const dropdown = findDropdownForCol(7);
    expect(dropdown).toBeDefined();

    const grades = gradesFromDropdownRequest(dropdown);
    // Fallback covers all hardcoded master grades (both RIS + RPS combined)
    for (const grade of ALLOWED_GRADES_MASTER) {
      expect(grades).toContain(grade);
    }
  });

});
