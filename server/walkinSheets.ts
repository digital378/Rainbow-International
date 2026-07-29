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
import { walkinLeads, walkinBranches, walkinLeadAuditLog } from "@shared/schema";
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
  "Unique ID",             // A — LD-DD.MM.YYYY-{RIS|RPS}-brandSeqNum
  "Date",                  // B
  "Time",                  // C
  "Student Name",          // D  ← mandatory (yellow)
  "Father/Mother Name",    // E  ← mandatory (yellow)
  "GRADE",                 // F  ← mandatory (yellow)
  "Academic Year",         // G
  "Contact No",            // H
  "Email",                 // I
  "Counsellor Name",       // J  ← mandatory (yellow)
  "Source",                // K  ← mandatory (yellow)
  "Status",                // L  ← green (branch-editable)
  "Admission Date",        // M  ← green
  "Follow up Remarks",     // N  ← green
  "Reason for Closed",     // O  ← green
  "Trial / Revisit",       // P  ← green
  "MIS Calling Remarks",   // Q  ← green
  "Lead ID",               // R  ← hidden; upsert key
] as const;

// Index of the Lead ID column (0-based) — used for row matching
const LEAD_ID_COL_INDEX = SHEET_HEADERS.length - 1; // 17 → column R

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
  return ts.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

// ── Row serialiser ────────────────────────────────────────────────
// Maps a WalkinLead DB row to a flat array matching SHEET_HEADERS column order.
export async function leadToRow(lead: WalkinLead): Promise<string[]> {
  const seqPart = lead.brandSeqNum != null ? lead.brandSeqNum : (lead as any).seqNum ?? lead.id;
  const uniqueId = `LD-${formatDateDotted(lead.enquiryDate)}-${lead.brand}-${seqPart}`;
  return [
    uniqueId,                                   // A  Unique ID
    formatDateDDMMYYYY(lead.enquiryDate),        // B  Date
    formatTime12h(lead.createdAt),               // C  Time
    lead.childName,                              // D  Student Name
    lead.parentName,                             // E  Father/Mother Name
    lead.program,                                // F  GRADE
    lead.academicYear,                           // G  Academic Year
    lead.phone,                                  // H  Contact No
    lead.email ?? "",                            // I  Email
    lead.leadOwner ?? "",                        // J  Counsellor Name
    lead.source,                                 // K  Source
    lead.status,                                 // L  Status
    lead.walkInDate ? formatDateDDMMYYYY(lead.walkInDate) : "", // M  Admission Date
    lead.remark ?? "",                           // N  Follow up Remarks
    lead.closeReason ?? "",                      // O  Reason for Closed
    lead.revisitDate ? formatDateDDMMYYYY(lead.revisitDate) : "", // P  Trial / Revisit
    lead.misCallingRemarks ?? "",                // Q  MIS Calling Remarks
    String(lead.id),                             // R  Lead ID (hidden, upsert key)
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
  // Lead ID column is R = index 17
  const leadIdColLetter = "R";

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
  const leadIdColLetter = "S";                        // Column S = index 18

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
// Columns A, D, E, F, J, K (0-based: 0,3,4,5,9,10) are mandatory submission
// fields and must not be overwritten by branch staff after the lead is captured.
// This function idempotently replaces our own protections on those columns with
// warningOnly=true guards so editors see a prompt before changing them.
async function applyYellowColumnProtection(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
): Promise<void> {
  const PROTECTION_DESCRIPTION = "Yellow submission columns — protected by sync";

  // 1. Get spreadsheet metadata so we know the numeric sheetId for the WALKINs tab
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tab = (meta.data.sheets ?? []).find(
    (s: any) => s.properties?.title === LEADS_TAB,
  );
  if (!tab) {
    console.warn(`[walkin/sheets] Tab "${LEADS_TAB}" not found — skipping protection`);
    return;
  }
  const tabSheetId: number = tab.properties!.sheetId!;

  // 2. Remove any previously created protections (avoid duplicates on repeated resyncs)
  const existingProtections: any[] = tab.protectedRanges ?? [];
  const deleteRequests = existingProtections
    .filter((p: any) => p.description === PROTECTION_DESCRIPTION)
    .map((p: any) => ({
      deleteProtectedRange: { protectedRangeId: p.protectedRangeId },
    }));

  // 3. Add warning-only protections for each yellow column individually
  //    A=0  D=3  E=4  F=5  J=9  K=10  (0-based column indices)
  const YELLOW_COL_INDICES = [0, 3, 4, 5, 9, 10];
  const addRequests = YELLOW_COL_INDICES.map((colIndex) => ({
    addProtectedRange: {
      protectedRange: {
        range: {
          sheetId: tabSheetId,
          startColumnIndex: colIndex,
          endColumnIndex: colIndex + 1,
        },
        description: PROTECTION_DESCRIPTION,
        warningOnly: true,   // shows a caution dialog; does not block saves
      },
    },
  }));

  const requests = [...deleteRequests, ...addRequests];
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  });

  console.log(
    `[walkin/sheets] Yellow-column protections applied (A,D,E,F,J,K) on tab "${LEADS_TAB}"`,
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

  // 5. Batch-append data rows (only if there are leads)
  if (dataRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A2`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: dataRows },
    });
  }

  // 6. Protect yellow columns (A,D,E,F,J,K) — non-fatal; resync still succeeds if this fails
  try {
    await applyYellowColumnProtection(sheets, sheetId);
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

  // 5. Batch-append data rows
  if (dataRows.length > 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A2`,
      valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS",
      requestBody: { values: dataRows },
    });
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

interface PullLogEntry {
  timestamp: Date;
  brand: "RIS" | "RPS";
  rowsScanned: number;
  changesApplied: number;
  errors: string[];
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

    // Collect rows that need propagating to Master after the main loop
    const pendingMasterUpdates: Array<{ leadId: string; greenValues: string[] }> = [];

    for (const row of dataRows) {
      const leadId = row[17]?.trim(); // column R (index 17) = Lead ID
      if (!leadId) continue;

      // Green column values from sheet
      const sheetStatus        = row[11]?.trim() ?? "";   // L
      const sheetWalkInDate    = parseDateFromSheet(row[12] ?? ""); // M
      const sheetRemark        = row[13]?.trim() ?? "";   // N
      const sheetCloseReason   = row[14]?.trim() ?? "";   // O
      const sheetRevisitDate   = parseDateFromSheet(row[15] ?? ""); // P
      const sheetMisCalling    = row[16]?.trim() ?? "";   // Q

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

      if (sheetStatus) check("status", existing.status, sheetStatus);
      check("walkInDate",          existing.walkInDate,          sheetWalkInDate);
      check("remark",              existing.remark,              sheetRemark || null);
      check("closeReason",         existing.closeReason,         sheetCloseReason || null);
      check("revisitDate",         existing.revisitDate,         sheetRevisitDate);
      check("misCallingRemarks",   existing.misCallingRemarks,   sheetMisCalling || null);

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

        // Queue this row for Master propagation
        pendingMasterUpdates.push({
          leadId,
          greenValues: [
            row[11] ?? "",  // L Status       → Master col M
            row[12] ?? "",  // M Admission Date → Master col N
            row[13] ?? "",  // N Follow up Remarks → Master col O
            row[14] ?? "",  // O Reason for Closed → Master col P
            row[15] ?? "",  // P Trial/Revisit  → Master col Q
            row[16] ?? "",  // Q MIS Calling Remarks → Master col R
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
          // Read Lead ID column from Master (column S = index 18)
          const masterIdResp = await sheets.spreadsheets.values.get({
            spreadsheetId: masterSheetId,
            range: `${MASTER_LEADS_TAB}!S:S`,
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
              range: `${MASTER_LEADS_TAB}!M${leadIdToMasterRow.get(u.leadId)}:R${leadIdToMasterRow.get(u.leadId)}`,
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

// ── Auto-pull timer (every 5 minutes) ───────────────────────────
export function startAutoPull(): void {
  const INTERVAL_MS = 5 * 60 * 1000;

  const run = async () => {
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
