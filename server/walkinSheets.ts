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
 */

import { google } from "googleapis";
import { db } from "./db";
import { walkinLeads, walkinBranches } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { WalkinLead } from "@shared/schema";

// ── Column layout (single source of truth) ───────────────────────
// Order matches the task spec exactly. Lead ID is the last (hidden) column.
export const SHEET_HEADERS = [
  "Enquiry Date",
  "Month",
  "Academic Year",
  "Branch",
  "Parent's Name",
  "Child's Name",
  "Phone",
  "Alt Phone",
  "Email",
  "Program",
  "Source",
  "Status",
  "Close Reason",
  "Remark",
  "Lead Owner",
  "Walk-in Date",
  "Revisit Date",
  "Created By",
  "Created At",
  "Last Updated",
  "Lead ID",            // col index 20 — used for upsert matching; hide in sheet
] as const;

// Index of the Lead ID column (0-based), used for row matching
const LEAD_ID_COL_INDEX = SHEET_HEADERS.length - 1; // 20

// Tab name in both sheets
const LEADS_TAB = "Leads";

// ── In-memory sync status ────────────────────────────────────────
interface SyncStatus {
  lastSyncAt: Date | null;
  dbCount: number;
  sheetCount: number;
  lastError: string | null;
}

const syncStatus: Record<"RIS" | "RPS", SyncStatus> = {
  RIS: { lastSyncAt: null, dbCount: 0, sheetCount: 0, lastError: null },
  RPS: { lastSyncAt: null, dbCount: 0, sheetCount: 0, lastError: null },
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

// ── Row serialiser ────────────────────────────────────────────────
// Maps a WalkinLead DB row to a flat array matching SHEET_HEADERS column order.
export async function leadToRow(lead: WalkinLead): Promise<string[]> {
  const branchName = await resolveBranchName(lead.branchId ?? null);
  return [
    lead.enquiryDate,
    lead.monthLabel,
    lead.academicYear,
    branchName,
    lead.parentName,
    lead.childName,
    lead.phone,
    lead.altPhone ?? "",
    lead.email ?? "",
    lead.program,
    lead.source,
    lead.status,
    lead.closeReason ?? "",
    lead.remark ?? "",
    lead.leadOwner ?? "",
    lead.walkInDate ?? "",
    lead.revisitDate ?? "",
    lead.createdBy,
    lead.createdAt.toISOString(),
    lead.updatedAt.toISOString(),
    lead.id,
  ];
}

// ── Upsert a single lead into the correct brand sheet ────────────
// Find the row by Lead ID in the last column; update if found, append if not.
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

  async function doUpsert(retried = false): Promise<void> {
    try {
      // Read the Lead ID column to find any existing row for this lead
      const readResp = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId!,
        range: `${LEADS_TAB}!U:U`, // column U = index 20 (Lead ID)
      });

      const cellValues = readResp.data.values ?? [];
      // Row 0 = header, data starts at row 1 (1-based row 2 in Sheets)
      let existingRowIndex = -1;
      for (let i = 1; i < cellValues.length; i++) {
        if (cellValues[i]?.[0] === lead.id) {
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
}

// ── Full resync: rewrite entire Leads tab from DB ────────────────
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

  // 2. Serialise all rows (branch name lookups are cached)
  const dataRows = await Promise.all(leads.map(leadToRow));

  // 3. Clear data rows (A2:end), preserving the header row
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A2:Z`,
    });
  } catch (err: any) {
    // If tab doesn't exist yet, this may fail — we'll recover below
    console.warn(`[walkin/sheets] Clear failed for ${brand} (may be first-time setup):`, err?.message);
  }

  // 4. (Re-)write header row
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${LEADS_TAB}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [SHEET_HEADERS as unknown as string[]] },
  });

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

  // 6. Update sync status
  syncStatus[brand].lastSyncAt = new Date();
  syncStatus[brand].dbCount = leads.length;
  syncStatus[brand].sheetCount = dataRows.length;
  syncStatus[brand].lastError = null;

  console.log(`[walkin/sheets] Resynced ${brand}: ${leads.length} leads written to sheet`);
  return { dbCount: leads.length, sheetCount: dataRows.length };
}
