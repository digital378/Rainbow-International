/**
 * AY 2027-28 Walk-in Leads — Google Sheets One-Way Mirror
 *
 * Architecture:
 *   DB is source of truth.
 *   Sheet is a locked, human-readable read-only reflection.
 *   All writes go DB → Sheet, never the reverse.
 *
 * Env vars required:
 *   RIS_WALKIN_SHEET_ID_2728  — Google Sheets ID for RIS sheet
 *   RPS_WALKIN_SHEET_ID_2728  — Google Sheets ID for RPS sheet
 *   GOOGLE_REFRESH_TOKEN      — OAuth2 refresh token with spreadsheets scope
 *   GOOGLE_CLIENT_ID          — OAuth2 client ID
 *   GOOGLE_CLIENT_SECRET      — OAuth2 client secret
 *
 * Column layout (matches images shared by client, 18 cols):
 *   A  Unique ID     — LD-DD.MM.YYYY-{RIS|RPS}-<brandSeqNum>
 *   B  Date          — DD/MM/YYYY
 *   C  Time          — HH:MM (12h)
 *   D  Student Name
 *   E  Father/Mother Name
 *   F  GRADE
 *   G  Academic Year
 *   H  Contact No
 *   I  Email
 *   J  Counsellor Name
 *   K  Source
 *   L  Status         ← green (branch-editable in sheet)
 *   M  Admission Date ← green
 *   N  Follow up Remarks ← green
 *   O  Reason for Closed ← green
 *   P  Trial / Revisit   ← green
 *   Q  MIS Calling Remarks ← green
 *   R  Lead ID        — hidden; used for upsert row-matching
 *
 * Yellow columns (A,D,E,F,J,K) = mandatory at submission; sheet owner–only edit.
 * Green columns (L-Q) = editable by branch staff in sheet.
 * Set up range protection in Google Sheets manually (Data → Protect ranges).
 */

import { google } from "googleapis";
import { db } from "./db";
import { walkinLeads, walkinBranches, walkinLeadAuditLog, walkinStatuses, walkinCloseReasons } from "@shared/schema";
import { eq, and, sql as drizzleSql } from "drizzle-orm";
import type { WalkinLead } from "@shared/schema";

// ── Startup bootstrap ─────────────────────────────────────────────
// Creates per-brand sequences and backfills brand_seq_num for any
// existing rows that predate this change. Idempotent — safe to run
// on every startup.
export async function bootstrapWalkinSequences(): Promise<void> {
  try {
    // 1. Ensure the brand_seq_num column exists (idempotent DDL — safe on any environment,
    //    including production where db:push may not have been run yet).
    await db.execute(drizzleSql`
      ALTER TABLE walkin_leads
        ADD COLUMN IF NOT EXISTS brand_seq_num INTEGER;
    `);

    // 2. Create per-brand sequences (no-op if they already exist)
    await db.execute(drizzleSql`
      CREATE SEQUENCE IF NOT EXISTS walkin_ris_seq START WITH 1 INCREMENT BY 1;
    `);
    await db.execute(drizzleSql`
      CREATE SEQUENCE IF NOT EXISTS walkin_rps_seq START WITH 1 INCREMENT BY 1;
    `);

    // 3. Backfill brand_seq_num for any rows that predate this migration,
    //    numbering them per-brand by their original global seq_num order.
    await db.execute(drizzleSql`
      UPDATE walkin_leads wl
      SET brand_seq_num = sub.rn
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY brand ORDER BY seq_num) AS rn
        FROM walkin_leads
        WHERE brand_seq_num IS NULL
      ) sub
      WHERE wl.id = sub.id
    `);

    // 4. Advance each sequence past the current per-brand max so the next
    //    nextval() call never collides with an already-assigned brand_seq_num.
    const maxRows = await db.execute<{ brand: string; max_seq: string | null }>(drizzleSql`
      SELECT brand, MAX(brand_seq_num) AS max_seq
      FROM walkin_leads
      GROUP BY brand
    `);

    for (const row of maxRows.rows) {
      const seqName = row.brand === "RIS" ? "walkin_ris_seq" : "walkin_rps_seq";
      const nextStart = (parseInt(row.max_seq ?? "0") || 0) + 1;
      // setval(seq, n, false) means the *next* call to nextval() returns n
      await db.execute(drizzleSql`SELECT setval(${seqName}, ${nextStart}, false)`);
    }

    console.log("[walkin/bootstrap] Per-brand sequences ready (walkin_ris_seq, walkin_rps_seq)");
  } catch (err: any) {
    // Log but don't crash startup — worst case, the first nextval() call will
    // fail gracefully at lead-creation time with a clear error message.
    console.error("[walkin/bootstrap] Sequence bootstrap failed:", err?.message);
  }
}

// ── Column layout (single source of truth) ───────────────────────
export const SHEET_HEADERS = [
  "Unique ID",             // A(0)  — LD-DD.MM.YYYY-{RIS|RPS}-brandSeqNum
  "Date",                  // B(1)
  "Time",                  // C(2)
  "Student Name",          // D(3)  ← mandatory (yellow)
  "Father Name",           // E(4)  ← mandatory (yellow)
  "Mother Name",           // F(5)  ← mandatory (yellow)
  "GRADE",                 // G(6)  ← mandatory (yellow)
  "Academic Year",         // H(7)
  "Father Contact",        // I(8)
  "Mother Contact",        // J(9)
  "Email",                 // K(10)
  "Counsellor Name",       // L(11) ← mandatory (yellow)
  "Source",                // M(12) ← mandatory (yellow)
  "Status",                // N(13) ← green (branch-editable)
  "Admission Date",        // O(14) ← green
  "Follow up Remarks",     // P(15) ← green
  "Reason for Closed",     // Q(16) ← green
  "Revisit 1 Date",        // R(17) ← green
  "Revisit 2 Date",        // S(18) ← green
  "Lead ID",               // T(19) ← hidden; upsert key
] as const;

// Index of the Lead ID column (0-based) — used for row matching
const LEAD_ID_COL_INDEX = SHEET_HEADERS.length - 1; // 19 → column T

// Sheet tab name (must match the tab in the actual Google Sheet)
const LEADS_TAB = "WALKINs";

// ── Master (combined RIS + RPS) sheet ────────────────────────────
// Same column layout as brand sheets but with "Brand" prepended as column A.
export const MASTER_SHEET_HEADERS = [
  "Brand",
  ...SHEET_HEADERS,
] as const;

// Lead ID column index in the master sheet (0-based; "S" = index 18)
const MASTER_LEAD_ID_COL_INDEX = MASTER_SHEET_HEADERS.length - 1; // 18

const MASTER_LEADS_TAB = "WALKINs";

// ── In-memory sync status ────────────────────────────────────────
interface SyncStatus {
  lastSyncAt: Date | null;
  dbCount: number;
  sheetCount: number;
  lastError: string | null;
}

const syncStatus: Record<"RIS" | "RPS" | "MASTER", SyncStatus> = {
  RIS:    { lastSyncAt: null, dbCount: 0, sheetCount: 0, lastError: null },
  RPS:    { lastSyncAt: null, dbCount: 0, sheetCount: 0, lastError: null },
  MASTER: { lastSyncAt: null, dbCount: 0, sheetCount: 0, lastError: null },
};

export function getSyncStatus() {
  return { ...syncStatus };
}

// ── Auth client ───────────────────────────────────────────────────
function getAuthClient() {
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) return null;

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

// ── Sheet ID resolver ────────────────────────────────────────────
function getSheetId(brand: "RIS" | "RPS"): string | null {
  if (brand === "RIS") return process.env.RIS_WALKIN_SHEET_ID_2728 || null;
  if (brand === "RPS") return process.env.RPS_WALKIN_SHEET_ID_2728 || null;
  return null;
}

// ── Ensure tab exists (creates it with header row on first use) ───
// Returns true if the tab was just created (caller may want to skip the clear step).
async function ensureLeadsTab(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tabName: string,
  headers: readonly string[],
): Promise<boolean> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const exists = (meta.data.sheets ?? []).some(
    (s: any) => s.properties?.title === tabName,
  );

  if (exists) return false;

  // Create the tab
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  });

  // Write the header row immediately so the tab is never empty
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [headers as unknown as string[]] },
  });

  console.log(`[walkin/sheets] Created tab "${tabName}" and wrote header row`);
  return true; // caller should skip the data-clear step
}

// ── Branch name cache (short-lived, 5-min TTL) ────────────────────
const branchCache: Map<number, { name: string; exp: number }> = new Map();

async function resolveBranchName(branchId: number | null | undefined): Promise<string> {
  if (!branchId) return "";
  const cached = branchCache.get(branchId);
  if (cached && cached.exp > Date.now()) return cached.name;

  const [row] = await db.select({ name: walkinBranches.name })
    .from(walkinBranches)
    .where(eq(walkinBranches.id, branchId));

  const name = row?.name ?? String(branchId);
  branchCache.set(branchId, { name, exp: Date.now() + 5 * 60 * 1000 });
  return name;
}

// ── Date/time helpers ─────────────────────────────────────────────
function formatDateDDMMYYYY(isoDate: string): string {
  // Input: "2026-07-29", Output: "29/07/2026"
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function formatDateDotted(isoDate: string): string {
  // Input: "2026-07-29", Output: "29.07.2026"
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

function formatTime12h(ts: Date): string {
  return ts.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });
}

// ── Row serialiser ────────────────────────────────────────────────
// Maps a WalkinLead DB row to a flat array matching SHEET_HEADERS column order.
export async function leadToRow(lead: WalkinLead): Promise<string[]> {
  const seqPart = lead.brandSeqNum != null ? lead.brandSeqNum : (lead as any).seqNum ?? lead.id;
  const uniqueId = `LD-${formatDateDotted(lead.enquiryDate)}-${lead.brand}-${seqPart}`;
  return [
    uniqueId,                                            // A(0)  Unique ID
    formatDateDDMMYYYY(lead.enquiryDate),                // B(1)  Date
    formatTime12h(lead.createdAt),                       // C(2)  Time
    lead.childName,                                      // D(3)  Student Name
    lead.parentName,                                     // E(4)  Father Name
    (lead as any).motherName ?? "",                      // F(5)  Mother Name
    lead.program,                                        // G(6)  GRADE
    lead.academicYear,                                   // H(7)  Academic Year
    lead.phone,                                          // I(8)  Father Contact
    lead.altPhone ?? "",                                 // J(9)  Mother Contact
    lead.email ?? "",                                    // K(10) Email
    lead.leadOwner ?? "",                                // L(11) Counsellor Name
    lead.source,                                         // M(12) Source
    lead.status,                                         // N(13) Status
    lead.walkInDate ? formatDateDDMMYYYY(lead.walkInDate) : "", // O(14) Admission Date
    lead.remark ?? "",                                   // P(15) Follow up Remarks
    lead.closeReason ?? "",                              // Q(16) Reason for Closed
    lead.revisitDate ? formatDateDDMMYYYY(lead.revisitDate) : "", // R(17) Revisit 1 Date
    (lead as any).revisitDate2 ? formatDateDDMMYYYY((lead as any).revisitDate2) : "", // S(18) Revisit 2 Date
    String(lead.id),                                     // T(19) Lead ID (hidden, upsert key)
  ];
}

// ── Upsert a single lead into the correct brand sheet ────────────
// Find the row by Lead ID in column R; update if found, append if not.
// Retries once on HTTP 429 (rate-limit) after a 2-second pause.
export async function upsertLeadToSheet(
  brand: "RIS" | "RPS",
  lead: WalkinLead,
): Promise<void> {
  const auth = getAuthClient();
  if (!auth) {
    console.warn("[walkin/sheets] Google auth not configured — skipping sheet upsert");
    return;
  }
  const sheetId = getSheetId(brand);
  if (!sheetId) {
    console.warn(`[walkin/sheets] ${brand}_WALKIN_SHEET_ID_2728 not set — skipping upsert`);
    return;
  }

  // Brand guard — never write a RIS lead into the RPS sheet or vice-versa
  if (lead.brand !== brand) {
    console.error(`[walkin/sheets] Brand mismatch: lead.brand=${lead.brand} but target sheet is ${brand} — aborting`);
    return;
  }

  const sheets = google.sheets({ version: "v4", auth });
  const row = await leadToRow(lead);
  // Lead ID column is T = index 19
  const leadIdColLetter = "T";

  // Ensure the WALKINs tab exists (creates it with header row on first use)
  await ensureLeadsTab(sheets, sheetId, LEADS_TAB, SHEET_HEADERS);

  async function doUpsert(retried = false): Promise<void> {
    try {
      // Read the Lead ID column to find any existing row for this lead
      const readResp = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId!,
        range: `${LEADS_TAB}!${leadIdColLetter}:${leadIdColLetter}`,
      });

      const cellValues = readResp.data.values ?? [];
      // Row 0 = header, data starts at row 1 (1-based row 2 in Sheets)
      let existingRowIndex = -1;
      for (let i = 1; i < cellValues.length; i++) {
        if (cellValues[i]?.[0] === String(lead.id)) {
          existingRowIndex = i; // 0-based index in the values array
          break;
        }
      }

      if (existingRowIndex >= 0) {
        // Update existing row (Sheets row = existingRowIndex + 1, 1-based)
        const sheetsRow = existingRowIndex + 1;
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId!,
          range: `${LEADS_TAB}!A${sheetsRow}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [row] },
        });
        console.log(`[walkin/sheets] Updated row ${sheetsRow} for lead ${lead.id} in ${brand} sheet`);
      } else {
        // Append a new row after the last row
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId!,
          range: `${LEADS_TAB}!A1`,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [row] },
        });
        console.log(`[walkin/sheets] Appended new lead ${lead.id} to ${brand} sheet`);
      }

      // Update in-memory sync status
      syncStatus[brand].lastSyncAt = new Date();
      syncStatus[brand].lastError = null;
    } catch (err: any) {
      if (!retried && err?.code === 429) {
        console.warn(`[walkin/sheets] Rate-limited (429) for ${brand} — retrying in 2s`);
        await new Promise((r) => setTimeout(r, 2000));
        return doUpsert(true);
      }
      syncStatus[brand].lastError = err?.message ?? "Unknown error";
      console.error(`[walkin/sheets] Upsert failed for lead ${lead.id} (${brand}):`, err?.message);
    }
  }

  await doUpsert();
}

// ── Fire-and-forget wrapper (used in API route handlers) ─────────
// Never throws — sheet failure must not block the API response.
export function queueUpsert(brand: "RIS" | "RPS", lead: WalkinLead): void {
  upsertLeadToSheet(brand, lead).catch((err) => {
    console.error("[walkin/sheets] Unexpected queue error:", err?.message);
  });
  upsertLeadToMasterSheet(lead).catch((err) => {
    console.error("[walkin/sheets] Master upsert queue error:", err?.message);
  });
}

// ── Upsert a single lead into the master (combined) sheet ────────
export async function upsertLeadToMasterSheet(lead: WalkinLead): Promise<void> {
  const auth = getAuthClient();
  if (!auth) return;
  const sheetId = process.env.MASTER_WALKIN_SHEET_ID_2728 || null;
  if (!sheetId) {
    console.warn("[walkin/sheets] MASTER_WALKIN_SHEET_ID_2728 not set — skipping master upsert");
    return;
  }

  const sheets = google.sheets({ version: "v4", auth });
  const brandRow = await leadToRow(lead);
  const row = [lead.brand, ...brandRow];             // Brand in col A, rest follow
  const leadIdColLetter = "U";                        // Column U = index 20

  // Ensure the WALKINs tab exists in the master sheet
  await ensureLeadsTab(sheets, sheetId, MASTER_LEADS_TAB, MASTER_SHEET_HEADERS);

  async function doUpsert(retried = false): Promise<void> {
    try {
      const readResp = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId!,
        range: `${MASTER_LEADS_TAB}!${leadIdColLetter}:${leadIdColLetter}`,
      });
      const cellValues = readResp.data.values ?? [];
      let existingRowIndex = -1;
      for (let i = 1; i < cellValues.length; i++) {
        if (cellValues[i]?.[0] === String(lead.id)) { existingRowIndex = i; break; }
      }

      if (existingRowIndex >= 0) {
        const sheetsRow = existingRowIndex + 1;
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId!, range: `${MASTER_LEADS_TAB}!A${sheetsRow}`,
          valueInputOption: "USER_ENTERED", requestBody: { values: [row] },
        });
      } else {
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId!, range: `${MASTER_LEADS_TAB}!A1`,
          valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS",
          requestBody: { values: [row] },
        });
      }

      syncStatus.MASTER.lastSyncAt = new Date();
      syncStatus.MASTER.lastError = null;
    } catch (err: any) {
      if (!retried && err?.code === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        return doUpsert(true);
      }
      syncStatus.MASTER.lastError = err?.message ?? "Unknown error";
      console.error(`[walkin/sheets] Master upsert failed for lead ${lead.id}:`, err?.message);
    }
  }

  await doUpsert();
}

// ── Yellow-column protection ─────────────────────────────────────
// Columns A, D, E, F, G, L, M (0-based: 0,3,4,5,6,11,12) are mandatory
// submission fields and must not be overwritten by branch staff after lead
// capture.  This function idempotently replaces our own protections on those
// columns with warningOnly=true guards so editors see a prompt before
// changing them.

/** The exact description string stamped on every protection we own. */
export const YELLOW_PROTECTION_DESCRIPTION =
  "Yellow submission columns — protected by sync";

/** The seven 0-based column indices that carry yellow (submission-field) protections. */
export const YELLOW_COL_INDICES = [0, 3, 4, 5, 6, 11, 12] as const;

/**
 * Description stamped on every Master-sheet read-only protection we own.
 * Master cols A–N (0-based 0–13) are auto-populated by the sync system and
 * must not be overwritten by sheet editors.  Green cols O–T (14–19) remain
 * editable so MIS staff can update Status, Dates, and Remarks.
 */
export const MASTER_YELLOW_PROTECTION_DESCRIPTION =
  "Master read-only columns (A–N) — protected by sync";

/**
 * All 14 0-based column indices in the Master sheet that are sync-managed
 * (Brand, Unique ID, Date, Time, Student Name, Father Name, Mother Name, GRADE,
 * Academic Year, Father Contact, Mother Contact, Email, Counsellor Name, Source).
 */
export const MASTER_YELLOW_COL_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

/**
 * Canonical allowed Status values — used both for sheet dropdowns and pull
 * validation.  Keep in sync with the walkin_statuses seed data.
 */
export const ALLOWED_STATUSES = [
  "OPEN",
  "WALK-IN BOOKED",
  "WALK-IN COMPLETED",
  "ADMISSION DONE",
  "CLOSED",
  "TRANSFERRED",
  "INTEGRATED",
  "NEXT YEAR",
] as const;

/**
 * Status values shown in the brand (RIS / RPS) WALKINs sub-sheets.
 * "WALK-IN BOOKED" is omitted — that status is managed centrally in the
 * Master MIS sheet only.
 */
export const ALLOWED_STATUSES_BRAND = ALLOWED_STATUSES.filter(
  (s) => s !== "WALK-IN BOOKED",
) as readonly string[];

/** Grade / programme options for RIS brand sheet dropdown. */
export const ALLOWED_GRADES_RIS = [
  "Nursery",
  "Junior KG",
  "Senior KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
  "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
] as const;

/** Grade / programme options for RPS brand sheet dropdown. */
export const ALLOWED_GRADES_RPS = [
  "Playgroup",
  "Nursery",
  "Junior KG",
  "Senior KG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4",
] as const;

/** Combined grade list used in the Master MIS sheet (covers both brands). */
export const ALLOWED_GRADES_MASTER = [
  ...ALLOWED_GRADES_RPS,
  ...ALLOWED_GRADES_RIS,
] as readonly string[];

/** Canonical source values — keep in sync with walkin_sources seed data. */
export const ALLOWED_SOURCES = [
  "DM",
  "DW",
  "Referral",
  "Telephonic",
  "Staff Reference",
  "Ex-Rainbow Parent",
] as const;

/** Canonical close-reason values — keep in sync with walkin_close_reasons seed data. */
export const ALLOWED_CLOSE_REASONS = [
  "Location",
  "adm done - other school",
  "High Fees",
  "Not Interested",
  "Continuing in same school",
  "Board Issue",
  "Transfer",
  "Autism",
] as const;

/** Build a setDataValidation request for a dropdown on rows 2-1000. */
function buildDropdownRequest(
  tabSheetId: number,
  colIndex: number,
  options: readonly string[],
): object {
  return {
    setDataValidation: {
      range: {
        sheetId: tabSheetId,
        startRowIndex: 1,      // row 2 (0-based, skips header)
        endRowIndex: 1000,     // covers plenty of data rows
        startColumnIndex: colIndex,
        endColumnIndex: colIndex + 1,
      },
      rule: {
        condition: {
          type: "ONE_OF_LIST",
          values: options.map((s) => ({ userEnteredValue: s })),
        },
        showCustomUi: true,  // renders as a dropdown arrow
        strict: false,       // warning-only; won't block existing non-list values
      },
    },
  };
}

const buildStatusDropdownRequest = (tabSheetId: number, colIndex: number) =>
  buildDropdownRequest(tabSheetId, colIndex, ALLOWED_STATUSES);

const buildBrandStatusDropdownRequest = (tabSheetId: number, colIndex: number) =>
  buildDropdownRequest(tabSheetId, colIndex, ALLOWED_STATUSES_BRAND);

const buildSourceDropdownRequest = (tabSheetId: number, colIndex: number) =>
  buildDropdownRequest(tabSheetId, colIndex, ALLOWED_SOURCES);

const buildCloseReasonDropdownRequest = (tabSheetId: number, colIndex: number) =>
  buildDropdownRequest(tabSheetId, colIndex, ALLOWED_CLOSE_REASONS);

/** Remove any existing data-validation from a column (e.g. email). */
function buildClearValidationRequest(tabSheetId: number, colIndex: number): object {
  return {
    setDataValidation: {
      range: {
        sheetId: tabSheetId,
        startRowIndex: 1,
        endRowIndex: 1000,
        startColumnIndex: colIndex,
        endColumnIndex: colIndex + 1,
      },
      // no `rule` key → clears any existing validation on this column
    },
  };
}

/**
 * Pure helper — exported for unit-testing only.
 *
 * Builds batchUpdate requests for a generic set of column protections:
 *   1. Deletes any existing protections whose description exactly matches
 *      `description` (prevents duplicates on repeated resyncs).
 *   2. Adds fresh warningOnly protections for each column in `colIndices`.
 *
 * Protections with a different description are left untouched.
 */
export function buildColumnProtectionRequests(
  tabSheetId: number,
  existingProtections: Array<{ protectedRangeId: number; description?: string }>,
  description: string,
  colIndices: readonly number[],
): object[] {
  const deleteRequests = existingProtections
    .filter((p) => p.description === description)
    .map((p) => ({
      deleteProtectedRange: { protectedRangeId: p.protectedRangeId },
    }));

  const addRequests = colIndices.map((colIndex) => ({
    addProtectedRange: {
      protectedRange: {
        range: {
          sheetId: tabSheetId,
          startColumnIndex: colIndex,
          endColumnIndex: colIndex + 1,
        },
        description,
        warningOnly: true, // shows a caution dialog; does not block saves
      },
    },
  }));

  return [...deleteRequests, ...addRequests];
}

/**
 * Pure helper — exported for unit-testing only.
 *
 * Given the numeric sheetId of the WALKINs tab and whatever protected ranges
 * the Sheets API already reports for that tab, returns the ordered list of
 * batchUpdate requests that will:
 *   1. Delete any existing protections we own (description matches exactly) to
 *      prevent duplicates accumulating across repeated resyncs.
 *   2. Add fresh warningOnly protections for each yellow column.
 *
 * Protections whose description does NOT match are left untouched.
 */
/** Convenience wrapper — delegates to buildColumnProtectionRequests. */
export function buildYellowProtectionRequests(
  tabSheetId: number,
  existingProtections: Array<{ protectedRangeId: number; description?: string }>,
): object[] {
  return buildColumnProtectionRequests(
    tabSheetId,
    existingProtections,
    YELLOW_PROTECTION_DESCRIPTION,
    YELLOW_COL_INDICES,
  );
}

/** Build warningOnly protection requests for Master cols A–L (indices 0–11). */
export function buildMasterYellowProtectionRequests(
  tabSheetId: number,
  existingProtections: Array<{ protectedRangeId: number; description?: string }>,
): object[] {
  return buildColumnProtectionRequests(
    tabSheetId,
    existingProtections,
    MASTER_YELLOW_PROTECTION_DESCRIPTION,
    MASTER_YELLOW_COL_INDICES,
  );
}

async function applyYellowColumnProtection(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  brand: "RIS" | "RPS",
): Promise<void> {
  // 1. Get spreadsheet metadata (includes protectedRanges for each tab)
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tab = (meta.data.sheets ?? []).find(
    (s: any) => s.properties?.title === LEADS_TAB,
  );
  if (!tab) {
    console.warn(`[walkin/sheets] Tab "${LEADS_TAB}" not found — skipping protection`);
    return;
  }
  const tabSheetId: number = tab.properties!.sheetId!;
  const existingProtections: any[] = tab.protectedRanges ?? [];

  const allowedGrades = brand === "RIS" ? ALLOWED_GRADES_RIS : ALLOWED_GRADES_RPS;

  // 2. Build requests:
  //    • yellow-column protections
  //    • Grade dropdown     (col G = 6)
  //    • Status dropdown    (col N = 13) — "WALK-IN BOOKED" excluded from brand sheets
  //    • Source dropdown    (col M = 12)
  //    • Close Reason       (col Q = 16)
  //    • Clear Email        (col K = 10) — no dropdown needed on email
  const requests = [
    ...buildYellowProtectionRequests(tabSheetId, existingProtections),
    buildDropdownRequest(tabSheetId, 6, allowedGrades),   // col G = GRADE
    buildBrandStatusDropdownRequest(tabSheetId, 13),       // col N = Status
    buildSourceDropdownRequest(tabSheetId, 12),            // col M = Source
    buildCloseReasonDropdownRequest(tabSheetId, 16),       // col Q = Reason for Closed
    buildClearValidationRequest(tabSheetId, 10),           // col K = Email (clear any old dropdown)
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  console.log(
    `[walkin/sheets] Yellow-column protections + dropdowns applied on tab "${LEADS_TAB}" (${brand})`,
  );
}

/**
 * Apply warningOnly protections on Master cols A–L (indices 0–11).
 * Green cols M–R (12–17) are intentionally left unprotected so MIS staff can
 * continue editing Status, Dates, and Remarks directly in the sheet.
 * Non-fatal — a failure here does not abort the resync.
 */
async function applyMasterYellowColumnProtection(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
): Promise<void> {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tab = (meta.data.sheets ?? []).find(
    (s: any) => s.properties?.title === MASTER_LEADS_TAB,
  );
  if (!tab) {
    console.warn(`[walkin/sheets] Master tab "${MASTER_LEADS_TAB}" not found — skipping protection`);
    return;
  }
  const tabSheetId: number = tab.properties!.sheetId!;
  const existingProtections: any[] = tab.protectedRanges ?? [];

  const requests = [
    ...buildMasterYellowProtectionRequests(tabSheetId, existingProtections),
    buildDropdownRequest(tabSheetId, 7, ALLOWED_GRADES_MASTER), // col H = GRADE
    buildStatusDropdownRequest(tabSheetId, 14),                  // col O = Status (full list incl. WALK-IN BOOKED)
    buildSourceDropdownRequest(tabSheetId, 13),                  // col N = Source
    buildCloseReasonDropdownRequest(tabSheetId, 17),             // col R = Reason for Closed
    buildClearValidationRequest(tabSheetId, 11),                 // col L = Email (clear any old dropdown)
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  console.log(
    `[walkin/sheets] Master A–L protections + Status/Source dropdowns applied on tab "${MASTER_LEADS_TAB}"`,
  );
}

// ── Full resync: rewrite entire WALKINs tab from DB ──────────────
// Fetches all non-archived leads for the brand, clears data rows (keeps header),
// then batch-appends all rows. Returns counts for the admin response.
export async function resyncBrandToSheet(brand: "RIS" | "RPS"): Promise<{
  dbCount: number;
  sheetCount: number;
}> {
  const auth = getAuthClient();
  if (!auth) throw new Error("Google auth not configured (GOOGLE_REFRESH_TOKEN missing)");

  const sheetId = getSheetId(brand);
  if (!sheetId) throw new Error(`${brand}_WALKIN_SHEET_ID_2728 env var not set`);

  const sheets = google.sheets({ version: "v4", auth });

  // 1. Fetch all non-archived leads for this brand from DB
  const leads = await db
    .select()
    .from(walkinLeads)
    .where(and(eq(walkinLeads.brand, brand), eq(walkinLeads.isArchived, false)))
    .orderBy(walkinLeads.enquiryDate);

  // 2. Serialise all rows
  const dataRows = await Promise.all(leads.map(leadToRow));

  // 3. Ensure the WALKINs tab exists (creates it with header on first run).
  //    If it was just created, skip the clear — there is nothing to clear.
  const tabWasCreated = await ensureLeadsTab(sheets, sheetId, LEADS_TAB, SHEET_HEADERS);

  if (!tabWasCreated) {
    // 3a. Clear existing data rows (A2:end), preserving the header row
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `${LEADS_TAB}!A2:Z`,
      });
    } catch (err: any) {
      console.warn(`[walkin/sheets] Clear failed for ${brand}:`, err?.message);
    }

    // 3b. Re-write header row (ensures it's always up to date)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [SHEET_HEADERS as unknown as string[]] },
    });
  }

  // 5. Write data rows (OVERWRITE uses existing empty cells; avoids row-shift that loses validation)
  if (dataRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: dataRows },
    });
  }

  // 6. Protect yellow columns + Status/Source dropdowns — non-fatal; resync still succeeds if this fails
  try {
    await applyYellowColumnProtection(sheets, sheetId, brand);
  } catch (err: any) {
    console.warn(
      `[walkin/sheets] Could not apply yellow-column protections for ${brand}:`,
      err?.message,
    );
  }

  // 7. Update sync status
  syncStatus[brand].lastSyncAt = new Date();
  syncStatus[brand].dbCount = leads.length;
  syncStatus[brand].sheetCount = dataRows.length;
  syncStatus[brand].lastError = null;

  console.log(`[walkin/sheets] Resynced ${brand}: ${leads.length} leads written to sheet`);
  return { dbCount: leads.length, sheetCount: dataRows.length };
}

// ── Full resync for the master (combined) sheet ──────────────────
// Fetches all non-archived leads for both brands, clears data rows,
// writes the combined header row, then batch-appends all leads sorted by date.
export async function resyncMasterSheet(): Promise<{ dbCount: number; sheetCount: number }> {
  const auth = getAuthClient();
  if (!auth) throw new Error("Google auth not configured (GOOGLE_REFRESH_TOKEN missing)");

  const sheetId = process.env.MASTER_WALKIN_SHEET_ID_2728;
  if (!sheetId) throw new Error("MASTER_WALKIN_SHEET_ID_2728 env var not set");

  const sheets = google.sheets({ version: "v4", auth });

  // 1. Fetch all non-archived leads (both brands), ordered by date
  const leads = await db
    .select()
    .from(walkinLeads)
    .where(eq(walkinLeads.isArchived, false))
    .orderBy(walkinLeads.enquiryDate, walkinLeads.id);

  // 2. Serialise — prepend Brand column to each row
  const dataRows = await Promise.all(
    leads.map(async (l) => [l.brand, ...(await leadToRow(l))])
  );

  // 3. Ensure the WALKINs tab exists in the master sheet.
  //    If it was just created, skip the clear — the tab is already empty.
  const masterTabWasCreated = await ensureLeadsTab(sheets, sheetId, MASTER_LEADS_TAB, MASTER_SHEET_HEADERS);

  if (!masterTabWasCreated) {
    // Clear data rows
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A2:Z`,
      });
    } catch (err: any) {
      console.warn("[walkin/sheets] Master clear failed:", err?.message);
    }

    // Re-write header row (ensures it stays current)
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [MASTER_SHEET_HEADERS as unknown as string[]] },
    });
  }

  // 5. Write data rows (OVERWRITE — avoids row-shift that strips data validation)
  if (dataRows.length > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: dataRows },
    });
  }

  // 6. Protect Master cols A–L (read-only) + Status/Source dropdowns — non-fatal
  try {
    await applyMasterYellowColumnProtection(sheets, sheetId);
  } catch (err: any) {
    console.warn(`[walkin/sheets] Could not apply Master column protections:`, err?.message);
  }

  syncStatus.MASTER.lastSyncAt = new Date();
  syncStatus.MASTER.dbCount = leads.length;
  syncStatus.MASTER.sheetCount = dataRows.length;
  syncStatus.MASTER.lastError = null;

  console.log(`[walkin/sheets] Master resynced: ${leads.length} leads (RIS + RPS combined)`);
  return { dbCount: leads.length, sheetCount: dataRows.length };
}

// ── Sheet → DB pull (two-way sync) ──────────────────────────────
// Reads the green columns (L-Q) for every row in a brand sheet.
// For each row whose Lead ID (col R) exists in the DB, compares values
// and writes back any differences to the DB plus an audit entry.

interface LeadChange {
  leadId: string;
  parentName: string;
  field: string;
  oldVal: string | null;
  newVal: string | null;
}

interface PullLogEntry {
  timestamp: Date;
  brand: "RIS" | "RPS" | "MASTER";
  rowsScanned: number;
  changesApplied: number;
  errors: string[];
  changes: LeadChange[];
}

const _pullLog: PullLogEntry[] = [];

export function getPullLog(): PullLogEntry[] {
  return [..._pullLog];
}

/** Parse a DD/MM/YYYY sheet date back to YYYY-MM-DD for the DB. */
function parseDateFromSheet(d: string): string | null {
  if (!d || d.trim() === "") return null;
  const parts = d.trim().split("/");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (!yyyy || !mm || !dd) return null;
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}

export async function pullChangesFromSheet(brand: "RIS" | "RPS"): Promise<PullLogEntry> {
  const entry: PullLogEntry = {
    timestamp: new Date(),
    brand,
    rowsScanned: 0,
    changesApplied: 0,
    errors: [],
    changes: [],
  };

  const auth = getAuthClient();
  if (!auth) {
    entry.errors.push("Google auth not configured");
    _pullLog.unshift(entry);
    if (_pullLog.length > 100) _pullLog.pop();
    return entry;
  }

  const sheetId = getSheetId(brand);
  if (!sheetId) {
    entry.errors.push(`${brand}_WALKIN_SHEET_ID_2728 not set`);
    _pullLog.unshift(entry);
    if (_pullLog.length > 100) _pullLog.pop();
    return entry;
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read all data columns A:R from the sheet
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A:R`,
    });

    const rows = resp.data.values ?? [];
    // Row 0 = header, data starts at 1
    const dataRows = rows.slice(1);
    entry.rowsScanned = dataRows.length;

    // Fetch the allowlist of valid statuses from the DB once, before the loop.
    // Only the `name` column is needed; brand-specific + global statuses are both valid.
    let allowedStatuses: Set<string>;
    try {
      const statusRows = await db
        .select({ label: walkinStatuses.label })
        .from(walkinStatuses);
      allowedStatuses = new Set(statusRows.map((r) => r.label));
    } catch (e: any) {
      // If the lookup fails, fall back to blocking all status changes so we never
      // write an unvalidated value — and surface the error in the pull log.
      entry.errors.push(`Failed to load allowed statuses — status changes skipped: ${e?.message}`);
      allowedStatuses = new Set();
    }

    // Fetch the allowlist of valid close reasons from the DB once, before the loop.
    let allowedCloseReasons: Set<string>;
    try {
      const closeReasonRows = await db
        .select({ label: walkinCloseReasons.label })
        .from(walkinCloseReasons);
      allowedCloseReasons = new Set(closeReasonRows.map((r) => r.label));
    } catch (e: any) {
      // If the lookup fails, block all close-reason changes to avoid writing
      // unvalidated values — surface the error in the pull log.
      entry.errors.push(`Failed to load allowed close reasons — close-reason changes skipped: ${e?.message}`);
      allowedCloseReasons = new Set();
    }

    // Collect rows that need propagating to Master after the main loop
    const pendingMasterUpdates: Array<{ leadId: string; greenValues: string[] }> = [];

    for (const row of dataRows) {
      const leadId = row[19]?.trim(); // column T (index 19) = Lead ID
      if (!leadId) continue;

      // Green column values from sheet
      const sheetStatus        = row[13]?.trim() ?? "";              // N = Status
      const sheetWalkInDate    = parseDateFromSheet(row[14] ?? "");  // O = Admission Date
      const sheetRemark        = row[15]?.trim() ?? "";              // P = Follow up Remarks
      const sheetCloseReason   = row[16]?.trim() ?? "";              // Q = Reason for Closed
      const sheetRevisitDate   = parseDateFromSheet(row[17] ?? "");  // R = Revisit 1 Date
      const sheetRevisitDate2  = parseDateFromSheet(row[18] ?? "");  // S = Revisit 2 Date

      // Fetch current DB record
      let existing: any;
      try {
        const [found] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, leadId));
        existing = found;
      } catch (e: any) {
        entry.errors.push(`DB lookup failed for lead ${leadId}: ${e?.message}`);
        continue;
      }
      if (!existing || existing.isArchived) continue;

      // Compare each green field and collect changes
      type FieldChange = { field: string; oldVal: string | null; newVal: string | null };
      const changes: FieldChange[] = [];

      const check = (field: string, dbVal: string | null | undefined, sheetVal: string | null) => {
        const db_ = dbVal ?? null;
        const sh_ = sheetVal || null; // treat empty string as null
        if (db_ !== sh_) changes.push({ field, oldVal: db_, newVal: sh_ });
      };

      if (sheetStatus) {
        if (allowedStatuses.size > 0 && !allowedStatuses.has(sheetStatus)) {
          // Invalid status from sheet — skip and surface in pull log so an admin can investigate.
          entry.errors.push(
            `Lead ${leadId}: sheet status "${sheetStatus}" is not a recognised status — skipped (valid values: ${[...allowedStatuses].join(", ")})`
          );
        } else {
          check("status", existing.status, sheetStatus);
        }
      }
      check("walkInDate",          existing.walkInDate,          sheetWalkInDate);
      check("remark",              existing.remark,              sheetRemark || null);
      if (sheetCloseReason) {
        if (allowedCloseReasons.size > 0 && !allowedCloseReasons.has(sheetCloseReason)) {
          // Invalid close reason from sheet — skip and surface in pull log.
          entry.errors.push(
            `Lead ${leadId}: sheet close reason "${sheetCloseReason}" is not a recognised close reason — skipped (valid values: ${[...allowedCloseReasons].join(", ")})`
          );
        } else {
          check("closeReason", existing.closeReason, sheetCloseReason);
        }
      } else {
        check("closeReason",       existing.closeReason,         null);
      }
      check("revisitDate",          existing.revisitDate,          sheetRevisitDate);
      check("revisitDate2",         (existing as any).revisitDate2, sheetRevisitDate2);

      if (changes.length === 0) continue;

      // Build patch
      const patch: Record<string, any> = { updatedBy: "sheet-sync", updatedAt: new Date() };
      for (const c of changes) patch[c.field] = c.newVal;

      try {
        await db.update(walkinLeads).set(patch).where(eq(walkinLeads.id, leadId));

        // Write audit rows
        await Promise.all(
          changes.map((c) =>
            db.insert(walkinLeadAuditLog).values({
              leadId,
              field: c.field,
              oldValue: c.oldVal,
              newValue: c.newVal,
              changedBy: "sheet-sync",
            })
          )
        );

        entry.changesApplied += changes.length;

        // Record per-lead change detail in the pull log entry
        for (const c of changes) {
          entry.changes.push({
            leadId,
            parentName: existing.parentName ?? "",
            field: c.field,
            oldVal: c.oldVal,
            newVal: c.newVal,
          });
        }

        // Queue this row for Master propagation
        pendingMasterUpdates.push({
          leadId,
          greenValues: [
            row[13] ?? "",  // N Status           → Master col O
            row[14] ?? "",  // O Admission Date   → Master col P
            row[15] ?? "",  // P Follow up Remarks → Master col Q
            row[16] ?? "",  // Q Reason for Closed → Master col R
            row[17] ?? "",  // R Revisit 1 Date   → Master col S
            row[18] ?? "",  // S Revisit 2 Date   → Master col T
          ],
        });
      } catch (e: any) {
        entry.errors.push(`DB update failed for lead ${leadId}: ${e?.message}`);
      }
    }

    // ── Propagate edits to Master MIS sheet ─────────────────────
    if (pendingMasterUpdates.length > 0) {
      const masterSheetId = process.env.MASTER_WALKIN_SHEET_ID_2728;
      if (masterSheetId) {
        try {
          // Read Lead ID column from Master (column U = index 20)
          const masterIdResp = await sheets.spreadsheets.values.get({
            spreadsheetId: masterSheetId,
            range: `${MASTER_LEADS_TAB}!U:U`,
          });
          const masterIds = masterIdResp.data.values ?? [];
          const leadIdToMasterRow = new Map<string, number>();
          masterIds.forEach((r, idx) => {
            const id = r[0]?.trim();
            if (id && idx > 0) leadIdToMasterRow.set(id, idx + 1); // 1-based row number
          });

          const batchData = pendingMasterUpdates
            .filter(u => leadIdToMasterRow.has(u.leadId))
            .map(u => ({
              range: `${MASTER_LEADS_TAB}!O${leadIdToMasterRow.get(u.leadId)}:T${leadIdToMasterRow.get(u.leadId)}`,
              values: [u.greenValues],
            }));

          if (batchData.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
              spreadsheetId: masterSheetId,
              requestBody: { valueInputOption: "USER_ENTERED", data: batchData },
            });
            console.log(`[walkin/sheets] Master propagated ${batchData.length} row(s) from ${brand}`);
          }
        } catch (e: any) {
          console.warn(`[walkin/sheets] Master propagation failed: ${e?.message}`);
          entry.errors.push(`Master propagation: ${e?.message}`);
        }
      }
    }
  } catch (e: any) {
    entry.errors.push(`Sheet read failed: ${e?.message}`);
    syncStatus[brand].lastError = e?.message ?? "Pull failed";
  }

  console.log(
    `[walkin/sheets] Pull ${brand}: scanned=${entry.rowsScanned} changes=${entry.changesApplied} errors=${entry.errors.length}`
  );

  _pullLog.unshift(entry);
  if (_pullLog.length > 100) _pullLog.pop();
  return entry;
}

// ── Master MIS → DB + Brand Sheets pull (reverse sync) ──────────
// Reads the green columns (M–R) in the Master sheet.
// For each changed row: updates the DB, then back-propagates to the
// corresponding RIS or RPS brand sheet (columns L–Q).
// No circular loop: both pulls compare against the DB; after one side
// writes, the other side finds DB == sheet and skips.
export async function pullChangesFromMasterSheet(): Promise<PullLogEntry> {
  const entry: PullLogEntry = {
    timestamp: new Date(),
    brand: "MASTER",
    rowsScanned: 0,
    changesApplied: 0,
    errors: [],
    changes: [],
  };

  const auth = getAuthClient();
  if (!auth) {
    entry.errors.push("Google auth not configured");
    _pullLog.unshift(entry); if (_pullLog.length > 100) _pullLog.pop();
    return entry;
  }

  const masterSheetId = process.env.MASTER_WALKIN_SHEET_ID_2728;
  if (!masterSheetId) {
    entry.errors.push("MASTER_WALKIN_SHEET_ID_2728 not set");
    _pullLog.unshift(entry); if (_pullLog.length > 100) _pullLog.pop();
    return entry;
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read A:S — Brand(A=0) … Status(M=12) … MIS Calling(R=17) … Lead ID(S=18)
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: `${MASTER_LEADS_TAB}!A:S`,
    });

    const rows = resp.data.values ?? [];
    const dataRows = rows.slice(1); // skip header
    entry.rowsScanned = dataRows.length;

    let allowedStatuses: Set<string>;
    try {
      const statusRows = await db.select({ label: walkinStatuses.label }).from(walkinStatuses);
      allowedStatuses = new Set(statusRows.map((r) => r.label));
    } catch (e: any) {
      entry.errors.push(`Failed to load allowed statuses — status changes skipped: ${e?.message}`);
      allowedStatuses = new Set();
    }

    let allowedCloseReasons: Set<string>;
    try {
      const closeReasonRows = await db.select({ label: walkinCloseReasons.label }).from(walkinCloseReasons);
      allowedCloseReasons = new Set(closeReasonRows.map((r) => r.label));
    } catch (e: any) {
      entry.errors.push(`Failed to load allowed close reasons — close-reason changes skipped: ${e?.message}`);
      allowedCloseReasons = new Set();
    }

    // Collect rows per brand to back-propagate to their brand sheets after the loop
    const pendingBrandUpdates: Record<"RIS" | "RPS", Array<{ leadId: string; greenValues: string[] }>> = {
      RIS: [],
      RPS: [],
    };

    for (const row of dataRows) {
      const brand = (row[0]?.trim() ?? "") as "RIS" | "RPS";
      if (brand !== "RIS" && brand !== "RPS") continue;

      const leadId = row[20]?.trim(); // col U (index 20) = Lead ID
      if (!leadId) continue;

      // Green columns from Master (O–T = indices 14–19)
      const sheetStatus       = row[14]?.trim() ?? "";             // O = Status
      const sheetWalkInDate   = parseDateFromSheet(row[15] ?? ""); // P = Admission Date
      const sheetRemark       = row[16]?.trim() ?? "";             // Q = Follow-up Remarks
      const sheetCloseReason  = row[17]?.trim() ?? "";             // R = Reason for Closed
      const sheetRevisitDate  = parseDateFromSheet(row[18] ?? ""); // S = Revisit 1 Date
      const sheetRevisitDate2 = parseDateFromSheet(row[19] ?? ""); // T = Revisit 2 Date

      let existing: any;
      try {
        const [found] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, leadId));
        existing = found;
      } catch (e: any) {
        entry.errors.push(`DB lookup failed for lead ${leadId}: ${e?.message}`);
        continue;
      }
      if (!existing || existing.isArchived) continue;

      type FieldChange = { field: string; oldVal: string | null; newVal: string | null };
      const changes: FieldChange[] = [];
      const check = (field: string, dbVal: string | null | undefined, sheetVal: string | null) => {
        const db_ = dbVal ?? null;
        const sh_ = sheetVal || null;
        if (db_ !== sh_) changes.push({ field, oldVal: db_, newVal: sh_ });
      };

      if (sheetStatus) {
        if (allowedStatuses.size > 0 && !allowedStatuses.has(sheetStatus)) {
          entry.errors.push(
            `Lead ${leadId}: Master status "${sheetStatus}" not recognised — skipped`
          );
        } else {
          check("status", existing.status, sheetStatus);
        }
      }
      check("walkInDate",        existing.walkInDate,        sheetWalkInDate);
      check("remark",            existing.remark,            sheetRemark || null);
      if (sheetCloseReason) {
        if (allowedCloseReasons.size > 0 && !allowedCloseReasons.has(sheetCloseReason)) {
          entry.errors.push(
            `Lead ${leadId}: Master close reason "${sheetCloseReason}" is not a recognised close reason — skipped (valid values: ${[...allowedCloseReasons].join(", ")})`
          );
        } else {
          check("closeReason", existing.closeReason, sheetCloseReason);
        }
      } else {
        check("closeReason",     existing.closeReason,       null);
      }
      check("revisitDate",        existing.revisitDate,           sheetRevisitDate);
      check("revisitDate2",       (existing as any).revisitDate2, sheetRevisitDate2);

      if (changes.length === 0) continue;

      const patch: Record<string, any> = { updatedBy: "master-sync", updatedAt: new Date() };
      for (const c of changes) patch[c.field] = c.newVal;

      try {
        await db.update(walkinLeads).set(patch).where(eq(walkinLeads.id, leadId));
        await Promise.all(
          changes.map((c) =>
            db.insert(walkinLeadAuditLog).values({
              leadId, field: c.field,
              oldValue: c.oldVal, newValue: c.newVal,
              changedBy: "master-sync",
            })
          )
        );

        entry.changesApplied += changes.length;
        for (const c of changes) {
          entry.changes.push({ leadId, parentName: existing.parentName ?? "", field: c.field, oldVal: c.oldVal, newVal: c.newVal });
        }

        // Queue back-propagation to brand sheet (O–T → N–S)
        pendingBrandUpdates[brand].push({
          leadId,
          greenValues: [
            row[14] ?? "",  // O Status           → brand col N
            row[15] ?? "",  // P Admission Date   → brand col O
            row[16] ?? "",  // Q Follow-up Remarks → brand col P
            row[17] ?? "",  // R Reason for Closed → brand col Q
            row[18] ?? "",  // S Revisit 1 Date   → brand col R
            row[19] ?? "",  // T Revisit 2 Date   → brand col S
          ],
        });
      } catch (e: any) {
        entry.errors.push(`DB update failed for lead ${leadId}: ${e?.message}`);
      }
    }

    // Back-propagate to RIS / RPS brand sheets
    for (const brand of ["RIS", "RPS"] as const) {
      const updates = pendingBrandUpdates[brand];
      if (updates.length === 0) continue;

      const brandSheetId = getSheetId(brand);
      if (!brandSheetId) continue;

      try {
        // Look up row numbers by Lead ID in brand sheet col T (index 19)
        const idResp = await sheets.spreadsheets.values.get({
          spreadsheetId: brandSheetId,
          range: `${LEADS_TAB}!T:T`,
        });
        const idRows = idResp.data.values ?? [];
        const leadIdToRow = new Map<string, number>();
        idRows.forEach((r, idx) => {
          const id = r[0]?.trim();
          if (id && idx > 0) leadIdToRow.set(id, idx + 1); // 1-based
        });

        const batchData = updates
          .filter((u) => leadIdToRow.has(u.leadId))
          .map((u) => ({
            range: `${LEADS_TAB}!N${leadIdToRow.get(u.leadId)}:S${leadIdToRow.get(u.leadId)}`,
            values: [u.greenValues],
          }));

        if (batchData.length > 0) {
          await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: brandSheetId,
            requestBody: { valueInputOption: "USER_ENTERED", data: batchData },
          });
          console.log(`[walkin/sheets] ${brand} sheet back-propagated ${batchData.length} row(s) from Master`);
        }
      } catch (e: any) {
        console.warn(`[walkin/sheets] ${brand} back-propagation failed: ${e?.message}`);
        entry.errors.push(`${brand} back-propagation: ${e?.message}`);
      }
    }
  } catch (e: any) {
    entry.errors.push(`Master sheet read failed: ${e?.message}`);
  }

  console.log(
    `[walkin/sheets] Pull MASTER: scanned=${entry.rowsScanned} changes=${entry.changesApplied} errors=${entry.errors.length}`
  );

  _pullLog.unshift(entry);
  if (_pullLog.length > 100) _pullLog.pop();
  return entry;
}

// ── Sync deletions: archive DB leads missing from Master MIS ─────
// Call this when rows have been manually deleted from the Master MIS
// WALKINs tab. It reads the current Lead ID column from Master, finds
// any non-archived DB leads that are no longer listed there, archives
// them in the DB, and marks them ARCHIVED in their brand sheet.
// This is intentionally a manual/explicit action — not part of auto-pull —
// to avoid accidental mass-archival if the sheet read fails transiently.
export async function syncDeletionsFromMaster(): Promise<{
  archived: number;
  details: Array<{ leadId: string; brand: "RIS" | "RPS"; parentName: string }>;
  errors: string[];
}> {
  const result = {
    archived: 0,
    details: [] as Array<{ leadId: string; brand: "RIS" | "RPS"; parentName: string }>,
    errors: [] as string[],
  };

  const auth = getAuthClient();
  if (!auth) { result.errors.push("Google auth not configured"); return result; }

  const masterSheetId = process.env.MASTER_WALKIN_SHEET_ID_2728;
  if (!masterSheetId) { result.errors.push("MASTER_WALKIN_SHEET_ID_2728 not set"); return result; }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read just the Lead ID column from Master (col U = index 20)
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: `${MASTER_LEADS_TAB}!U:U`,
    });

    const rows = resp.data.values ?? [];
    const masterLeadIds = new Set(
      rows.slice(1) // skip header row
        .map((r) => r[0]?.trim())
        .filter(Boolean) as string[]
    );

    // Get all non-archived leads from DB
    const dbLeads = await db
      .select({ id: walkinLeads.id, brand: walkinLeads.brand, parentName: walkinLeads.parentName })
      .from(walkinLeads)
      .where(eq(walkinLeads.isArchived, false));

    // Leads in DB but NOT in Master sheet → were deleted from Master
    const toArchive = dbLeads.filter((l) => !masterLeadIds.has(l.id));

    if (toArchive.length === 0) return result;

    for (const lead of toArchive) {
      try {
        // Archive in DB
        await db
          .update(walkinLeads)
          .set({ isArchived: true, updatedBy: "master-deletion-sync", updatedAt: new Date() })
          .where(eq(walkinLeads.id, lead.id));

        await db.insert(walkinLeadAuditLog).values({
          leadId: lead.id,
          field: "isArchived",
          oldValue: "false",
          newValue: "true",
          changedBy: "master-deletion-sync",
        });

        // Mark ARCHIVED in brand sheet (best-effort, non-fatal)
        if (lead.brand === "RIS" || lead.brand === "RPS") {
          await removeLeadFromSheet(lead.brand, lead.id).catch((e: any) => {
            result.errors.push(`${lead.id}: brand sheet ARCHIVED mark failed — ${e?.message}`);
          });
        }

        result.archived++;
        result.details.push({
          leadId: lead.id,
          brand: lead.brand as "RIS" | "RPS",
          parentName: lead.parentName ?? "",
        });

        console.log(`[walkin/sheets] syncDeletionsFromMaster: archived ${lead.id} (${lead.brand})`);
      } catch (e: any) {
        result.errors.push(`${lead.id}: DB archive failed — ${e?.message}`);
      }
    }
  } catch (e: any) {
    result.errors.push(`Master sheet read failed: ${e?.message}`);
  }

  console.log(
    `[walkin/sheets] syncDeletionsFromMaster: archived=${result.archived} errors=${result.errors.length}`
  );
  return result;
}

// ── Remove (archive) a lead from a brand sheet ───────────────────
// Finds the row by Lead ID (col R) and overwrites the Status cell (col L)
// with "ARCHIVED". Never deletes the row — keeps sheet history intact and
// avoids disturbing range protections tied to row indices.
export async function removeLeadFromSheet(
  brand: "RIS" | "RPS",
  leadId: string,
): Promise<void> {
  const auth = getAuthClient();
  if (!auth) {
    console.warn("[walkin/sheets] Google auth not configured — skipping sheet removal");
    return;
  }
  const sheetId = getSheetId(brand);
  if (!sheetId) {
    console.warn(`[walkin/sheets] ${brand}_WALKIN_SHEET_ID_2728 not set — skipping removal`);
    return;
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read Lead ID column (T = index 19) to locate the row
    const readResp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!T:T`,
    });
    const cellValues = readResp.data.values ?? [];

    let sheetsRow = -1;
    for (let i = 1; i < cellValues.length; i++) {
      if (cellValues[i]?.[0] === String(leadId)) {
        sheetsRow = i + 1; // convert 0-based array index to 1-based Sheets row
        break;
      }
    }

    if (sheetsRow < 0) {
      console.warn(`[walkin/sheets] Lead ${leadId} not found in ${brand} sheet — nothing to remove`);
      return;
    }

    // Overwrite Status cell (column N = index 13) with "ARCHIVED"
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!N${sheetsRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["ARCHIVED"]] },
    });

    console.log(`[walkin/sheets] Marked lead ${leadId} as ARCHIVED in ${brand} sheet (row ${sheetsRow})`);
    syncStatus[brand].lastSyncAt = new Date();
    syncStatus[brand].lastError = null;
  } catch (err: any) {
    syncStatus[brand].lastError = err?.message ?? "Unknown error";
    console.error(`[walkin/sheets] removeLeadFromSheet failed for lead ${leadId} (${brand}):`, err?.message);
  }
}

// ── Remove (archive) a lead from the Master MIS sheet ────────────
// Same approach: find by Lead ID (col S) and overwrite Status (col M).
export async function removeLeadFromMasterSheet(leadId: string): Promise<void> {
  const auth = getAuthClient();
  if (!auth) return;
  const sheetId = process.env.MASTER_WALKIN_SHEET_ID_2728 || null;
  if (!sheetId) {
    console.warn("[walkin/sheets] MASTER_WALKIN_SHEET_ID_2728 not set — skipping master removal");
    return;
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    // Read Lead ID column (U = index 20) to locate the row
    const readResp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${MASTER_LEADS_TAB}!U:U`,
    });
    const cellValues = readResp.data.values ?? [];

    let sheetsRow = -1;
    for (let i = 1; i < cellValues.length; i++) {
      if (cellValues[i]?.[0] === String(leadId)) {
        sheetsRow = i + 1;
        break;
      }
    }

    if (sheetsRow < 0) {
      console.warn(`[walkin/sheets] Lead ${leadId} not found in Master sheet — nothing to remove`);
      return;
    }

    // Overwrite Status cell (column O = index 14) with "ARCHIVED"
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${MASTER_LEADS_TAB}!O${sheetsRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["ARCHIVED"]] },
    });

    console.log(`[walkin/sheets] Marked lead ${leadId} as ARCHIVED in Master sheet (row ${sheetsRow})`);
    syncStatus.MASTER.lastSyncAt = new Date();
    syncStatus.MASTER.lastError = null;
  } catch (err: any) {
    syncStatus.MASTER.lastError = err?.message ?? "Unknown error";
    console.error(`[walkin/sheets] removeLeadFromMasterSheet failed for lead ${leadId}:`, err?.message);
  }
}

// ── Fire-and-forget wrapper for archival sheet updates ────────────
// Never throws — sheet failure must not block the API response.
export function queueRemove(brand: "RIS" | "RPS", leadId: string): void {
  removeLeadFromSheet(brand, leadId).catch((err) => {
    console.error("[walkin/sheets] Unexpected remove error:", err?.message);
  });
  removeLeadFromMasterSheet(leadId).catch((err) => {
    console.error("[walkin/sheets] Master remove error:", err?.message);
  });
}

// ── CRM Leads Tracker — sheet reader & stats aggregator ──────────
// Reads the "CRM Leads Tracker" tab (not WALKINs) directly from the
// brand's Google Sheet and computes dashboard KPIs.
// Column layout (0-based, row 1 = header):
//   A(0)=Date  B(1)=Time  C(2)=Parent's Name  D(3)=Child's Name
//   E(4)=Phone  F(5)=Program  G(6)=Status  H(7)=Remark
//   I(8)=Lead Owner  J(9)=Source  K(10)=Walk-In Date
//   L(11)=Revisit Date  M(12)=Email ID

const CRM_TAB = "CRM Leads Tracker";

const CRM_MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** Parse DD/MM/YYYY or YYYY-MM-DD → "Mon-YY" month label. */
function parseCrmMonthLabel(raw: string): string {
  const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const m = parseInt(dmy[2], 10) - 1;
    const y = parseInt(dmy[3], 10);
    return `${CRM_MONTH_NAMES[m] ?? "Unk"}-${String(y).slice(2)}`;
  }
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymd) {
    const m = parseInt(ymd[2], 10) - 1;
    const y = parseInt(ymd[1], 10);
    return `${CRM_MONTH_NAMES[m] ?? "Unk"}-${String(y).slice(2)}`;
  }
  return "Unknown";
}

/** Sort key for "Mon-YY" labels that works across year boundaries. */
function crmMonthSortKey(label: string): number {
  const [mon, yr] = label.split("-");
  const m = CRM_MONTH_NAMES.indexOf(mon);
  const y = parseInt(yr, 10);
  const fullYear = y < 50 ? 2000 + y : 1900 + y;
  return fullYear * 12 + (m < 0 ? 0 : m);
}

export interface CrmStats {
  brand: string;
  academicYear: string;
  kpis: { totalLeads: number; bookings: number; walkins: number; admissions: number };
  monthly: Array<{ month: string; cnt: number }>;
  monthlyDetail: Array<{ month: string; leads: number; walkins: number; admissions: number; closed: number }>;
  bySource: Array<{ source: string; cnt: number }>;
  byBranch: Array<{ branchId: number | null; cnt: number }>;
  byOwner: Array<{ leadOwner: string | null; cnt: number }>;
  statusBreakdown: Array<{ status: string; cnt: number }>;
  byCounsellor: Array<{ leadOwner: string; leads: number; walkins: number; admissions: number; closed: number; open: number }>;
  byProgram: Array<{ program: string; cnt: number }>;
  generatedAt: string;
}

/**
 * Reads the "CRM Leads Tracker" tab from the brand's Google Sheet and
 * returns aggregated stats in the same shape as /api/walkin/stats.
 * byBranch is always [] — the CRM tab has no branch column.
 */
export async function readCrmLeadsTrackerStats(brand: "RIS" | "RPS"): Promise<CrmStats> {
  const auth = getAuthClient();
  if (!auth) throw new Error("Google Sheets auth not configured");
  const sheets = google.sheets({ version: "v4", auth });
  const sheetId = getSheetId(brand);
  if (!sheetId) throw new Error(`Sheet ID not configured for ${brand}`);

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${CRM_TAB}'!A:M`,
  });

  const rows = res.data.values ?? [];
  const dataRows = rows.slice(1); // skip header row

  let totalLeads = 0, bookings = 0, walkins = 0, admissions = 0;

  const monthMap       = new Map<string, number>();
  const monthDetailMap = new Map<string, { leads: number; walkins: number; admissions: number; closed: number }>();
  const sourceMap      = new Map<string, number>();
  const ownerMap       = new Map<string, number>();
  const statusMap      = new Map<string, number>();
  const counsellorMap  = new Map<string, { leads: number; walkins: number; admissions: number; closed: number; open: number }>();
  const programMap     = new Map<string, number>();

  for (const row of dataRows) {
    const date = (row[0] ?? "").toString().trim();
    if (!date) continue; // skip completely blank rows

    const status     = (row[6] ?? "").toString().trim().toUpperCase();
    const source     = (row[9] ?? "").toString().trim() || "Unknown";
    const leadOwner  = (row[8] ?? "").toString().trim() || null;
    const program    = (row[5] ?? "").toString().trim() || "Unknown";
    const monthLabel = parseCrmMonthLabel(date);

    const isWalkin    = ["WALK-IN COMPLETED", "ADMISSION DONE"].includes(status);
    const isAdmission = status === "ADMISSION DONE";
    const isClosed    = status === "CLOSED";
    const isOpen      = ["OPEN", "FOLLOW-UP"].includes(status);
    const isBooking   = status === "WALK-IN BOOKED";

    totalLeads++;
    if (isBooking)   bookings++;
    if (isWalkin)    walkins++;
    if (isAdmission) admissions++;

    // monthly simple count
    monthMap.set(monthLabel, (monthMap.get(monthLabel) ?? 0) + 1);

    // monthly detail
    const md = monthDetailMap.get(monthLabel) ?? { leads: 0, walkins: 0, admissions: 0, closed: 0 };
    md.leads++;
    if (isWalkin)    md.walkins++;
    if (isAdmission) md.admissions++;
    if (isClosed)    md.closed++;
    monthDetailMap.set(monthLabel, md);

    sourceMap.set(source,          (sourceMap.get(source)          ?? 0) + 1);
    ownerMap .set(leadOwner ?? "", (ownerMap .get(leadOwner ?? "") ?? 0) + 1);
    statusMap.set(status,          (statusMap.get(status)          ?? 0) + 1);
    programMap.set(program,        (programMap.get(program)        ?? 0) + 1);

    // per-counsellor breakdown
    const key = leadOwner ?? "";
    const cs  = counsellorMap.get(key) ?? { leads: 0, walkins: 0, admissions: 0, closed: 0, open: 0 };
    cs.leads++;
    if (isWalkin)    cs.walkins++;
    if (isAdmission) cs.admissions++;
    if (isClosed)    cs.closed++;
    if (isOpen)      cs.open++;
    counsellorMap.set(key, cs);
  }

  const sortFn = (a: { month: string }, b: { month: string }) =>
    crmMonthSortKey(a.month) - crmMonthSortKey(b.month);

  const monthly = Array.from(monthMap, ([month, cnt]) => ({ month, cnt })).sort(sortFn);

  const monthlyDetail = Array.from(monthDetailMap, ([month, d]) => ({ month, ...d })).sort(sortFn);

  const bySource = Array.from(sourceMap, ([source, cnt]) => ({ source, cnt }))
    .sort((a, b) => b.cnt - a.cnt);
  const byOwner = Array.from(ownerMap, ([leadOwner, cnt]) => ({ leadOwner: leadOwner || null, cnt }))
    .sort((a, b) => b.cnt - a.cnt);
  const statusBreakdown = Array.from(statusMap, ([status, cnt]) => ({ status, cnt }))
    .sort((a, b) => b.cnt - a.cnt);
  const byProgram = Array.from(programMap, ([program, cnt]) => ({ program, cnt }))
    .sort((a, b) => b.cnt - a.cnt);
  const byCounsellor = Array.from(counsellorMap, ([leadOwner, s]) => ({ leadOwner: leadOwner || "Unassigned", ...s }))
    .filter(c => c.leadOwner !== "Unassigned" || c.leads > 0)
    .sort((a, b) => b.admissions - a.admissions || b.walkins - a.walkins || b.leads - a.leads);

  return {
    brand,
    academicYear: "2027-28",
    kpis: { totalLeads, bookings, walkins, admissions },
    monthly,
    monthlyDetail,
    bySource,
    byBranch: [], // CRM Leads Tracker has no branch column
    byOwner,
    statusBreakdown,
    byCounsellor,
    byProgram,
    generatedAt: new Date().toISOString(),
  };
}

// ── Auto-pull timer (every 5 minutes) ───────────────────────────
export function startAutoPull(): void {
  const INTERVAL_MS = 60 * 1000; // 1-min fallback; instant sync via Apps Script webhook

  const run = async () => {
    // MASTER must run first so its DB writes land before the brand pulls compare
    // brand-sheet values against the DB.  Running MASTER last (or in parallel)
    // risks a brand pull seeing brand-sheet (old) ≠ DB (updated by MASTER) and
    // reverting the master-originated change in the same or next cycle.
    try { await pullChangesFromMasterSheet(); } catch (e: any) {
      console.error("[walkin/sheets] Auto-pull MASTER failed:", e?.message);
    }
    try { await pullChangesFromSheet("RIS"); } catch (e: any) {
      console.error("[walkin/sheets] Auto-pull RIS failed:", e?.message);
    }
    try { await pullChangesFromSheet("RPS"); } catch (e: any) {
      console.error("[walkin/sheets] Auto-pull RPS failed:", e?.message);
    }
  };

  // First run after 30 seconds so startup isn't slowed
  setTimeout(() => {
    run();
    setInterval(run, INTERVAL_MS);
  }, 30_000);

  console.log("[walkin/sheets] Auto-pull scheduled every 5 minutes");
}
