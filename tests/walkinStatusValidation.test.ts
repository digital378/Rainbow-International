/**
 * Unit tests for the status validation block inside pullChangesFromSheet().
 *
 * The function fetches sheet rows from the Google Sheets API and compares them
 * against DB records.  When the Status column (col L, index 11) contains an
 * unrecognised value the code must:
 *   1. NOT update the DB record's status.
 *   2. Push an error message that names the bad value into the pull log entry.
 *
 * Both `googleapis` and `../server/db` are mocked so no real network or DB
 * calls are made.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mock refs so they are available inside vi.mock factories ─────────────
// vi.hoisted() runs before module imports, making these safe to reference inside
// the vi.mock() factory callbacks which are also hoisted.
const {
  mockSheetsGet,
  mockSheetsUpdate,
  mockSheetsAppend,
  mockSheetsBatchUpdate,
  mockSpreadsheetsBatchUpdate,
  mockSpreadsheetsGet,
} = vi.hoisted(() => ({
  mockSheetsGet:               vi.fn(),
  mockSheetsUpdate:            vi.fn().mockResolvedValue({}),
  mockSheetsAppend:            vi.fn().mockResolvedValue({}),
  mockSheetsBatchUpdate:       vi.fn().mockResolvedValue({}),
  mockSpreadsheetsBatchUpdate: vi.fn().mockResolvedValue({}),
  mockSpreadsheetsGet:         vi.fn().mockResolvedValue({
    data: { sheets: [{ properties: { title: "WALKINs" } }] },
  }),
}));

// ── Mock googleapis ───────────────────────────────────────────────────────────
vi.mock("googleapis", () => {
  // OAuth2 must be a proper constructor (walkinSheets uses `new google.auth.OAuth2(...)`)
  class OAuth2 {
    setCredentials(_creds: object) {}
  }

  const sheetsClient = {
    spreadsheets: {
      get:          mockSpreadsheetsGet,
      values: {
        get:          mockSheetsGet,
        update:       mockSheetsUpdate,
        append:       mockSheetsAppend,
        batchUpdate:  mockSheetsBatchUpdate,
      },
      batchUpdate:  mockSpreadsheetsBatchUpdate,
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

// ── Import subjects under test (mocks are already in place) ──────────────────
import { pullChangesFromSheet } from "../server/walkinSheets";
import { db } from "../server/db";

// ── Fixtures ──────────────────────────────────────────────────────────────────

/** Valid statuses as returned by the DB walkinStatuses table. */
const VALID_STATUSES = [
  { label: "OPEN" },
  { label: "WALK-IN BOOKED" },
  { label: "WALK-IN COMPLETED" },
  { label: "ADMISSION DONE" },
  { label: "CLOSED" },
  { label: "TRANSFERRED" },
  { label: "INTEGRATED" },
  { label: "NEXT YEAR" },
];

/** A fake DB lead record with status "OPEN" (the unchanged baseline). */
const FAKE_LEAD = {
  id:               "42",
  brand:            "RIS",
  status:           "OPEN",
  parentName:       "Test Parent",
  walkInDate:       null,
  remark:           null,
  closeReason:      null,
  revisitDate:      null,
  misCallingRemarks: null,
  isArchived:       false,
};

/**
 * Build an 18-column sheet row (A–R).
 * Only col L (index 11, Status) and col R (index 17, Lead ID) are populated;
 * all other columns are empty strings.
 */
function makeSheetRow(status: string, leadId: string): string[] {
  const row: string[] = Array(18).fill("");
  row[11] = status;   // L — Status
  row[17] = leadId;   // R — Lead ID (upsert key)
  return row;
}

/**
 * Prime the sheets values.get mock to return the given data rows.
 * A dummy header row is prepended (pullChangesFromSheet slices it off).
 */
function primeSheetRows(rows: string[][]): void {
  const header: string[] = Array(18).fill("header");
  mockSheetsGet.mockResolvedValue({ data: { values: [header, ...rows] } });
}

/**
 * Wire db.select() to serve:
 *   - db.select(fields)  → VALID_STATUSES  (walkinStatuses lookup)
 *   - db.select()        → [lead]           (walkinLeads lookup)
 *
 * pullChangesFromSheet distinguishes the two by passing a `fields` argument to
 * the statuses query but not to the per-lead query.
 */
function wireDbSelectForLead(lead: typeof FAKE_LEAD) {
  vi.mocked(db.select).mockImplementation((fields?: any) => {
    if (fields !== undefined) {
      // walkinStatuses: db.select({ label: walkinStatuses.label }).from(...)
      return { from: vi.fn().mockResolvedValue(VALID_STATUSES) } as any;
    }
    // walkinLeads: db.select().from(walkinLeads).where(...)
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([lead]),
      }),
    } as any;
  });
}

// ── Test setup ────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Restore mocks wiped by clearAllMocks
  mockSpreadsheetsGet.mockResolvedValue({
    data: { sheets: [{ properties: { title: "WALKINs" } }] },
  });
  mockSheetsUpdate.mockResolvedValue({});
  mockSheetsAppend.mockResolvedValue({});
  mockSheetsBatchUpdate.mockResolvedValue({});
  mockSpreadsheetsBatchUpdate.mockResolvedValue({});

  // Minimum env vars for getAuthClient() and getSheetId("RIS") to succeed
  process.env.GOOGLE_REFRESH_TOKEN     = "fake-refresh-token";
  process.env.GOOGLE_CLIENT_ID         = "fake-client-id";
  process.env.GOOGLE_CLIENT_SECRET     = "fake-client-secret";
  process.env.RIS_WALKIN_SHEET_ID_2728 = "fake-sheet-id";
  delete process.env.MASTER_WALKIN_SHEET_ID_2728; // skip master propagation

  // Default DB wiring — most tests use FAKE_LEAD
  wireDbSelectForLead(FAKE_LEAD);

  // db.update() spy — returns a chainable stub
  vi.mocked(db.update).mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  } as any);

  // db.insert() for audit log — result not inspected in these tests
  vi.mocked(db.insert).mockReturnValue({
    values: vi.fn().mockResolvedValue([]),
  } as any);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("pullChangesFromSheet — status validation", () => {

  it("records an error that names the bad value when the sheet status is unrecognised", async () => {
    const badStatus = "OPENN"; // intentional typo
    primeSheetRows([makeSheetRow(badStatus, "42")]);

    const result = await pullChangesFromSheet("RIS");

    expect(result.errors.length).toBeGreaterThan(0);
    const errorMsg = result.errors.find((e) => e.includes("not a recognised status"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain(`"${badStatus}"`);
  });

  it("does NOT update the DB record when the sheet status is invalid", async () => {
    primeSheetRows([makeSheetRow("ADMMISION DONE", "42")]); // typo

    await pullChangesFromSheet("RIS");

    expect(vi.mocked(db.update)).not.toHaveBeenCalled();
  });

  it("includes the lead ID in the error message so staff can trace it", async () => {
    primeSheetRows([makeSheetRow("WALKIN BOOKED", "42")]); // missing hyphen

    const result = await pullChangesFromSheet("RIS");

    const errorMsg = result.errors.find((e) => e.includes("not a recognised status"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain("42");
  });

  it("does not increment changesApplied when only an invalid status is present", async () => {
    primeSheetRows([makeSheetRow("TYPO_STATUS", "42")]);

    const result = await pullChangesFromSheet("RIS");

    expect(result.changesApplied).toBe(0);
  });

  it("accepts a valid status, updates the DB, and logs no validation errors", async () => {
    // Lead is currently OPEN in DB; sheet says CLOSED — a valid transition
    primeSheetRows([makeSheetRow("CLOSED", "42")]);

    const result = await pullChangesFromSheet("RIS");

    const validationErrors = result.errors.filter((e) =>
      e.includes("not a recognised status"),
    );
    expect(validationErrors).toHaveLength(0);
    expect(vi.mocked(db.update)).toHaveBeenCalled();
  });
});
