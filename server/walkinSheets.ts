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
import { getGoogleRefreshToken } from "./googleCredentials";
import { db } from "./db";
import { walkinLeads, walkinBranches, walkinLeadAuditLog, walkinStatuses, walkinCloseReasons, walkinPrograms, walkinSources, walkinStaff } from "@shared/schema";
import { eq, and, or, isNull, sql as drizzleSql } from "drizzle-orm";
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

/**
 * Seeds branches, programs, sources, statuses, close reasons, and staff
 * into the DB on first startup — idempotent (skips each table if it already
 * has rows).  This ensures production has real data after a fresh deploy.
 */
export async function bootstrapWalkinLookups(): Promise<void> {
  try {
    // ── Branches ──────────────────────────────────────────────────
    const branchRows = await db.execute<{ cnt: string }>(
      drizzleSql`SELECT COUNT(*)::int AS cnt FROM walkin_branches`,
    );
    if (parseInt(branchRows.rows[0]?.cnt ?? "0") === 0) {
      await db.insert(walkinBranches).values([
        { name: "Brahmand",      brand: "RIS", code: "brahmand",      pin: "0000", isActive: true },
        { name: "Dhokali",       brand: "RPS", code: "dhokali",       pin: "0000", isActive: true },
        { name: "Kasarwadavali", brand: "RPS", code: "kasarwadavali", pin: "0000", isActive: true },
        { name: "Anand Nagar",   brand: "RPS", code: "anand-nagar",   pin: "0000", isActive: true },
        { name: "Aggarwal",      brand: "RPS", code: "aggarwal",      pin: "0000", isActive: true },
        { name: "Hariniwas",     brand: "RPS", code: "hariniwas",     pin: "0000", isActive: true },
        { name: "Kalwa",         brand: "RPS", code: "kalwa",         pin: "0000", isActive: true },
      ]).onConflictDoNothing();
      console.log("[walkin/bootstrap] Branches seeded");
    }

    // ── Programs ──────────────────────────────────────────────────
    const progRows = await db.execute<{ cnt: string }>(
      drizzleSql`SELECT COUNT(*)::int AS cnt FROM walkin_programs`,
    );
    if (parseInt(progRows.rows[0]?.cnt ?? "0") === 0) {
      const risPrograms = [
        { label: "Pre-Nursery", brand: "RIS", sortOrder: -1, isActive: true },
        { label: "Nursery",     brand: "RIS", sortOrder:  0, isActive: true },
        { label: "Jr. KG",      brand: "RIS", sortOrder:  1, isActive: true },
        { label: "Sr. KG",      brand: "RIS", sortOrder:  2, isActive: true },
        ...["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7","Class 8","Class 9","Class 10"]
          .map((label, i) => ({ label, brand: "RIS", sortOrder: 3 + i, isActive: true })),
        { label: "Class 11 \u2013 Science",     brand: "RIS", sortOrder: 13, isActive: true },
        { label: "Class 11 \u2013 Commerce",    brand: "RIS", sortOrder: 14, isActive: true },
        { label: "Class 11 \u2013 Humanities",  brand: "RIS", sortOrder: 15, isActive: true },
        { label: "Class 12 \u2013 Science",     brand: "RIS", sortOrder: 16, isActive: true },
        { label: "Class 12 \u2013 Commerce",    brand: "RIS", sortOrder: 17, isActive: true },
        { label: "Class 12 \u2013 Humanities",  brand: "RIS", sortOrder: 18, isActive: true },
      ];
      const rpsPrograms = [
        { label: "Playgroup", brand: "RPS", sortOrder: 0, isActive: true },
        { label: "Nursery",   brand: "RPS", sortOrder: 1, isActive: true },
        { label: "Jr. KG",    brand: "RPS", sortOrder: 2, isActive: true },
        { label: "Sr. KG",    brand: "RPS", sortOrder: 3, isActive: true },
        { label: "Grade 1",   brand: "RPS", sortOrder: 4, isActive: true },
        { label: "Grade 2",   brand: "RPS", sortOrder: 5, isActive: true },
        { label: "Grade 3",   brand: "RPS", sortOrder: 6, isActive: true },
        { label: "Grade 4",   brand: "RPS", sortOrder: 7, isActive: true },
      ];
      await db.insert(walkinPrograms).values([...risPrograms, ...rpsPrograms]).onConflictDoNothing();
      console.log("[walkin/bootstrap] Programs seeded");
    }

    // ── Sources ───────────────────────────────────────────────────
    const srcRows = await db.execute<{ cnt: string }>(
      drizzleSql`SELECT COUNT(*)::int AS cnt FROM walkin_sources`,
    );
    if (parseInt(srcRows.rows[0]?.cnt ?? "0") === 0) {
      await db.insert(walkinSources).values([
        { label: "DM",                brand: null, sortOrder: 0, isActive: true },
        { label: "DW",                brand: null, sortOrder: 1, isActive: true },
        { label: "Referral",          brand: null, sortOrder: 2, isActive: true },
        { label: "Telephonic",        brand: null, sortOrder: 3, isActive: true },
        { label: "Staff Reference",   brand: null, sortOrder: 4, isActive: true },
        { label: "Ex-Rainbow Parent", brand: null, sortOrder: 5, isActive: true },
      ]).onConflictDoNothing();
      console.log("[walkin/bootstrap] Sources seeded");
    }

    // ── Statuses ──────────────────────────────────────────────────
    const statRows = await db.execute<{ cnt: string }>(
      drizzleSql`SELECT COUNT(*)::int AS cnt FROM walkin_statuses`,
    );
    if (parseInt(statRows.rows[0]?.cnt ?? "0") === 0) {
      await db.insert(walkinStatuses).values([
        { label: "OPEN",               brand: null, sortOrder: 0, isActive: true },
        { label: "WALK-IN BOOKED",     brand: null, sortOrder: 1, isActive: true },
        { label: "WALK-IN COMPLETED",  brand: null, sortOrder: 2, isActive: true },
        { label: "ADMISSION DONE",     brand: null, sortOrder: 3, isActive: true },
        { label: "CLOSED",             brand: null, sortOrder: 4, isActive: true },
        { label: "TRANSFERRED",        brand: null, sortOrder: 5, isActive: true },
        { label: "INTEGRATED",         brand: null, sortOrder: 6, isActive: true },
        { label: "NEXT YEAR",          brand: null, sortOrder: 7, isActive: true },
      ]).onConflictDoNothing();
      console.log("[walkin/bootstrap] Statuses seeded");
    }

    // ── Close Reasons ─────────────────────────────────────────────
    const crRows = await db.execute<{ cnt: string }>(
      drizzleSql`SELECT COUNT(*)::int AS cnt FROM walkin_close_reasons`,
    );
    if (parseInt(crRows.rows[0]?.cnt ?? "0") === 0) {
      await db.insert(walkinCloseReasons).values([
        { label: "Location",                  brand: null, sortOrder: 0, isActive: true },
        { label: "adm done - other school",   brand: null, sortOrder: 1, isActive: true },
        { label: "High Fees",                 brand: null, sortOrder: 2, isActive: true },
        { label: "Not Interested",            brand: null, sortOrder: 3, isActive: true },
        { label: "Continuing in same school", brand: null, sortOrder: 4, isActive: true },
        { label: "Board Issue",               brand: null, sortOrder: 5, isActive: true },
        { label: "Transfer",                  brand: null, sortOrder: 6, isActive: true },
        { label: "Autism",                    brand: null, sortOrder: 7, isActive: true },
      ]).onConflictDoNothing();
      console.log("[walkin/bootstrap] Close reasons seeded");
    }

    // ── Staff ─────────────────────────────────────────────────────
    // Only seed real staff if no active (non-placeholder) staff exist
    const staffRows = await db.execute<{ cnt: string }>(
      drizzleSql`SELECT COUNT(*)::int AS cnt FROM walkin_staff WHERE is_active = true AND name NOT LIKE '[CONFIRM]%'`,
    );
    if (parseInt(staffRows.rows[0]?.cnt ?? "0") === 0) {
      const rpsStaff = [
        "Aarti","Amruta","Asma Shaikh","Bhumika Jha","Charushila","Deeksha Pujari",
        "Dipisha Wagh","Gauri Randhir","Jaisika Ujawane","Madhuri","Mahima Patel",
        "Mintu Singh","Neelanjali","Neha Shelar","Niharika Joshi","Pooja Bohini",
        "Preeti Nanda","Prisha Uderani","Priyanka","Rajani","Sheetal Gaikwad",
        "Shilpa Sikdar","Simran","Snehal Kadam","Snehal Shetty","Swamini Waradkar","Varija",
      ].map((name, i) => ({ name, brand: "RPS", isActive: true, sortOrder: i }));

      const risStaff = [
        "Anagha","Kavya","Lavina","Pradnya","Sheetal","Shweta","Srishti","Swarika Ma'am",
      ].map((name, i) => ({ name, brand: "RIS", isActive: true, sortOrder: i }));

      await db.insert(walkinStaff).values([...rpsStaff, ...risStaff]).onConflictDoNothing();
      console.log("[walkin/bootstrap] Staff seeded");
    }

    console.log("[walkin/bootstrap] Lookups ready");
  } catch (err: any) {
    console.error("[walkin/bootstrap] Lookup bootstrap failed:", err?.message);
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
  const refreshToken = getGoogleRefreshToken();
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
  "Jr. KG",
  "Sr. KG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11 – Science", "Class 11 – Commerce", "Class 11 – Humanities",
  "Class 12 – Science", "Class 12 – Commerce", "Class 12 – Humanities",
] as const;

/** Grade / programme options for RPS brand sheet dropdown. */
export const ALLOWED_GRADES_RPS = [
  "Playgroup",
  "Nursery",
  "Jr. KG",
  "Sr. KG",
  "Grade 1", "Grade 2", "Grade 3", "Grade 4",
] as const;

/** Combined grade list used in the Master MIS sheet (covers both brands). */
export const ALLOWED_GRADES_MASTER = [
  ...ALLOWED_GRADES_RPS,
  ...ALLOWED_GRADES_RIS,
] as readonly string[];

// ── Dynamic grade helpers (DB-backed) ────────────────────────────
// These replace the hardcoded constants at resync time so that any grade
// added/renamed in the admin panel is reflected in the sheet dropdown on the
// next resync without a code change.

/**
 * Fetch active grade labels for a specific brand (RIS or RPS) plus any
 * brand-agnostic grades (brand IS NULL), ordered by sort_order then label.
 * Falls back to the hardcoded constant if the DB query fails.
 */
async function fetchGradesForBrand(brand: "RIS" | "RPS"): Promise<string[]> {
  try {
    const rows = await db
      .select({ label: walkinPrograms.label })
      .from(walkinPrograms)
      .where(
        and(
          eq(walkinPrograms.isActive, true),
          or(eq(walkinPrograms.brand, brand), isNull(walkinPrograms.brand)),
        ),
      )
      .orderBy(walkinPrograms.sortOrder, walkinPrograms.label);
    if (rows.length > 0) return rows.map((r) => r.label);
  } catch (err: any) {
    console.warn(`[walkin/sheets] fetchGradesForBrand(${brand}) failed — using hardcoded fallback:`, err?.message);
  }
  return brand === "RIS" ? [...ALLOWED_GRADES_RIS] : [...ALLOWED_GRADES_RPS];
}

/**
 * Fetch all active grade labels (both brands + shared), de-duplicated,
 * ordered by sort_order then label.  Used for the Master MIS sheet dropdown.
 * Falls back to the hardcoded ALLOWED_GRADES_MASTER if the DB query fails.
 */
async function fetchGradesForMaster(): Promise<string[]> {
  try {
    const rows = await db
      .select({ label: walkinPrograms.label })
      .from(walkinPrograms)
      .where(eq(walkinPrograms.isActive, true))
      .orderBy(walkinPrograms.sortOrder, walkinPrograms.label);
    if (rows.length > 0) {
      // De-duplicate while preserving order (shared grades appear once)
      const seen = new Set<string>();
      return rows.map((r) => r.label).filter((l) => !seen.has(l) && seen.add(l));
    }
  } catch (err: any) {
    console.warn("[walkin/sheets] fetchGradesForMaster() failed — using hardcoded fallback:", err?.message);
  }
  return [...ALLOWED_GRADES_MASTER];
}

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
 * Paint every cell in `colIndex` (rows 0–999, header inclusive) with a
 * solid background colour.  Used to keep the Status column visually
 * distinct from the other editable (cyan) columns.
 *
 * Colour reference (for consistency):
 *   Blue  #6FA8DC  {r:0.435, g:0.659, b:0.863} — Status (branch-editable, key field)
 */
function buildColumnColorRequest(
  tabSheetId: number,
  colIndex: number,
  red: number,
  green: number,
  blue: number,
): object {
  return {
    repeatCell: {
      range: {
        sheetId: tabSheetId,
        startRowIndex: 0,      // include header row
        endRowIndex: 1000,
        startColumnIndex: colIndex,
        endColumnIndex: colIndex + 1,
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red, green, blue },
        },
      },
      fields: "userEnteredFormat.backgroundColor",
    },
  };
}

// Convenience: the standard "Status blue" used on all three sheets
const STATUS_BLUE = { r: 0.435, g: 0.659, b: 0.863 } as const; // #6FA8DC

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
  allowedGrades: readonly string[],
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

  // 2. Build requests:
  //    • yellow-column protections
  //    • Grade dropdown     (col G = 6)
  //    • Status dropdown    (col N = 13) — "WALK-IN BOOKED" excluded from brand sheets
  //    • Source dropdown    (col M = 12)
  //    • Close Reason       (col Q = 16)
  //    • Clear Email        (col K = 10) — no dropdown needed on email
  const requests = [
    ...buildYellowProtectionRequests(tabSheetId, existingProtections),
    buildDropdownRequest(tabSheetId, 6, allowedGrades),                            // col G = GRADE (dropdown)
    buildBrandStatusDropdownRequest(tabSheetId, 13),                               // col N = Status (dropdown)
    buildSourceDropdownRequest(tabSheetId, 12),                                    // col M = Source (dropdown)
    buildCloseReasonDropdownRequest(tabSheetId, 16),                               // col Q = Reason for Closed (dropdown)
    // Clear stale validation from columns that should be free-text / date pickers
    buildClearValidationRequest(tabSheetId, 10),   // col K = Email
    buildClearValidationRequest(tabSheetId, 14),   // col O = Admission Date
    buildClearValidationRequest(tabSheetId, 15),   // col P = Follow up Remarks
    buildClearValidationRequest(tabSheetId, 17),   // col R = Revisit 1 Date
    buildClearValidationRequest(tabSheetId, 18),   // col S = Revisit 2 Date
    // Note: Status column background colour is managed manually in the sheet.
    // We intentionally do NOT apply a colour here so staff corrections persist.
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
  allowedGrades: readonly string[],
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
    buildDropdownRequest(tabSheetId, 7, allowedGrades),                            // col H = GRADE (dropdown)
    buildStatusDropdownRequest(tabSheetId, 14),                                    // col O = Status (dropdown)
    buildSourceDropdownRequest(tabSheetId, 13),                                    // col N = Source (dropdown)
    buildCloseReasonDropdownRequest(tabSheetId, 17),                               // col R = Reason for Closed (dropdown)
    // Clear stale validation from columns that should be free-text / date pickers
    buildClearValidationRequest(tabSheetId, 11),   // col L = Email
    buildClearValidationRequest(tabSheetId, 15),   // col P = Admission Date
    buildClearValidationRequest(tabSheetId, 16),   // col Q = Follow up Remarks
    buildClearValidationRequest(tabSheetId, 18),   // col S = Revisit 1 Date
    buildClearValidationRequest(tabSheetId, 19),   // col T = Revisit 2 Date
    // Note: Status column background colour is managed manually in the sheet.
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
    const grades = await fetchGradesForBrand(brand);
    await applyYellowColumnProtection(sheets, sheetId, brand, grades);
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
    const masterGrades = await fetchGradesForMaster();
    await applyMasterYellowColumnProtection(sheets, sheetId, masterGrades);
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

    // Safety guard: the first cell must be the "Lead ID" header.
    // If it's missing the API likely returned a truncated/empty response
    // (transient failure) — bail out rather than mass-archiving everything.
    if (rows[0]?.[0]?.trim() !== "Lead ID") {
      result.errors.push(
        "Master sheet header sanity check failed (expected 'Lead ID' in col U row 1) — skipping deletion sync to avoid accidental mass-archival"
      );
      return result;
    }

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

    // Track which brands need a full sheet resync after archiving
    const brandsToResync = new Set<"RIS" | "RPS">();

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

        result.archived++;
        result.details.push({
          leadId: lead.id,
          brand: lead.brand as "RIS" | "RPS",
          parentName: lead.parentName ?? "",
        });

        if (lead.brand === "RIS" || lead.brand === "RPS") {
          brandsToResync.add(lead.brand);
        }

        console.log(`[walkin/sheets] syncDeletionsFromMaster: archived ${lead.id} (${lead.brand})`);
      } catch (e: any) {
        result.errors.push(`${lead.id}: DB archive failed — ${e?.message}`);
      }
    }

    // Full resync so archived rows are physically removed from brand sheets
    // (cheaper than row-by-row deletion and leaves the sheet clean)
    for (const brand of brandsToResync) {
      await resyncBrandToSheet(brand).catch((e: any) => {
        result.errors.push(`${brand} sheet resync after archiving failed — ${e?.message}`);
      });
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

/**
 * Pure aggregation of raw CRM Leads Tracker sheet rows into KPI stats.
 *
 * Exported so it can be unit-tested independently of the Google Sheets API call.
 *
 * Expected column layout (0-based, matching the live "CRM Leads Tracker" tab).
 *
 * IMPORTANT — spot-checked against the live RPS sheet on 2026-07-30:
 * The live sheet contains a "Centre" column at position [6] that is absent
 * from the original design doc. All columns from Status onwards are therefore
 * shifted one position to the right compared to the earlier draft layout.
 *
 *   [0]  Date       — **DD/MM/YYYY** is the canonical format written by the sync
 *                     system; YYYY-MM-DD is also accepted as a fallback.
 *   [1]  Time
 *   [2]  Parent's Name
 *   [3]  Child's Name
 *   [4]  Phone Number
 *   [5]  Program
 *   [6]  Centre     — branch / centre name (not used for KPI aggregation)
 *   [7]  Status     — values are uppercased before comparison; recognised values:
 *                     OPEN · FOLLOW-UP · WALK-IN BOOKED · WALK-IN COMPLETED ·
 *                     ADMISSION DONE · CLOSED · TRANSFERRED · INTEGRATED · NEXT YEAR
 *   [8]  Remark
 *   [9]  Lead Owner
 *   [10] Source
 *   [11] Walk-In Date
 *   [12] Revisit Date
 *
 * Counting rules:
 *   - totalLeads  = every row where col[0] (Date) is non-blank
 *   - admissions  = rows where Status === "ADMISSION DONE" (after uppercasing)
 *   - walkins     = rows where Status ∈ {"WALK-IN COMPLETED", "ADMISSION DONE"}
 *   - bookings    = rows where Status === "WALK-IN BOOKED"
 *   - Monthly bucketing uses parseCrmMonthLabel(date) on the Date column.
 */
export function aggregateCrmRows(dataRows: string[][]): Omit<CrmStats, "brand" | "academicYear" | "generatedAt" | "cachedAt" | "byBranch" | "dataSource" | "warning"> {
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

    const status     = (row[7] ?? "").toString().trim().toUpperCase();  // [7] Status (Centre is at [6])
    const source     = (row[10] ?? "").toString().trim() || "Unknown"; // [10] Source
    const leadOwner  = (row[9] ?? "").toString().trim() || null;       // [9] Lead Owner
    const program    = (row[5] ?? "").toString().trim() || "Unknown";  // [5] Program
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

    monthMap.set(monthLabel, (monthMap.get(monthLabel) ?? 0) + 1);

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

  const monthly       = Array.from(monthMap, ([month, cnt]) => ({ month, cnt })).sort(sortFn);
  const monthlyDetail = Array.from(monthDetailMap, ([month, d]) => ({ month, ...d })).sort(sortFn);
  const bySource      = Array.from(sourceMap, ([source, cnt]) => ({ source, cnt })).sort((a, b) => b.cnt - a.cnt);
  const byOwner       = Array.from(ownerMap, ([leadOwner, cnt]) => ({ leadOwner: leadOwner || null, cnt })).sort((a, b) => b.cnt - a.cnt);
  const statusBreakdown = Array.from(statusMap, ([status, cnt]) => ({ status, cnt })).sort((a, b) => b.cnt - a.cnt);
  const byProgram     = Array.from(programMap, ([program, cnt]) => ({ program, cnt })).sort((a, b) => b.cnt - a.cnt);
  const byCounsellor  = Array.from(counsellorMap, ([leadOwner, s]) => ({ leadOwner: leadOwner || "Unassigned", ...s }))
    .filter(c => c.leadOwner !== "Unassigned" || c.leads > 0)
    .sort((a, b) => b.admissions - a.admissions || b.walkins - a.walkins || b.leads - a.leads);

  return {
    kpis: { totalLeads, bookings, walkins, admissions },
    monthly,
    monthlyDetail,
    bySource,
    byOwner,
    statusBreakdown,
    byCounsellor,
    byProgram,
  };
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
  /** ISO timestamp of when data was fetched from Google Sheets (preserved when served from cache). */
  cachedAt: string;
  /**
   * Indicates the origin / health of the data.
   * Always "sheet" — data was read successfully from the DB (walkin_leads table).
   */
  dataSource: "sheet";
  /**
   * True when the response is served from the last-known-good cache because
   * the live fetch (DB or Sheets) failed during this request cycle.
   * The `cachedAt` field indicates when the data was originally fetched.
   */
  stale?: true;
}

// ── CRM stats in-memory cache (2-minute TTL) with in-flight coalescing ──
const CRM_STATS_TTL_MS = 2 * 60 * 1000; // 2 minutes

interface CrmStatsEntry {
  data: CrmStats;
  storedAt: number; // Date.now()
}

const crmStatsCache   = new Map<"RIS" | "RPS", CrmStatsEntry>();
/** Holds the in-progress fetch promise so concurrent cache-miss requests share one call. */
const crmStatsInFlight = new Map<"RIS" | "RPS", Promise<CrmStats>>();
/**
 * Monotonically-increasing generation counter per brand.
 * Incremented on every bust so that a pre-bust in-flight fetch, when it
 * eventually settles, can detect that it is no longer the current generation
 * and must discard its result instead of overwriting the fresh cache entry.
 */
const crmStatsGeneration = new Map<"RIS" | "RPS", number>();
/**
 * Last successfully fetched data per brand — never cleared by bustCrmStatsCache.
 * Used as a stale fallback when the live fetch fails (e.g. DB / Sheets outage).
 */
const crmStatsLastGood = new Map<"RIS" | "RPS", CrmStatsEntry>();

/**
 * Invalidates the in-memory CRM stats cache for one or both brands.
 * Called when an admin explicitly triggers a refresh.
 */
export function bustCrmStatsCache(brand?: "RIS" | "RPS"): void {
  if (brand) {
    // Increment generation so any in-flight fetch that started before this bust
    // will see a mismatch when it settles and will discard its stale result.
    crmStatsGeneration.set(brand, (crmStatsGeneration.get(brand) ?? 0) + 1);
    crmStatsCache.delete(brand);
    crmStatsInFlight.delete(brand);
  } else {
    for (const b of ["RIS", "RPS"] as const) {
      crmStatsGeneration.set(b, (crmStatsGeneration.get(b) ?? 0) + 1);
    }
    crmStatsCache.clear();
    crmStatsInFlight.clear();
  }
  console.log(`[walkin/crm-stats] Cache busted${brand ? ` for ${brand}` : " (all brands)"}`);
}

/**
/**
 * Returns aggregated CRM stats for a brand by querying the walkin_leads
 * database table directly — the single source of truth.
 *
 * The Google Sheet "CRM Leads Tracker" tab is no longer read here;
 * all leads entered by RAs via the /leads panel live in the DB.
 *
 * Results are cached for 2 minutes.  Concurrent cache-miss requests
 * share a single in-flight promise (no duplicate DB queries).
 * Pass `{ bust: true }` to force a fresh read (admin-only).
 */
export async function readCrmLeadsTrackerStats(
  brand: "RIS" | "RPS",
  { bust = false }: { bust?: boolean } = {},
): Promise<CrmStats> {
  // 1. Serve cached result immediately (unless busting)
  if (!bust) {
    const entry = crmStatsCache.get(brand);
    if (entry && Date.now() - entry.storedAt < CRM_STATS_TTL_MS) {
      console.log(`[walkin/crm-stats] Cache hit for ${brand}`);
      return entry.data;
    }
    // 2. Coalesce concurrent cache-miss requests
    const inflight = crmStatsInFlight.get(brand);
    if (inflight) {
      console.log(`[walkin/crm-stats] Joining in-flight request for ${brand}`);
      return inflight;
    }
  }

  // Capture the generation before any async work.  A bust that fires while
  // this fetch is in-flight will increment the generation; if it no longer
  // matches when we try to write to cache, we discard the stale result.
  const myGeneration = crmStatsGeneration.get(brand) ?? 0;

  const fetchPromise = (async (): Promise<CrmStats> => {
    try {
      // Read all non-archived leads for this brand + AY from the DB
      const leads = await db
        .select({
          monthLabel:  walkinLeads.monthLabel,
          status:      walkinLeads.status,
          source:      walkinLeads.source,
          leadOwner:   walkinLeads.leadOwner,
          program:     walkinLeads.program,
          branchId:    walkinLeads.branchId,
        })
        .from(walkinLeads)
        .where(
          and(
            eq(walkinLeads.brand, brand),
            eq(walkinLeads.academicYear, "2027-28"),
            eq(walkinLeads.isArchived, false),
          ),
        );

      const now = new Date().toISOString();

      // Aggregate KPIs in the same shape as aggregateCrmRows
      let totalLeads = 0, bookings = 0, walkins = 0, admissions = 0;
      const monthMap        = new Map<string, number>();
      const monthDetailMap  = new Map<string, { leads: number; walkins: number; admissions: number; closed: number }>();
      const sourceMap       = new Map<string, number>();
      const ownerMap        = new Map<string, number>();
      const statusMap       = new Map<string, number>();
      const counsellorMap   = new Map<string, { leads: number; walkins: number; admissions: number; closed: number; open: number }>();
      const programMap      = new Map<string, number>();
      const branchMap       = new Map<number | null, number>();

      for (const row of leads) {
        const status  = (row.status    ?? "").trim().toUpperCase();
        const source  = (row.source    ?? "Unknown").trim();
        const owner   = (row.leadOwner ?? "").trim();
        const program = (row.program   ?? "Unknown").trim();
        const month   = (row.monthLabel ?? "").trim() || "Unknown";
        const bid     = row.branchId ?? null;

        const isWalkin    = ["WALK-IN COMPLETED", "ADMISSION DONE"].includes(status);
        const isAdmission = status === "ADMISSION DONE";
        const isClosed    = status === "CLOSED";
        const isOpen      = ["OPEN", "FOLLOW-UP"].includes(status);
        const isBooking   = status === "WALK-IN BOOKED";

        totalLeads++;
        if (isBooking)   bookings++;
        if (isWalkin)    walkins++;
        if (isAdmission) admissions++;

        monthMap.set(month, (monthMap.get(month) ?? 0) + 1);

        const md = monthDetailMap.get(month) ?? { leads: 0, walkins: 0, admissions: 0, closed: 0 };
        md.leads++;
        if (isWalkin)    md.walkins++;
        if (isAdmission) md.admissions++;
        if (isClosed)    md.closed++;
        monthDetailMap.set(month, md);

        sourceMap.set(source, (sourceMap.get(source) ?? 0) + 1);
        ownerMap .set(owner,  (ownerMap .get(owner)  ?? 0) + 1);
        statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
        programMap.set(program, (programMap.get(program) ?? 0) + 1);
        branchMap .set(bid,   (branchMap .get(bid)   ?? 0) + 1);

        const cs = counsellorMap.get(owner) ?? { leads: 0, walkins: 0, admissions: 0, closed: 0, open: 0 };
        cs.leads++;
        if (isWalkin)    cs.walkins++;
        if (isAdmission) cs.admissions++;
        if (isClosed)    cs.closed++;
        if (isOpen)      cs.open++;
        counsellorMap.set(owner, cs);
      }

      const sortFn = (a: { month: string }, b: { month: string }) =>
        crmMonthSortKey(a.month) - crmMonthSortKey(b.month);

      const monthly         = Array.from(monthMap,       ([month, cnt]) => ({ month, cnt })).sort(sortFn);
      const monthlyDetail   = Array.from(monthDetailMap, ([month, d])   => ({ month, ...d })).sort(sortFn);
      const bySource        = Array.from(sourceMap,      ([source, cnt]) => ({ source, cnt })).sort((a, b) => b.cnt - a.cnt);
      const byOwner         = Array.from(ownerMap,       ([leadOwner, cnt]) => ({ leadOwner: leadOwner || null, cnt })).sort((a, b) => b.cnt - a.cnt);
      const statusBreakdown = Array.from(statusMap,      ([status, cnt]) => ({ status, cnt })).sort((a, b) => b.cnt - a.cnt);
      const byProgram       = Array.from(programMap,     ([program, cnt]) => ({ program, cnt })).sort((a, b) => b.cnt - a.cnt);
      const byBranch        = Array.from(branchMap,      ([branchId, cnt]) => ({ branchId, cnt })).sort((a, b) => b.cnt - a.cnt);
      const byCounsellor    = Array.from(counsellorMap,  ([leadOwner, s]) => ({ leadOwner: leadOwner || "Unassigned", ...s }))
        .filter(c => c.leadOwner !== "Unassigned" || c.leads > 0)
        .sort((a, b) => b.admissions - a.admissions || b.walkins - a.walkins || b.leads - a.leads);

      const result: CrmStats = {
        brand,
        academicYear: "2027-28",
        kpis: { totalLeads, bookings, walkins, admissions },
        monthly,
        monthlyDetail,
        bySource,
        byBranch,
        byOwner,
        statusBreakdown,
        byCounsellor,
        byProgram,
        generatedAt: now,
        cachedAt: now,
        dataSource: "sheet", // "sheet" = data is good; frontend shows no warning
      };

      // Only write cache if our generation is still current — a bust that fired
      // while we were querying the DB will have incremented the generation, so
      // we must discard this stale result rather than overwriting the fresh one.
      if ((crmStatsGeneration.get(brand) ?? 0) === myGeneration) {
        const entry: CrmStatsEntry = { data: result, storedAt: Date.now() };
        crmStatsCache.set(brand, entry);
        crmStatsLastGood.set(brand, entry);
        console.log(`[walkin/crm-stats] Fresh data fetched from DB and cached for ${brand} (${totalLeads} leads)`);
      } else {
        console.log(`[walkin/crm-stats] Discarding stale in-flight result for ${brand} (generation mismatch — bust fired during fetch)`);
      }
      return result;
    } catch (fetchErr: any) {
      // On any fetch failure, serve the last-known-good data with stale:true so
      // the dashboard keeps showing real numbers instead of zeros or a 500.
      const lastGood = crmStatsLastGood.get(brand);
      if (lastGood) {
        console.warn(
          `[walkin/crm-stats] Fetch failed for ${brand} — serving stale cache from ${new Date(lastGood.storedAt).toISOString()}. Error: ${fetchErr?.message}`,
        );
        return { ...lastGood.data, stale: true };
      }
      // No prior data at all — propagate so the route returns 500
      throw fetchErr;
    } finally {
      // Only clear the in-flight entry when our generation is still current.
      // A bust increments the generation AND clears the in-flight map, so if
      // the generation no longer matches a newer fetch is now in-flight and we
      // must not remove it.  Only one fetch can be active per generation, so
      // the generation check is a safe proxy for identity without a
      // self-referential fetchPromise comparison.
      if ((crmStatsGeneration.get(brand) ?? 0) === myGeneration) {
        crmStatsInFlight.delete(brand);
      }
    }
  })();

  crmStatsInFlight.set(brand, fetchPromise);
  return fetchPromise;
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
    // Deletion sync: archive DB leads whose rows were deleted from the Master
    // sheet and rewrite affected brand sheets so the rows disappear.
    // Runs last (after status pulls) so any in-flight status updates from
    // this cycle are already written to DB before we check what's missing.
    // Protected by a header sanity check inside syncDeletionsFromMaster.
    try { await syncDeletionsFromMaster(); } catch (e: any) {
      console.error("[walkin/sheets] Auto-pull deletion-sync failed:", e?.message);
    }
  };

  // First run after 30 seconds so startup isn't slowed
  setTimeout(() => {
    run();
    setInterval(run, INTERVAL_MS);
  }, 30_000);

  console.log("[walkin/sheets] Auto-pull scheduled every 5 minutes");
}
