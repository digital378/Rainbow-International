/**
 * Unit tests for status and close-reason validation inside
 * pullChangesFromMasterSheet().
 *
 * The Master MIS sheet uses a separate pull path (`pullChangesFromMasterSheet`)
 * that reads a 19-column layout (Brand prepended as col A, Lead ID in col S).
 * Status lives in col M (index 12) and Reason for Closed in col P (index 15),
 * instead of the brand-sheet positions.
 *
 * When the Status or Reason for Closed column contains an unrecognised value
 * the code must:
 *   1. NOT update the DB record for that field.
 *   2. Push an error message that names the bad value into the pull log entry.
 *
 * Both `googleapis` and `../server/db` are mocked so no real network or DB
 * calls are made.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Hoist mock refs so they are available inside vi.mock factories ────────────
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
import { pullChangesFromMasterSheet } from "../server/walkinSheets";
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
 * Build a 19-column Master sheet row (A–S).
 *   A  (index  0) = Brand
 *   M  (index 12) = Status
 *   S  (index 18) = Lead ID (upsert key)
 * All other columns are empty strings.
 */
function makeMasterSheetRow(
  brand: string,
  status: string,
  leadId: string,
): string[] {
  const row: string[] = Array(19).fill("");
  row[0]  = brand;   // A — Brand
  row[12] = status;  // M — Status
  row[18] = leadId;  // S — Lead ID
  return row;
}

/**
 * Build a 19-column Master sheet row (A–S) that carries only a close reason.
 *   A  (index  0) = Brand
 *   P  (index 15) = Reason for Closed
 *   S  (index 18) = Lead ID (upsert key)
 * Status (index 12) and all other columns are left as empty strings so only
 * the close-reason validation path is exercised.
 */
function makeMasterSheetRowWithCloseReason(
  brand: string,
  closeReason: string,
  leadId: string,
): string[] {
  const row: string[] = Array(19).fill("");
  row[0]  = brand;        // A — Brand
  row[15] = closeReason;  // P — Reason for Closed
  row[18] = leadId;       // S — Lead ID
  return row;
}

/**
 * Prime the sheets values.get mock to return the given data rows.
 * A dummy 19-column header row is prepended (pullChangesFromMasterSheet slices it off).
 */
function primeMasterSheetRows(rows: string[][]): void {
  const header: string[] = Array(19).fill("header");
  mockSheetsGet.mockResolvedValue({ data: { values: [header, ...rows] } });
}

/**
 * Wire db.select() to serve:
 *   - db.select(fields)  → VALID_STATUSES  (walkinStatuses / walkinCloseReasons lookup)
 *   - db.select()        → [lead]           (walkinLeads lookup)
 *
 * Both the statuses and close-reasons queries pass a `fields` argument, so any
 * fields-based call returns VALID_STATUSES (only the label property is used).
 * The per-lead lookup passes no fields.
 */
function wireDbSelectForLead(lead: typeof FAKE_LEAD) {
  vi.mocked(db.select).mockImplementation((fields?: any) => {
    if (fields !== undefined) {
      // walkinStatuses / walkinCloseReasons: db.select({ label: ... }).from(...)
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

  // Minimum env vars for getAuthClient() and MASTER_WALKIN_SHEET_ID_2728 to succeed
  process.env.GOOGLE_REFRESH_TOKEN         = "fake-refresh-token";
  process.env.GOOGLE_CLIENT_ID             = "fake-client-id";
  process.env.GOOGLE_CLIENT_SECRET         = "fake-client-secret";
  process.env.MASTER_WALKIN_SHEET_ID_2728  = "fake-master-sheet-id";
  // Skip brand back-propagation by leaving brand sheet IDs unset
  delete process.env.RIS_WALKIN_SHEET_ID_2728;
  delete process.env.RPS_WALKIN_SHEET_ID_2728;

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

describe("pullChangesFromMasterSheet — status validation", () => {

  it("records an error that names the bad value when the Master sheet status is unrecognised", async () => {
    const badStatus = "OPENN"; // intentional typo
    primeMasterSheetRows([makeMasterSheetRow("RIS", badStatus, "42")]);

    const result = await pullChangesFromMasterSheet();

    expect(result.errors.length).toBeGreaterThan(0);
    const errorMsg = result.errors.find((e) => e.includes("not recognised"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain(`"${badStatus}"`);
  });

  it("does NOT update the DB record when the Master sheet status is invalid", async () => {
    primeMasterSheetRows([makeMasterSheetRow("RIS", "ADMMISION DONE", "42")]); // typo

    await pullChangesFromMasterSheet();

    expect(vi.mocked(db.update)).not.toHaveBeenCalled();
  });

  it("includes the lead ID in the error message so staff can trace it", async () => {
    primeMasterSheetRows([makeMasterSheetRow("RIS", "WALKIN BOOKED", "42")]); // missing hyphen

    const result = await pullChangesFromMasterSheet();

    const errorMsg = result.errors.find((e) => e.includes("not recognised"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain("42");
  });

  it("does not increment changesApplied when only an invalid status is present", async () => {
    primeMasterSheetRows([makeMasterSheetRow("RPS", "TYPO_STATUS", "42")]);

    const result = await pullChangesFromMasterSheet();

    expect(result.changesApplied).toBe(0);
  });

  it("accepts a valid status, updates the DB, and logs no validation errors", async () => {
    // Lead is currently OPEN in DB; Master sheet says CLOSED — a valid transition
    primeMasterSheetRows([makeMasterSheetRow("RIS", "CLOSED", "42")]);

    const result = await pullChangesFromMasterSheet();

    const validationErrors = result.errors.filter((e) => e.includes("not recognised"));
    expect(validationErrors).toHaveLength(0);
    expect(vi.mocked(db.update)).toHaveBeenCalled();
  });

  it("rejects an invalid status from an RPS row just as it does for RIS", async () => {
    primeMasterSheetRows([makeMasterSheetRow("RPS", "ADMISSSION", "42")]); // triple-s typo

    const result = await pullChangesFromMasterSheet();

    expect(result.errors.length).toBeGreaterThan(0);
    const errorMsg = result.errors.find((e) => e.includes("not recognised"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain('"ADMISSSION"');
    expect(vi.mocked(db.update)).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("pullChangesFromMasterSheet — close-reason validation", () => {

  it("records an error that names the bad value when the Master sheet close reason is unrecognised", async () => {
    const badReason = "Not Intersted"; // intentional typo
    primeMasterSheetRows([makeMasterSheetRowWithCloseReason("RIS", badReason, "42")]);

    const result = await pullChangesFromMasterSheet();

    expect(result.errors.length).toBeGreaterThan(0);
    const errorMsg = result.errors.find((e) => e.includes("not a recognised close reason"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain(`"${badReason}"`);
  });

  it("does NOT update the DB record when the Master sheet close reason is invalid", async () => {
    primeMasterSheetRows([makeMasterSheetRowWithCloseReason("RIS", "CLOSEDD", "42")]); // extra D typo

    await pullChangesFromMasterSheet();

    expect(vi.mocked(db.update)).not.toHaveBeenCalled();
  });

  it("includes the lead ID in the error message so staff can trace an invalid close reason", async () => {
    primeMasterSheetRows([makeMasterSheetRowWithCloseReason("RIS", "Fee Isue", "42")]); // typo

    const result = await pullChangesFromMasterSheet();

    const errorMsg = result.errors.find((e) => e.includes("not a recognised close reason"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain("42");
  });

  it("does not increment changesApplied when only an invalid close reason is present", async () => {
    primeMasterSheetRows([makeMasterSheetRowWithCloseReason("RPS", "REASON_TYPO", "42")]);

    const result = await pullChangesFromMasterSheet();

    expect(result.changesApplied).toBe(0);
  });

  it("accepts a valid close reason, updates the DB, and logs no close-reason errors", async () => {
    // "CLOSED" is present in VALID_STATUSES which the mock also returns for
    // the walkinCloseReasons lookup (both share the same fields-based mock path).
    // DB lead has closeReason=null so this will register as a change.
    primeMasterSheetRows([makeMasterSheetRowWithCloseReason("RIS", "CLOSED", "42")]);

    const result = await pullChangesFromMasterSheet();

    const validationErrors = result.errors.filter((e) =>
      e.includes("not a recognised close reason"),
    );
    expect(validationErrors).toHaveLength(0);
    expect(vi.mocked(db.update)).toHaveBeenCalled();
  });

  it("rejects an invalid close reason from an RPS row just as it does for RIS", async () => {
    primeMasterSheetRows([
      makeMasterSheetRowWithCloseReason("RPS", "Dissatisifed", "42"), // misspelling
    ]);

    const result = await pullChangesFromMasterSheet();

    expect(result.errors.length).toBeGreaterThan(0);
    const errorMsg = result.errors.find((e) => e.includes("not a recognised close reason"));
    expect(errorMsg).toBeDefined();
    expect(errorMsg).toContain('"Dissatisifed"');
    expect(vi.mocked(db.update)).not.toHaveBeenCalled();
  });
});
