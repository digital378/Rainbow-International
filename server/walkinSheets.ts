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
 * The historic "Admission Date" column is retained in place as the walk-in
 * date. "Actual Admission Date" is a separate appended field:
 *   RIS: O Admission Date, T hidden Lead ID, U Actual Admission Date
 *   RPS: P Admission Date, U hidden Lead ID, V Actual Admission Date
 *   Master: Q Admission Date, V hidden Lead ID, W Actual Admission Date
 *
 * Yellow columns (A,D,E,F,J,K) = mandatory at submission; sheet owner–only edit.
 * Green columns (L-Q) = editable by branch staff in sheet.
 * Set up range protection in Google Sheets manually (Data → Protect ranges).
 */

import { google } from "googleapis";
import { createHash } from "node:crypto";
import { getGoogleRefreshToken } from "./googleCredentials";
import { db } from "./db";
import { walkinLeads, walkinBranches, walkinLeadAuditLog, walkinStatuses, walkinCloseReasons, walkinPrograms, walkinSources, walkinStaff, walkinSyncReconciliations, walkinSyncSnapshots } from "@shared/schema";
import { eq, and, or, isNull, sql as drizzleSql } from "drizzle-orm";
import { readMarketing2728Supplement, supplementLeadKey } from "./marketing2728Sheets";
import type { WalkinLead } from "@shared/schema";
import {
  beginWalkinSyncShutdown,
  fencedWalkinSheetWrite,
  isWalkinSyncDraining,
  runWalkinSheetOperation,
  waitForWalkinSyncDrain,
} from "./walkinSyncCoordinator";

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
    await db.execute(drizzleSql`
      ALTER TABLE walkin_leads
        ADD COLUMN IF NOT EXISTS admission_date TEXT;
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
  "Actual Admission Date", // U(20) ← appended; actual admission, not walk-in date
] as const;

// RPS has a branch field between grade and academic year.  Keep the established
// workbook shape rather than shifting staff-owned columns during a resync.
export const RPS_SHEET_HEADERS = [
  ...SHEET_HEADERS.slice(0, 7),
  "Branch",
  ...SHEET_HEADERS.slice(7),
] as const;

// Sheet tab name (must match the tab in the actual Google Sheet)
const LEADS_TAB = "WALKINs";

// ── Master (combined RIS + RPS) sheet ────────────────────────────
// Master contains Brand and Branch.  Source intentionally precedes Counsellor
// because that is the existing staff-facing workbook order.
export const MASTER_SHEET_HEADERS = [
  "Brand",
  "Unique ID",
  "Date",
  "Time",
  "Student Name",
  "Father Name",
  "Mother Name",
  "GRADE",
  "Branch",
  "Academic Year",
  "Father Contact",
  "Mother Contact",
  "Email",
  "Source",
  "Counsellor Name",
  "Status",
  "Admission Date",
  "Follow up Remarks",
  "Reason for Closed",
  "Revisit 1 Date",
  "Revisit 2 Date",
  "Lead ID",
  "Actual Admission Date",
] as const;

const MASTER_LEADS_TAB = "WALKINs";

function headersForBrand(brand: "RIS" | "RPS") {
  return brand === "RPS" ? RPS_SHEET_HEADERS : SHEET_HEADERS;
}

function columnLetter(index: number): string {
  let number = index + 1;
  let letter = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    number = Math.floor((number - 1) / 26);
  }
  return letter;
}

function headerIndex(header: string[], name: string, fallback: number): number {
  const index = header.findIndex((cell) => cell.trim().toLowerCase() === name.toLowerCase());
  return index >= 0 ? index : fallback;
}

function cellAt(row: string[], index: number): string {
  return row[index]?.trim() ?? "";
}

function leadIdFromRow(row: string[], index: number): string {
  const direct = cellAt(row, index);
  if (direct) return direct;
  // Rows written before the Branch-column correction can carry the UUID one
  // cell left of its header. This transition fallback is read-only and ends
  // once a normal resync rewrites the row in the canonical layout.
  return row.find((value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value?.trim() ?? ""))?.trim() ?? "";
}

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

// Cache hydrated durable per-lead/per-workbook checkpoints. Reads consult the
// database each time so another leased application instance's writes are seen.
type SyncValues = Record<string, string | null>;
type CachedSyncSnapshot = { snapshot: SyncValues; updatedAt: number };
const successfulSyncValues = new Map<string, CachedSyncSnapshot>();

function normalizedSyncValue(value: unknown): string | null {
  return value == null || value === "" ? null : String(value);
}

function syncValuesFromLead(lead: WalkinLead): SyncValues {
  return {
    status: normalizedSyncValue(lead.status),
    walkInDate: normalizedSyncValue(lead.walkInDate),
    admissionDate: normalizedSyncValue(lead.admissionDate),
    remark: normalizedSyncValue(lead.remark),
    closeReason: normalizedSyncValue(lead.closeReason),
    revisitDate: normalizedSyncValue(lead.revisitDate),
    revisitDate2: normalizedSyncValue((lead as any).revisitDate2),
  };
}

function syncValuesFromSheet(values: SyncValues): SyncValues {
  return Object.fromEntries(Object.entries(values).map(([field, value]) => [field, normalizedSyncValue(value)]));
}

async function getSyncSnapshot(scope: "RIS" | "RPS" | "MASTER", leadId: string): Promise<SyncValues | undefined> {
  const [stored] = await db.select()
    .from(walkinSyncSnapshots)
    .where(and(eq(walkinSyncSnapshots.scope, scope), eq(walkinSyncSnapshots.leadId, leadId)));
  if (!stored) {
    successfulSyncValues.delete(`${scope}:${leadId}`);
    return undefined;
  }
  const key = `${scope}:${leadId}`;
  const updatedAt = new Date(stored.updatedAt).getTime();
  const cached = successfulSyncValues.get(key);
  const snapshot = cached?.updatedAt === updatedAt
    && JSON.stringify(cached.snapshot) === JSON.stringify(stored.snapshot)
    ? cached.snapshot
    : stored.snapshot as SyncValues;
  successfulSyncValues.set(key, { snapshot, updatedAt });
  return snapshot;
}

export async function persistSyncSnapshot(scope: "RIS" | "RPS" | "MASTER", leadId: string, snapshot: SyncValues): Promise<void> {
  const normalized = syncValuesFromSheet(snapshot);
  const updatedAt = new Date();
  await db.insert(walkinSyncSnapshots).values({
    scope,
    leadId,
    snapshot: normalized,
    updatedAt,
  }).onConflictDoUpdate({
    target: [walkinSyncSnapshots.scope, walkinSyncSnapshots.leadId],
    set: { snapshot: normalized, updatedAt },
  });
  successfulSyncValues.set(`${scope}:${leadId}`, { snapshot: normalized, updatedAt: updatedAt.getTime() });
}

async function persistSyncSnapshots(scope: "RIS" | "RPS" | "MASTER", leads: WalkinLead[]): Promise<void> {
  const values = leads.map((lead) => ({
    scope,
    leadId: String(lead.id),
    snapshot: syncValuesFromLead(lead),
    updatedAt: new Date(),
  }));
  for (let offset = 0; offset < values.length; offset += 200) {
    const chunk = values.slice(offset, offset + 200);
    await db.insert(walkinSyncSnapshots).values(chunk).onConflictDoUpdate({
      target: [walkinSyncSnapshots.scope, walkinSyncSnapshots.leadId],
      set: {
        snapshot: drizzleSql`excluded.snapshot_values`,
        updatedAt: new Date(),
      },
    });
    for (const item of chunk) {
      successfulSyncValues.set(`${scope}:${item.leadId}`, {
        snapshot: item.snapshot,
        updatedAt: item.updatedAt.getTime(),
      });
    }
  }
}

export async function bootstrapWalkinSyncSnapshots(): Promise<void> {
  await db.execute(drizzleSql`
    CREATE TABLE IF NOT EXISTS walkin_sync_snapshots (
      scope TEXT NOT NULL,
      lead_id TEXT NOT NULL,
      snapshot_values JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (scope, lead_id)
    )
  `);
  await db.execute(drizzleSql`
    CREATE INDEX IF NOT EXISTS walkin_sync_snapshots_updated_at_idx
      ON walkin_sync_snapshots (updated_at)
  `);
}

/** Hydrate durable checkpoints before auto-pull can start. */
export async function hydrateWalkinSyncSnapshots(): Promise<number> {
  const snapshots = await db.select().from(walkinSyncSnapshots);
  successfulSyncValues.clear();
  for (const { scope, leadId, snapshot, updatedAt } of snapshots) {
    if (scope === "RIS" || scope === "RPS" || scope === "MASTER") {
      successfulSyncValues.set(`${scope}:${leadId}`, {
        snapshot: snapshot as SyncValues,
        updatedAt: new Date(updatedAt).getTime(),
      });
    }
  }
  return successfulSyncValues.size;
}

function getSyncConflicts(baseline: SyncValues | undefined, dbValues: SyncValues, sheetValues: SyncValues): string[] {
  if (!baseline) return [];
  return Object.keys(sheetValues).filter((field) =>
    Object.prototype.hasOwnProperty.call(baseline, field)
    && normalizedSyncValue(dbValues[field]) !== normalizedSyncValue(baseline[field])
    && normalizedSyncValue(sheetValues[field]) !== normalizedSyncValue(baseline[field])
    && normalizedSyncValue(dbValues[field]) !== normalizedSyncValue(sheetValues[field]),
  );
}

function getAmbiguousFieldsWithoutBaseline(
  baseline: SyncValues | undefined,
  dbValues: SyncValues,
  sheetValues: SyncValues,
): string[] {
  return Object.keys(sheetValues).filter((field) =>
    (!baseline || !Object.prototype.hasOwnProperty.call(baseline, field))
    &&
    normalizedSyncValue(dbValues[field]) !== normalizedSyncValue(sheetValues[field]),
  );
}

function getUnappliedSheetEdits(baseline: SyncValues | undefined, dbValues: SyncValues, sheetValues: SyncValues): string[] {
  if (!baseline) return [];
  return Object.keys(sheetValues).filter((field) =>
    Object.prototype.hasOwnProperty.call(baseline, field)
    && normalizedSyncValue(sheetValues[field]) !== normalizedSyncValue(baseline[field])
    && normalizedSyncValue(sheetValues[field]) !== normalizedSyncValue(dbValues[field]),
  );
}

function buildSafeSyncSnapshot(
  currentValues: SyncValues,
  baseline: SyncValues | undefined,
  preservedFields: string[],
  ambiguousFields: string[],
): SyncValues {
  const snapshot: SyncValues = { ...currentValues };
  for (const field of new Set([...preservedFields, ...ambiguousFields])) {
    if (baseline && Object.prototype.hasOwnProperty.call(baseline, field)) snapshot[field] = baseline[field];
    else delete snapshot[field];
  }
  return snapshot;
}

export function getSyncStatus() {
  return { ...syncStatus };
}

type ReconciliationScope = "RIS" | "RPS" | "MASTER";

async function markReconciliation(...scopes: ReconciliationScope[]): Promise<void> {
  for (const scope of new Set(scopes)) {
    await db.insert(walkinSyncReconciliations).values({ scope, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: walkinSyncReconciliations.scope,
        set: { updatedAt: new Date() },
      });
  }
}

async function clearReconciliation(scope: ReconciliationScope): Promise<void> {
  await db.delete(walkinSyncReconciliations).where(eq(walkinSyncReconciliations.scope, scope));
}

async function recoverPendingReconciliations(): Promise<void> {
  const pending = await db.select().from(walkinSyncReconciliations);
  for (const { scope } of pending) {
    if (scope === "RIS" || scope === "RPS") {
      const leads = await db.select().from(walkinLeads).where(eq(walkinLeads.brand, scope));
      for (const lead of leads) {
        if (lead.isArchived) await removeLeadFromSheet(scope, lead.id);
        else await upsertLeadToSheet(scope, lead);
      }
      await clearReconciliation(scope);
    } else if (scope === "MASTER") {
      const leads = await db.select().from(walkinLeads);
      for (const lead of leads) {
        if (lead.isArchived) await removeLeadFromMasterSheet(lead.id);
        else await upsertLeadToMasterSheet(lead);
      }
      await clearReconciliation(scope);
    }
  }
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

/** Check the write-side OAuth path before a reviewed bulk import changes the CRM. */
export async function assertWalkinSheetMirrorReady(): Promise<void> {
  const auth = getAuthClient();
  if (!auth || !getSheetId("RIS") || !getSheetId("RPS") || !process.env.MASTER_WALKIN_SHEET_ID_2728) {
    throw new Error("Sheet mirroring is not configured");
  }
  await auth.getAccessToken();
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

  if (exists) {
    // Existing worksheets must keep every current column in place. The new
    // actual-admission field is appended after Lead ID; legacy "Admission
    // Date" remains the walk-in date and is never relabeled or migrated.
    const headerResp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tabName}!1:1`,
    });
    const currentHeader = headerResp.data.values?.[0] ?? [];
    const actualAdmissionDateIndexes = currentHeader
      .map((cell: string, index: number) =>
        cell.trim().toLowerCase() === "actual admission date" ? index : -1)
      .filter((index: number) => index >= 0);
    if (actualAdmissionDateIndexes.length > 1) {
      throw new Error(`"${tabName}" has duplicate Actual Admission Date headers`);
    }
    if (actualAdmissionDateIndexes.length === 0) {
      const leadIdIndex = currentHeader.findIndex(
        (cell: string) => cell.trim().toLowerCase() === "lead id",
      );
      if (leadIdIndex < 0) {
        throw new Error(`"${tabName}" is missing its Lead ID header; refusing to shift columns`);
      }
      const appendIndex = currentHeader.length;
      if (appendIndex !== leadIdIndex + 1) {
        throw new Error(`"${tabName}" has columns after Lead ID; refusing to shift columns`);
      }
      await fencedWalkinSheetWrite(`append Actual Admission Date header to ${tabName}`, () =>
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tabName}!${columnLetter(appendIndex)}1`,
          valueInputOption: "RAW",
          requestBody: { values: [["Actual Admission Date"]] },
        }),
      );
    } else {
      const leadIdIndex = currentHeader.findIndex(
        (cell: string) => cell.trim().toLowerCase() === "lead id",
      );
      if (leadIdIndex < 0 || actualAdmissionDateIndexes[0] !== leadIdIndex + 1 ||
          actualAdmissionDateIndexes[0] !== currentHeader.length - 1) {
        throw new Error(`"${tabName}" has an unexpected Actual Admission Date position; refusing to shift columns`);
      }
    }
    return false;
  }

  // Create the tab
  await fencedWalkinSheetWrite(`create ${tabName} tab`, () => sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title: tabName } } }],
    },
  }));

  // Write the header row immediately so the tab is never empty
  await fencedWalkinSheetWrite(`write ${tabName} header`, () => sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tabName}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [headers as unknown as string[]] },
  }));

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
// Maps a WalkinLead DB row to a flat array matching the target sheet's layout.
export async function leadToRow(lead: WalkinLead, brand = lead.brand as "RIS" | "RPS"): Promise<string[]> {
  const seqPart = lead.brandSeqNum != null ? lead.brandSeqNum : (lead as any).seqNum ?? lead.id;
  const uniqueId = `LD-${formatDateDotted(lead.enquiryDate)}-${lead.brand}-${seqPart}`;
  const values: Record<string, string> = {
    "Unique ID": uniqueId,
    "Date": formatDateDDMMYYYY(lead.enquiryDate),
    "Time": formatTime12h(lead.createdAt),
    "Student Name": lead.childName,
    "Father Name": lead.parentName,
    "Mother Name": (lead as any).motherName ?? "",
    "GRADE": lead.program,
    "Branch": await resolveBranchName(lead.branchId),
    "Academic Year": lead.academicYear,
    "Father Contact": lead.phone,
    "Mother Contact": lead.altPhone ?? "",
    "Email": lead.email ?? "",
    "Counsellor Name": lead.leadOwner ?? "",
    "Source": lead.source,
    "Status": lead.status,
    "Admission Date": lead.walkInDate ? formatDateDDMMYYYY(lead.walkInDate) : "",
    "Follow up Remarks": lead.remark ?? "",
    "Reason for Closed": lead.closeReason ?? "",
    "Revisit 1 Date": lead.revisitDate ? formatDateDDMMYYYY(lead.revisitDate) : "",
    "Revisit 2 Date": (lead as any).revisitDate2 ? formatDateDDMMYYYY((lead as any).revisitDate2) : "",
    "Lead ID": String(lead.id),
    "Actual Admission Date": lead.admissionDate ? formatDateDDMMYYYY(lead.admissionDate) : "",
  };
  // USER_ENTERED parses leading =,+,-,@ as formulas. Protect every value
  // that can originate in user-entered text before it reaches a workbook.
  return headersForBrand(brand).map((header) => {
    const value = values[header] ?? "";
    return /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  });
}

function syncValuesFromSheetRow(header: string[], row: string[], hasActualAdmissionDate: boolean): SyncValues {
  const value = (name: string, fallback: number) => cellAt(row, headerIndex(header, name, fallback));
  return syncValuesFromSheet({
    status: value("Status", 14),
    walkInDate: parseDateFromSheet(value("Admission Date", 15)),
    admissionDate: hasActualAdmissionDate
      ? parseDateFromSheet(value("Actual Admission Date", headerIndex(header, "Actual Admission Date", header.length - 1)))
      : null,
    remark: value("Follow up Remarks", 16),
    closeReason: value("Reason for Closed", 17),
    revisitDate: parseDateFromSheet(value("Revisit 1 Date", 18)),
    revisitDate2: parseDateFromSheet(value("Revisit 2 Date", 19)),
  });
}

async function updateRowPreservingColumns(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string,
  tab: string,
  rowNumber: number,
  values: string[],
  protectedIndices: readonly number[],
  label: string,
): Promise<void> {
  const protectedSet = new Set(protectedIndices);
  const data: Array<{ range: string; values: string[][] }> = [];
  let start = -1;
  for (let index = 0; index <= values.length; index++) {
    const writable = index < values.length && !protectedSet.has(index);
    if (writable && start < 0) start = index;
    if (!writable && start >= 0) {
      data.push({
        range: `${tab}!${columnLetter(start)}${rowNumber}:${columnLetter(index - 1)}${rowNumber}`,
        values: [values.slice(start, index)],
      });
      start = -1;
    }
  }
  if (data.length === 0) return;
  await fencedWalkinSheetWrite(label, () => sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "USER_ENTERED", data },
  }));
}

async function leadToMasterRow(lead: WalkinLead): Promise<string[]> {
  const brandRow = await leadToRow(lead, "RPS");
  const byHeader = new Map<string, string>(
    RPS_SHEET_HEADERS.map((header, index) => [header, brandRow[index]]),
  );
  byHeader.set("Brand", lead.brand);
  return MASTER_SHEET_HEADERS.map((header) => byHeader.get(header) ?? "");
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
    throw new Error("Google auth not configured for sheet upsert");
  }
  const sheetId = getSheetId(brand);
  if (!sheetId) {
    throw new Error(`${brand}_WALKIN_SHEET_ID_2728 not set for sheet upsert`);
  }

  // Brand guard — never write a RIS lead into the RPS sheet or vice-versa
  if (lead.brand !== brand) {
    console.error(`[walkin/sheets] Brand mismatch: lead.brand=${lead.brand} but target sheet is ${brand} — aborting`);
    throw new Error(`Brand mismatch for lead ${lead.id}`);
  }

  const sheets = google.sheets({ version: "v4", auth });
  const headers = headersForBrand(brand);
  const row = await leadToRow(lead, brand);
  const leadIdColLetter = columnLetter(headers.indexOf("Lead ID"));

  // Ensure the WALKINs tab exists (creates it with header row on first use)
  await ensureLeadsTab(sheets, sheetId, LEADS_TAB, headers);

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
        const currentRowResp = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId!,
          range: `${LEADS_TAB}!A${sheetsRow}:${columnLetter(headers.length - 1)}${sheetsRow}`,
        });
        const currentRow = currentRowResp.data.values?.[0] ?? [];
        const currentRowLeadId = leadIdFromRow(currentRow, headers.indexOf("Lead ID"));
        if (currentRowLeadId !== String(lead.id)) {
          throw new Error(`Lead ${lead.id} moved while reading ${brand} row ${sheetsRow}; refusing to update a different row`);
        }
        const currentSheetValues = syncValuesFromSheetRow(
          headers as string[],
          currentRow,
          headers.some((header) => header.trim().toLowerCase() === "actual admission date"),
        );
        const dbValues = syncValuesFromLead(lead);
        const baseline = await getSyncSnapshot(brand, String(lead.id));
        const conflicts = getSyncConflicts(baseline, dbValues, currentSheetValues);
        const ambiguous = getAmbiguousFieldsWithoutBaseline(baseline, dbValues, currentSheetValues);
        const pendingSheetEdits = getUnappliedSheetEdits(baseline, dbValues, currentSheetValues);
        if (conflicts.length > 0 || ambiguous.length > 0 || pendingSheetEdits.length > 0) {
          const fields = [...new Set([...conflicts, ...ambiguous, ...pendingSheetEdits])];
          const reason = ambiguous.length > 0 ? "ambiguous without a sync baseline" : "unsynced concurrent edits";
          const message = `Lead ${lead.id}: ${brand} sheet has ${reason} in ${fields.join(", ")}; row left unchanged`;
          syncStatus[brand].lastError = message;
          throw new Error(message);
        }
        await updateRowPreservingColumns(
          sheets,
          sheetId!,
          LEADS_TAB,
          sheetsRow,
          row,
          [], // CRM is authoritative for protected submission fields too.
          `upsert ${brand} lead ${lead.id}`,
        );
        console.log(`[walkin/sheets] Updated row ${sheetsRow} for lead ${lead.id} in ${brand} sheet`);
      } else {
        // Append a new row after the last row
        await fencedWalkinSheetWrite(`append ${brand} lead ${lead.id}`, () => sheets.spreadsheets.values.append({
          spreadsheetId: sheetId!,
          range: `${LEADS_TAB}!A1`,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: [row] },
        }));
        console.log(`[walkin/sheets] Appended new lead ${lead.id} to ${brand} sheet`);
      }

      // Update in-memory sync status
      syncStatus[brand].lastSyncAt = new Date();
      syncStatus[brand].lastError = null;
      await persistSyncSnapshot(brand, String(lead.id), syncValuesFromLead(lead));
    } catch (err: any) {
      if (!retried && err?.code === 429) {
        console.warn(`[walkin/sheets] Rate-limited (429) for ${brand} — retrying in 2s`);
        await new Promise((r) => setTimeout(r, 2000));
        return doUpsert(true);
      }
      syncStatus[brand].lastError = err?.message ?? "Unknown error";
      console.error(`[walkin/sheets] Upsert failed for lead ${lead.id} (${brand}):`, err?.message);
      throw err;
    }
  }

  await doUpsert();
}

// ── Fire-and-forget wrapper (used in API route handlers) ─────────
// Never throws — sheet failure must not block the API response.
export function queueUpsert(brand: "RIS" | "RPS", lead: WalkinLead): void {
  // Mark before trying to claim the lease. If another Autoscale instance owns
  // it, the DB lead still leaves a durable workbook-reconciliation request
  // instead of losing the fire-and-forget Sheet mirror attempt.
  void markReconciliation(brand, "MASTER")
    .then(() => runWalkinSheetOperation("queued lead upsert", async () => {
      const [freshLead] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, lead.id));
      if (!freshLead || freshLead.isArchived) {
        throw new Error(`Lead ${lead.id} is missing or archived; queued sheet upsert deferred`);
      }
      if (freshLead.brand !== brand) {
        throw new Error(`Lead ${lead.id} changed brand to ${freshLead.brand}; ${brand} sheet upsert deferred`);
      }
      await upsertLeadToSheet(brand, freshLead);
      await upsertLeadToMasterSheet(freshLead);
      await clearReconciliation(brand);
      await clearReconciliation("MASTER");
    }))
    .catch((err) => console.error("[walkin/sheets] Unexpected queue error:", err?.message));
}

/** Mirror a reviewed import as one leased operation, not hundreds of competing
 * fire-and-forget upserts that can clear one another's recovery markers. */
export function queueImportUpserts(ids: string[]): void {
  if (ids.length === 0) return;
  void markReconciliation("RIS", "RPS", "MASTER")
    .then(() => runWalkinSheetOperation("historical import mirror", async () => {
      // Reconcile all pending DB records, not just this batch. A normal edit
      // may have arrived while the import held the sheet lease.
      await recoverPendingReconciliations();
    }))
    .catch((err: any) => {
      const message = `Historical import mirror is pending: ${err?.message ?? "unknown error"}`;
      syncStatus.RIS.lastError = message;
      syncStatus.RPS.lastError = message;
      syncStatus.MASTER.lastError = message;
      console.error("[walkin/sheets]", message);
    });
}

// ── Upsert a single lead into the master (combined) sheet ────────
export async function upsertLeadToMasterSheet(lead: WalkinLead): Promise<void> {
  const auth = getAuthClient();
  if (!auth) throw new Error("Google auth not configured for Master upsert");
  const sheetId = process.env.MASTER_WALKIN_SHEET_ID_2728 || null;
  if (!sheetId) {
    throw new Error("MASTER_WALKIN_SHEET_ID_2728 not set for Master upsert");
  }

  const sheets = google.sheets({ version: "v4", auth });
  const row = await leadToMasterRow(lead);
  const leadIdColLetter = columnLetter(MASTER_SHEET_HEADERS.indexOf("Lead ID"));

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
        const currentRowResp = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId!,
          range: `${MASTER_LEADS_TAB}!A${sheetsRow}:${columnLetter(MASTER_SHEET_HEADERS.length - 1)}${sheetsRow}`,
        });
        const currentRow = currentRowResp.data.values?.[0] ?? [];
        const currentRowLeadId = leadIdFromRow(currentRow, MASTER_SHEET_HEADERS.indexOf("Lead ID"));
        if (currentRowLeadId !== String(lead.id)) {
          throw new Error(`Lead ${lead.id} moved while reading Master row ${sheetsRow}; refusing to update a different row`);
        }
        const currentSheetValues = syncValuesFromSheetRow(
          MASTER_SHEET_HEADERS as unknown as string[],
          currentRow,
          true,
        );
        const dbValues = syncValuesFromLead(lead);
        const baseline = await getSyncSnapshot("MASTER", String(lead.id));
        const conflicts = getSyncConflicts(baseline, dbValues, currentSheetValues);
        const ambiguous = getAmbiguousFieldsWithoutBaseline(baseline, dbValues, currentSheetValues);
        const pendingSheetEdits = getUnappliedSheetEdits(baseline, dbValues, currentSheetValues);
        if (conflicts.length > 0 || ambiguous.length > 0 || pendingSheetEdits.length > 0) {
          const fields = [...new Set([...conflicts, ...ambiguous, ...pendingSheetEdits])];
          const reason = ambiguous.length > 0 ? "ambiguous without a sync baseline" : "unsynced concurrent edits";
          const message = `Lead ${lead.id}: Master sheet has ${reason} in ${fields.join(", ")}; row left unchanged`;
          syncStatus.MASTER.lastError = message;
          throw new Error(message);
        }
        await updateRowPreservingColumns(
          sheets,
          sheetId!,
          MASTER_LEADS_TAB,
          sheetsRow,
          row,
          [], // Range protections remain; only this trusted CRM sync writes them.
          `upsert Master lead ${lead.id}`,
        );
      } else {
        await fencedWalkinSheetWrite(`append Master lead ${lead.id}`, () => sheets.spreadsheets.values.append({
          spreadsheetId: sheetId!, range: `${MASTER_LEADS_TAB}!A1`,
          valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS",
          requestBody: { values: [row] },
        }));
      }

      syncStatus.MASTER.lastSyncAt = new Date();
      syncStatus.MASTER.lastError = null;
      await persistSyncSnapshot("MASTER", String(lead.id), syncValuesFromLead(lead));
    } catch (err: any) {
      if (!retried && err?.code === 429) {
        await new Promise((r) => setTimeout(r, 2000));
        return doUpsert(true);
      }
      syncStatus.MASTER.lastError = err?.message ?? "Unknown error";
      console.error(`[walkin/sheets] Master upsert failed for lead ${lead.id}:`, err?.message);
      throw err;
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
 * Master cols A–O (0-based 0–14) are auto-populated by the sync system and
 * must not be overwritten by sheet editors. Green cols P–U (15–20) remain
 * editable so MIS staff can update Status, Dates, and Remarks.
 */
export const MASTER_YELLOW_PROTECTION_DESCRIPTION =
  "Master read-only columns (A–N) — protected by sync";

/**
 * All 14 0-based column indices in the Master sheet that are sync-managed
 * (Brand, Unique ID, Date, Time, Student Name, Father Name, Mother Name, GRADE,
 * Academic Year, Father Contact, Mother Contact, Email, Counsellor Name, Source).
 */
export const MASTER_YELLOW_COL_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

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

/** Build warningOnly protection requests for Master cols A–O (indices 0–14). */
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

  await fencedWalkinSheetWrite(`apply ${brand} sheet protections`, () => sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  }));

  console.log(
    `[walkin/sheets] Yellow-column protections + dropdowns applied on tab "${LEADS_TAB}" (${brand})`,
  );
}

/**
 * Apply warningOnly protections on Master cols A–O (indices 0–14).
 * Green cols P–U (15–20) are intentionally left unprotected so MIS staff can
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
    buildStatusDropdownRequest(tabSheetId, 15),                                    // col P = Status (dropdown)
    buildSourceDropdownRequest(tabSheetId, 14),                                    // col O = Source (dropdown)
    buildCloseReasonDropdownRequest(tabSheetId, 18),                               // col S = Reason for Closed (dropdown)
    // Clear stale validation from columns that should be free-text / date pickers
    buildClearValidationRequest(tabSheetId, 11),   // col L = Email
    buildClearValidationRequest(tabSheetId, 16),   // col Q = Admission Date
    buildClearValidationRequest(tabSheetId, 17),   // col R = Follow up Remarks
    buildClearValidationRequest(tabSheetId, 19),   // col T = Revisit 1 Date
    buildClearValidationRequest(tabSheetId, 20),   // col U = Revisit 2 Date
    // Note: Status column background colour is managed manually in the sheet.
  ];

  await fencedWalkinSheetWrite("apply Master sheet protections", () => sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests },
  }));

  console.log(
    `[walkin/sheets] Master A–O protections + Status/Source dropdowns applied on tab "${MASTER_LEADS_TAB}"`,
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
  const headers = headersForBrand(brand);

  // 1. Fetch all non-archived leads for this brand from DB
  const leads = await db
    .select()
    .from(walkinLeads)
    .where(and(eq(walkinLeads.brand, brand), eq(walkinLeads.isArchived, false)))
    .orderBy(walkinLeads.enquiryDate);

  // 2. Serialise all rows
  const dataRows = await Promise.all(leads.map((lead) => leadToRow(lead, brand)));

  // 3. Ensure the WALKINs tab exists (creates it with header on first run).
  //    If it was just created, skip the clear — there is nothing to clear.
  const tabWasCreated = await ensureLeadsTab(sheets, sheetId, LEADS_TAB, headers);

  if (!tabWasCreated) {
    const snapshot = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId, range: `${LEADS_TAB}!A:Z`,
    });
    const existing = snapshot.data.values ?? [];
    const idIndex = (existing[0] ?? []).findIndex(value => value.trim() === "Lead ID");
    if (idIndex < 0 || existing.slice(1).some(row => row.some(cell => cell?.trim()) && !row[idIndex]?.trim())) {
      throw new Error(`${brand} sheet contains historical rows without Lead IDs; full resync would erase them. Use incremental synchronization.`);
    }
    // 3a. Clear existing data rows (A2:end), preserving the header row
    try {
      await fencedWalkinSheetWrite(`clear ${brand} sheet for resync`, () => sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId,
        range: `${LEADS_TAB}!A2:Z`,
      }));
    } catch (err: any) {
      throw new Error(`${brand} sheet clear failed: ${err?.message ?? "Unknown error"}`);
    }

    // 3b. Re-write header row (ensures it's always up to date)
    await fencedWalkinSheetWrite(`rewrite ${brand} sheet header`, () => sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
        requestBody: { values: [headers as unknown as string[]] },
    }));
  }

  // 5. Write data rows (OVERWRITE uses existing empty cells; avoids row-shift that loses validation)
  if (dataRows.length > 0) {
    await fencedWalkinSheetWrite(`write ${brand} resync rows`, () => sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: dataRows },
    }));
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

  // Persist checkpoints only after the sheet write has completed successfully.
  await persistSyncSnapshots(brand, leads);

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
    leads.map((lead) => leadToMasterRow(lead))
  );

  // 3. Ensure the WALKINs tab exists in the master sheet.
  //    If it was just created, skip the clear — the tab is already empty.
  const masterTabWasCreated = await ensureLeadsTab(sheets, sheetId, MASTER_LEADS_TAB, MASTER_SHEET_HEADERS);

  if (!masterTabWasCreated) {
    const snapshot = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A:Z`,
    });
    const existing = snapshot.data.values ?? [];
    const idIndex = (existing[0] ?? []).findIndex(value => value.trim() === "Lead ID");
    if (idIndex < 0 || existing.slice(1).some(row => row.some(cell => cell?.trim()) && !row[idIndex]?.trim())) {
      throw new Error("Master sheet contains historical rows without Lead IDs; full resync would erase them. Use incremental synchronization.");
    }
    // Clear data rows
    try {
      await fencedWalkinSheetWrite("clear Master sheet for resync", () => sheets.spreadsheets.values.clear({
        spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A2:Z`,
      }));
    } catch (err: any) {
      throw new Error(`Master sheet clear failed: ${err?.message ?? "Unknown error"}`);
    }

    // Re-write header row (ensures it stays current)
    await fencedWalkinSheetWrite("rewrite Master sheet header", () => sheets.spreadsheets.values.update({
      spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [MASTER_SHEET_HEADERS as unknown as string[]] },
    }));
  }

  // 5. Write data rows (OVERWRITE — avoids row-shift that strips data validation)
  if (dataRows.length > 0) {
    await fencedWalkinSheetWrite("write Master resync rows", () => sheets.spreadsheets.values.update({
      spreadsheetId: sheetId, range: `${MASTER_LEADS_TAB}!A2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: dataRows },
    }));
  }

  // 6. Protect Master cols A–L (read-only) + Status/Source dropdowns — non-fatal
  try {
    const masterGrades = await fetchGradesForMaster();
    await applyMasterYellowColumnProtection(sheets, sheetId, masterGrades);
  } catch (err: any) {
    console.warn(`[walkin/sheets] Could not apply Master column protections:`, err?.message);
  }

  await persistSyncSnapshots("MASTER", leads);

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

async function applySheetChangesToDb(
  leadId: string,
  existing: any,
  patch: Record<string, any>,
  changes: Array<{ field: string; oldVal: string | null; newVal: string | null }>,
  changedBy: "sheet-sync" | "master-sync",
): Promise<boolean> {
  const perform = async (executor: any): Promise<boolean> => {
    let update = executor.update(walkinLeads).set(patch);
    update = update.where(existing.updatedAt
      ? and(eq(walkinLeads.id, leadId), eq(walkinLeads.updatedAt, existing.updatedAt))
      : eq(walkinLeads.id, leadId));
    if (existing.updatedAt && typeof update.returning === "function") {
      const updatedRows = await update.returning({ id: walkinLeads.id });
      if (updatedRows.length === 0) return false;
    } else {
      await update;
    }
    await Promise.all(changes.map((change) =>
      executor.insert(walkinLeadAuditLog).values({
        leadId,
        field: change.field,
        oldValue: change.oldVal,
        newValue: change.newVal,
        changedBy,
      }),
    ));
    return true;
  };

  // Production DB transactions keep the optimistic update and its audit trail
  // atomic. Lightweight test doubles may not implement transactions.
  if (typeof (db as any).transaction === "function") {
    return (db as any).transaction((tx: any) => perform(tx));
  }
  return perform(db);
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

    // Include the appended admission date. The header is resolved below so RIS
    // and RPS can safely retain their different Branch-column layouts.
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!A:V`,
    });

    const rows = resp.data.values ?? [];
    const header = rows[0] ?? [];
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

    for (const row of dataRows) {
      const hasBranch = header.some((cell) => cell.trim().toLowerCase() === "branch");
      const leadId = leadIdFromRow(row, headerIndex(header, "Lead ID", hasBranch ? 20 : 19));
      if (!leadId) continue;

      // Legacy "Admission Date" still maps to walkInDate. The separately
      // appended Actual Admission Date column maps only to admissionDate.
      const sheetStatus        = cellAt(row, headerIndex(header, "Status", hasBranch ? 14 : 13));
      const sheetWalkInDate    = parseDateFromSheet(cellAt(row, headerIndex(header, "Admission Date", hasBranch ? 15 : 14)));
      const hasActualAdmissionDate = header.some(
        (cell) => cell.trim().toLowerCase() === "actual admission date",
      );
      const sheetActualAdmissionDate = hasActualAdmissionDate
        ? parseDateFromSheet(cellAt(row, headerIndex(header, "Actual Admission Date", hasBranch ? 21 : 20)))
        : null;
      const sheetRemark        = cellAt(row, headerIndex(header, "Follow up Remarks", hasBranch ? 16 : 15));
      const sheetCloseReason   = cellAt(row, headerIndex(header, "Reason for Closed", hasBranch ? 17 : 16));
      const sheetRevisitDate   = parseDateFromSheet(cellAt(row, headerIndex(header, "Revisit 1 Date", hasBranch ? 18 : 17)));
      const sheetRevisitDate2  = parseDateFromSheet(cellAt(row, headerIndex(header, "Revisit 2 Date", hasBranch ? 19 : 18)));

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
        if (allowedStatuses.size > 0 && !allowedStatuses.has(sheetStatus) && sheetStatus !== existing.status) {
          // Invalid status from sheet — skip and surface in pull log so an admin can investigate.
          entry.errors.push(
            `Lead ${leadId}: sheet status "${sheetStatus}" is not a recognised status — skipped (valid values: ${[...allowedStatuses].join(", ")})`
          );
        } else {
          check("status", existing.status, sheetStatus);
        }
      }
      check("walkInDate",          existing.walkInDate,          sheetWalkInDate);
      if (hasActualAdmissionDate) {
        check("admissionDate", existing.admissionDate, sheetActualAdmissionDate);
      }
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

      const sheetSyncValues = syncValuesFromLead(existing as WalkinLead);
      const requestedValues: SyncValues = { ...sheetSyncValues };
      for (const change of changes) requestedValues[change.field] = change.newVal;
      const baseline = await getSyncSnapshot(brand, leadId);
      const dbValues = syncValuesFromLead(existing as WalkinLead);
      const conflicts = getSyncConflicts(baseline, dbValues, requestedValues);
      const ambiguous = getAmbiguousFieldsWithoutBaseline(
        baseline,
        dbValues,
        requestedValues,
      );
      const dbOnlyChanges = baseline
        ? changes.filter((change) =>
            normalizedSyncValue(existing[change.field]) !== normalizedSyncValue(baseline[change.field])
            && normalizedSyncValue(requestedValues[change.field]) === normalizedSyncValue(baseline[change.field]),
          )
        : [];
      if (dbOnlyChanges.length > 0) {
        const fields = dbOnlyChanges.map((change) => change.field);
        const message = `Lead ${leadId}: DB changed since last sync (${fields.join(", ")}); stale ${brand} sheet values preserved/skipped`;
        entry.errors.push(message);
        syncStatus[brand].lastError = message;
      }
      if (conflicts.length > 0) {
        const message = `Lead ${leadId}: concurrent DB and ${brand} sheet edits conflict in ${conflicts.join(", ")}; conflicting fields skipped`;
        entry.errors.push(message);
        syncStatus[brand].lastError = message;
      }
      if (ambiguous.length > 0) {
        const message = `Lead ${leadId}: ${brand} sheet/DB mismatch is ambiguous without a successful-sync baseline (${ambiguous.join(", ")}); mismatched fields preserved`;
        entry.errors.push(message);
        syncStatus[brand].lastError = message;
      }
      const skippedFields = new Set([...dbOnlyChanges.map((change) => change.field), ...conflicts, ...ambiguous]);
      for (let i = changes.length - 1; i >= 0; i--) {
        if (skippedFields.has(changes[i].field)) changes.splice(i, 1);
      }

      if (changes.length === 0) {
        const safeSnapshot = buildSafeSyncSnapshot(
          dbValues,
          baseline,
          [...conflicts, ...dbOnlyChanges.map((change) => change.field)],
          ambiguous,
        );
        if (JSON.stringify(safeSnapshot) !== JSON.stringify(baseline ?? {})) {
          try {
            await persistSyncSnapshot(brand, leadId, safeSnapshot);
          } catch (snapshotError: any) {
            const message = `Snapshot persistence failed for ${brand} lead ${leadId}: ${snapshotError?.message ?? "Unknown error"}`;
            entry.errors.push(message);
            syncStatus[brand].lastError = message;
            try {
              await markReconciliation(brand);
            } catch (markerError: any) {
              entry.errors.push(`${brand} reconciliation marker failed for lead ${leadId}: ${markerError?.message}`);
            }
          }
        }
        continue;
      }

      // Build patch
      const patch: Record<string, any> = { updatedBy: "sheet-sync", updatedAt: new Date() };
      for (const c of changes) patch[c.field] = c.newVal;

      try {
        const updateApplied = await applySheetChangesToDb(leadId, existing, patch, changes, "sheet-sync");
        if (!updateApplied) {
          const message = `Lead ${leadId}: DB changed during ${brand} pull; sheet values skipped by optimistic check`;
          entry.errors.push(message);
          syncStatus[brand].lastError = message;
          continue;
        }

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
        const nextBaseline = buildSafeSyncSnapshot(
          syncValuesFromLead(existing as WalkinLead),
          baseline,
          [...conflicts, ...dbOnlyChanges.map((change) => change.field)],
          ambiguous,
        );
        for (const change of changes) nextBaseline[change.field] = normalizedSyncValue(change.newVal);
        try {
          await persistSyncSnapshot(brand, leadId, nextBaseline);
        } catch (snapshotError: any) {
          const message = `Snapshot persistence failed for ${brand} lead ${leadId}: ${snapshotError?.message ?? "Unknown error"}`;
          entry.errors.push(message);
          syncStatus[brand].lastError = message;
          try {
            await markReconciliation(brand, "MASTER");
          } catch (markerError: any) {
            entry.errors.push(`Reconciliation marker failed for ${brand}/MASTER lead ${leadId}: ${markerError?.message}`);
          }
        }

        if (process.env.MASTER_WALKIN_SHEET_ID_2728) {
          try {
            const [freshLead] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, leadId));
            if (!freshLead || freshLead.isArchived) throw new Error(`Lead ${leadId} is missing or archived after DB update`);
            await upsertLeadToMasterSheet(freshLead);
          } catch (propagationError: any) {
            const message = `Master propagation for lead ${leadId} failed: ${propagationError?.message ?? "Unknown error"}`;
            entry.errors.push(message);
            syncStatus.MASTER.lastError = message;
            try {
              await markReconciliation("MASTER");
            } catch (markerError: any) {
              entry.errors.push(`Master reconciliation marker failed for lead ${leadId}: ${markerError?.message}`);
            }
          }
        } else {
          const message = `Master propagation for lead ${leadId} skipped: MASTER_WALKIN_SHEET_ID_2728 is not set`;
          entry.errors.push(message);
          syncStatus.MASTER.lastError = message;
          try {
            await markReconciliation("MASTER");
          } catch (markerError: any) {
            entry.errors.push(`Master reconciliation marker failed for lead ${leadId}: ${markerError?.message}`);
          }
        }
      } catch (e: any) {
        entry.errors.push(`DB update failed for lead ${leadId}: ${e?.message}`);
      }
    }
  } catch (e: any) {
    entry.errors.push(`Sheet read failed: ${e?.message}`);
    syncStatus[brand].lastError = e?.message ?? "Pull failed";
  }

  console.log(
    `[walkin/sheets] Pull ${brand}: scanned=${entry.rowsScanned} changes=${entry.changesApplied} errors=${entry.errors.length}`
  );
  if (entry.errors.length > 0) syncStatus[brand].lastError = entry.errors[0];
  else syncStatus[brand].lastError = null;

  _pullLog.unshift(entry);
  if (_pullLog.length > 100) _pullLog.pop();
  return entry;
}

// ── Master MIS → DB + Brand Sheets pull (reverse sync) ──────────
// Reads the existing green columns plus the appended Actual Admission Date.
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

    // Read through the appended actual-admission date. Header names are resolved below because Master has
    // Branch and its staff-facing Source/Counsellor order differs from a brand.
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: `${MASTER_LEADS_TAB}!A:W`,
    });

    const rows = resp.data.values ?? [];
    const header = rows[0] ?? [];
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

    for (const row of dataRows) {
      const brand = (row[0]?.trim() ?? "") as "RIS" | "RPS";
      if (brand !== "RIS" && brand !== "RPS") continue;

      const leadId = leadIdFromRow(row, headerIndex(header, "Lead ID", 21));
      if (!leadId) continue;

      // Existing Master green columns remain P–U; actual admission is appended
      // after the hidden Lead ID in W and is never confused with walk-in date.
      const sheetStatus       = cellAt(row, headerIndex(header, "Status", 15));
      const sheetWalkInDate   = parseDateFromSheet(cellAt(row, headerIndex(header, "Admission Date", 16)));
      const hasActualAdmissionDate = header.some(
        (cell) => cell.trim().toLowerCase() === "actual admission date",
      );
      const sheetActualAdmissionDate = hasActualAdmissionDate
        ? parseDateFromSheet(cellAt(row, headerIndex(header, "Actual Admission Date", MASTER_SHEET_HEADERS.indexOf("Actual Admission Date"))))
        : null;
      const sheetRemark       = cellAt(row, headerIndex(header, "Follow up Remarks", 17));
      const sheetCloseReason  = cellAt(row, headerIndex(header, "Reason for Closed", 18));
      const sheetRevisitDate  = parseDateFromSheet(cellAt(row, headerIndex(header, "Revisit 1 Date", 19)));
      const sheetRevisitDate2 = parseDateFromSheet(cellAt(row, headerIndex(header, "Revisit 2 Date", 20)));

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
        if (allowedStatuses.size > 0 && !allowedStatuses.has(sheetStatus) && sheetStatus !== existing.status) {
          entry.errors.push(
            `Lead ${leadId}: Master status "${sheetStatus}" not recognised — skipped`
          );
        } else {
          check("status", existing.status, sheetStatus);
        }
      }
      check("walkInDate",        existing.walkInDate,        sheetWalkInDate);
      if (hasActualAdmissionDate) {
        check("admissionDate", existing.admissionDate, sheetActualAdmissionDate);
      }
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

      const requestedValues: SyncValues = { ...syncValuesFromLead(existing as WalkinLead) };
      for (const change of changes) requestedValues[change.field] = change.newVal;
      const baseline = await getSyncSnapshot("MASTER", leadId);
      const dbValues = syncValuesFromLead(existing as WalkinLead);
      const conflicts = getSyncConflicts(baseline, dbValues, requestedValues);
      const ambiguous = getAmbiguousFieldsWithoutBaseline(
        baseline,
        dbValues,
        requestedValues,
      );
      const dbOnlyChanges = baseline
        ? changes.filter((change) =>
            normalizedSyncValue(existing[change.field]) !== normalizedSyncValue(baseline[change.field])
            && normalizedSyncValue(requestedValues[change.field]) === normalizedSyncValue(baseline[change.field]),
          )
        : [];
      if (dbOnlyChanges.length > 0) {
        const fields = dbOnlyChanges.map((change) => change.field);
        const message = `Lead ${leadId}: DB changed since last sync (${fields.join(", ")}); stale Master sheet values preserved/skipped`;
        entry.errors.push(message);
        syncStatus.MASTER.lastError = message;
      }
      if (conflicts.length > 0) {
        const message = `Lead ${leadId}: concurrent DB and Master sheet edits conflict in ${conflicts.join(", ")}; conflicting fields skipped`;
        entry.errors.push(message);
        syncStatus.MASTER.lastError = message;
      }
      if (ambiguous.length > 0) {
        const message = `Lead ${leadId}: Master sheet/DB mismatch is ambiguous without a successful-sync baseline (${ambiguous.join(", ")}); mismatched fields preserved`;
        entry.errors.push(message);
        syncStatus.MASTER.lastError = message;
      }
      const skippedFields = new Set([...dbOnlyChanges.map((change) => change.field), ...conflicts, ...ambiguous]);
      for (let i = changes.length - 1; i >= 0; i--) {
        if (skippedFields.has(changes[i].field)) changes.splice(i, 1);
      }

      if (changes.length === 0) {
        const safeSnapshot = buildSafeSyncSnapshot(
          dbValues,
          baseline,
          [...conflicts, ...dbOnlyChanges.map((change) => change.field)],
          ambiguous,
        );
        if (JSON.stringify(safeSnapshot) !== JSON.stringify(baseline ?? {})) {
          try {
            await persistSyncSnapshot("MASTER", leadId, safeSnapshot);
          } catch (snapshotError: any) {
            const message = `Snapshot persistence failed for Master lead ${leadId}: ${snapshotError?.message ?? "Unknown error"}`;
            entry.errors.push(message);
            syncStatus.MASTER.lastError = message;
            try {
              await markReconciliation("MASTER");
            } catch (markerError: any) {
              entry.errors.push(`MASTER reconciliation marker failed for lead ${leadId}: ${markerError?.message}`);
            }
          }
        }
        continue;
      }

      const patch: Record<string, any> = { updatedBy: "master-sync", updatedAt: new Date() };
      for (const c of changes) patch[c.field] = c.newVal;

      try {
        const updateApplied = await applySheetChangesToDb(leadId, existing, patch, changes, "master-sync");
        if (!updateApplied) {
          const message = `Lead ${leadId}: DB changed during Master pull; sheet values skipped by optimistic check`;
          entry.errors.push(message);
          syncStatus.MASTER.lastError = message;
          continue;
        }

        entry.changesApplied += changes.length;
        for (const c of changes) {
          entry.changes.push({ leadId, parentName: existing.parentName ?? "", field: c.field, oldVal: c.oldVal, newVal: c.newVal });
        }
        const nextBaseline = buildSafeSyncSnapshot(
          syncValuesFromLead(existing as WalkinLead),
          baseline,
          [...conflicts, ...dbOnlyChanges.map((change) => change.field)],
          ambiguous,
        );
        for (const change of changes) nextBaseline[change.field] = normalizedSyncValue(change.newVal);
        try {
          await persistSyncSnapshot("MASTER", leadId, nextBaseline);
        } catch (snapshotError: any) {
          const message = `Snapshot persistence failed for Master lead ${leadId}: ${snapshotError?.message ?? "Unknown error"}`;
          entry.errors.push(message);
          syncStatus.MASTER.lastError = message;
          try {
            await markReconciliation("MASTER", brand);
          } catch (markerError: any) {
            entry.errors.push(`Reconciliation marker failed for MASTER/${brand} lead ${leadId}: ${markerError?.message}`);
          }
        }

        try {
          const [freshLead] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, leadId));
          if (!freshLead || freshLead.isArchived) throw new Error(`Lead ${leadId} is missing or archived after DB update`);
          await upsertLeadToSheet(brand, freshLead);
        } catch (propagationError: any) {
          const message = `${brand} back-propagation for lead ${leadId} failed: ${propagationError?.message ?? "Unknown error"}`;
          entry.errors.push(message);
          syncStatus[brand].lastError = message;
          try {
            await markReconciliation(brand);
          } catch (markerError: any) {
            entry.errors.push(`${brand} reconciliation marker failed for lead ${leadId}: ${markerError?.message}`);
          }
        }
      } catch (e: any) {
        entry.errors.push(`DB update failed for lead ${leadId}: ${e?.message}`);
      }
    }
  } catch (e: any) {
    entry.errors.push(`Master sheet read failed: ${e?.message}`);
  }

  console.log(
    `[walkin/sheets] Pull MASTER: scanned=${entry.rowsScanned} changes=${entry.changesApplied} errors=${entry.errors.length}`
  );
  if (entry.errors.length > 0) syncStatus.MASTER.lastError = entry.errors[0];
  else syncStatus.MASTER.lastError = null;

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

    // Read the header and rows through Lead ID. A full read avoids treating the
    // legacy one-cell-left IDs as absent during the layout transition.
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: masterSheetId,
      range: `${MASTER_LEADS_TAB}!A:V`,
    });

    const rows = resp.data.values ?? [];

    const header = rows[0] ?? [];
    const leadIdIndex = header.findIndex((cell) => cell.trim() === "Lead ID");
    // If the header is missing, the API likely returned a truncated/empty
    // response — bail out rather than mass-archiving everything.
    if (leadIdIndex < 0) {
      result.errors.push(
        "Master sheet header sanity check failed (missing 'Lead ID') — skipping deletion sync to avoid accidental mass-archival"
      );
      return result;
    }

    const masterLeadIds = new Set(
      rows.slice(1) // skip header row
        .map((r) => leadIdFromRow(r, leadIdIndex))
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
          await markReconciliation(lead.brand);
        }

        console.log(`[walkin/sheets] syncDeletionsFromMaster: archived ${lead.id} (${lead.brand})`);
      } catch (e: any) {
        result.errors.push(`${lead.id}: DB archive failed — ${e?.message}`);
      }
    }

    // Full resync so archived rows are physically removed from brand sheets
    // (cheaper than row-by-row deletion and leaves the sheet clean)
    for (const brand of brandsToResync) {
      let resynced = false;
      await resyncBrandToSheet(brand).then(() => {
        resynced = true;
      }).catch((e: any) => {
        result.errors.push(`${brand} sheet resync after archiving failed — ${e?.message}`);
      });
      if (resynced) await clearReconciliation(brand);
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
    throw new Error("Google auth not configured for sheet removal");
  }
  const sheetId = getSheetId(brand);
  if (!sheetId) {
    throw new Error(`${brand}_WALKIN_SHEET_ID_2728 not set for sheet removal`);
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    const headers = headersForBrand(brand);
    const idColumn = columnLetter(headers.indexOf("Lead ID"));
    const statusColumn = columnLetter(headers.indexOf("Status"));
    const readResp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!${idColumn}:${idColumn}`,
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

    await fencedWalkinSheetWrite(`archive ${brand} lead ${leadId}`, () => sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${LEADS_TAB}!${statusColumn}${sheetsRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["ARCHIVED"]] },
    }));

    console.log(`[walkin/sheets] Marked lead ${leadId} as ARCHIVED in ${brand} sheet (row ${sheetsRow})`);
    syncStatus[brand].lastSyncAt = new Date();
    syncStatus[brand].lastError = null;
  } catch (err: any) {
    syncStatus[brand].lastError = err?.message ?? "Unknown error";
    console.error(`[walkin/sheets] removeLeadFromSheet failed for lead ${leadId} (${brand}):`, err?.message);
    throw err;
  }
}

// ── Remove (archive) a lead from the Master MIS sheet ────────────
// Same approach: find by Lead ID (col V) and overwrite Status (col P).
export async function removeLeadFromMasterSheet(leadId: string): Promise<void> {
  const auth = getAuthClient();
  if (!auth) throw new Error("Google auth not configured for Master removal");
  const sheetId = process.env.MASTER_WALKIN_SHEET_ID_2728 || null;
  if (!sheetId) {
    throw new Error("MASTER_WALKIN_SHEET_ID_2728 not set for Master removal");
  }

  try {
    const sheets = google.sheets({ version: "v4", auth });

    const idColumn = columnLetter(MASTER_SHEET_HEADERS.indexOf("Lead ID"));
    const statusColumn = columnLetter(MASTER_SHEET_HEADERS.indexOf("Status"));
    const readResp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${MASTER_LEADS_TAB}!${idColumn}:${idColumn}`,
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

    await fencedWalkinSheetWrite(`archive Master lead ${leadId}`, () => sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${MASTER_LEADS_TAB}!${statusColumn}${sheetsRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["ARCHIVED"]] },
    }));

    console.log(`[walkin/sheets] Marked lead ${leadId} as ARCHIVED in Master sheet (row ${sheetsRow})`);
    syncStatus.MASTER.lastSyncAt = new Date();
    syncStatus.MASTER.lastError = null;
  } catch (err: any) {
    syncStatus.MASTER.lastError = err?.message ?? "Unknown error";
    console.error(`[walkin/sheets] removeLeadFromMasterSheet failed for lead ${leadId}:`, err?.message);
    throw err;
  }
}

// ── Fire-and-forget wrapper for archival sheet updates ────────────
// Never throws — sheet failure must not block the API response.
export function queueRemove(brand: "RIS" | "RPS", leadId: string): void {
  // Persist the recovery intent before lease acquisition for the same reason
  // as queueUpsert: temporary cross-instance contention must not erase it.
  void markReconciliation(brand, "MASTER")
    .then(() => runWalkinSheetOperation("queued lead removal", async () => {
      await removeLeadFromSheet(brand, leadId);
      await removeLeadFromMasterSheet(leadId);
      await clearReconciliation(brand);
      await clearReconciliation("MASTER");
    }))
    .catch((err) => console.error("[walkin/sheets] Unexpected remove error:", err?.message));
}

/** Keep the brand and combined workbook changes together for a lead archive. */
export async function resyncArchivedLead(brand: "RIS" | "RPS"): Promise<void> {
  await runWalkinSheetOperation("archive propagation", async () => {
    await markReconciliation(brand, "MASTER");
    const archived = await db.select({ id: walkinLeads.id }).from(walkinLeads)
      .where(and(eq(walkinLeads.brand, brand), eq(walkinLeads.isArchived, true)));
    for (const lead of archived) {
      await removeLeadFromSheet(brand, lead.id);
      await removeLeadFromMasterSheet(lead.id);
    }
    await clearReconciliation(brand);
    await clearReconciliation("MASTER");
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
export function aggregateCrmRows(dataRows: string[][]): Omit<CrmStats, "brand" | "academicYear" | "generatedAt" | "cachedAt" | "byBranch" | "dataSource" | "sourceHealth" | "warning"> {
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
  /** ISO timestamp of when data was fetched (preserved when served from cache). */
  cachedAt: string;
  dataSource: "database" | "hybrid";
  sourceHealth: {
    database: "available";
    supplementary: "available" | "unavailable";
    supplementaryFetchedAt: string | null;
    warning?: string;
  };
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

type CrmStatsCacheKey = `${"RIS" | "RPS"}:${"tracker" | "sales"}`;
const crmStatsCache   = new Map<CrmStatsCacheKey, CrmStatsEntry>();
/** Holds the in-progress fetch promise so concurrent cache-miss requests share one call. */
const crmStatsInFlight = new Map<CrmStatsCacheKey, Promise<CrmStats>>();
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
const crmStatsLastGood = new Map<CrmStatsCacheKey, CrmStatsEntry>();

/**
 * Invalidates the in-memory CRM stats cache for one or both brands.
 * Called when an admin explicitly triggers a refresh.
 */
export function bustCrmStatsCache(brand?: "RIS" | "RPS"): void {
  if (brand) {
    // Increment generation so any in-flight fetch that started before this bust
    // will see a mismatch when it settles and will discard its stale result.
    crmStatsGeneration.set(brand, (crmStatsGeneration.get(brand) ?? 0) + 1);
    crmStatsCache.delete(`${brand}:tracker`);
    crmStatsCache.delete(`${brand}:sales`);
    crmStatsInFlight.delete(`${brand}:tracker`);
    crmStatsInFlight.delete(`${brand}:sales`);
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
 * Returns aggregated CRM stats for one brand from database leads plus
 * supplementary connected-workbook rows not represented in the database.
 * Sales dashboards may additionally include that brand's WALKINs tab.
 *
 * Results are cached for 2 minutes.  Concurrent cache-miss requests
 * share a single in-flight promise (no duplicate DB queries).
 * Pass `{ bust: true }` to force a fresh read (admin-only).
 */
export async function readCrmLeadsTrackerStats(
  brand: "RIS" | "RPS",
  { bust = false, includeWalkins = false }: { bust?: boolean; includeWalkins?: boolean } = {},
): Promise<CrmStats> {
  const cacheKey: CrmStatsCacheKey = `${brand}:${includeWalkins ? "sales" : "tracker"}`;
  // 1. Serve cached result immediately (unless busting)
  if (!bust) {
    const entry = crmStatsCache.get(cacheKey);
    if (entry && Date.now() - entry.storedAt < CRM_STATS_TTL_MS) {
      console.log(`[walkin/crm-stats] Cache hit for ${brand}`);
      return entry.data;
    }
    // 2. Coalesce concurrent cache-miss requests
    const inflight = crmStatsInFlight.get(cacheKey);
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
      // Database rows remain authoritative. Supplementary workbook rows are
      // added only when the same date/phone/child identity is not in the DB.
      const databaseLeads = await db
        .select({
          id:          walkinLeads.id,
          enquiryDate: walkinLeads.enquiryDate,
          childName:   walkinLeads.childName,
          phone:       walkinLeads.phone,
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
      const supplement = await readMarketing2728Supplement(brand);
      if (!supplement.available) {
        const previousHybrid = crmStatsLastGood.get(cacheKey);
        if (previousHybrid?.data.dataSource === "hybrid") {
          console.warn(
            `[walkin/crm-stats] Supplementary source unavailable for ${brand}; preserving complete hybrid cache from ${new Date(previousHybrid.storedAt).toISOString()}`,
          );
          return {
            ...previousHybrid.data,
            stale: true,
            sourceHealth: {
              ...previousHybrid.data.sourceHealth,
              supplementary: "unavailable",
              warning: supplement.warning || "Supplementary figures are temporarily unavailable",
            },
          };
        }
      }
      const databaseIdentities = await db.select({
        id: walkinLeads.id,
        enquiryDate: walkinLeads.enquiryDate,
        phone: walkinLeads.phone,
        childName: walkinLeads.childName,
      }).from(walkinLeads).where(and(
        eq(walkinLeads.brand, brand),
        eq(walkinLeads.academicYear, "2027-28"),
      ));
      const databaseKeys = new Set(databaseIdentities.map(row => supplementLeadKey({
        enquiryDate: row.enquiryDate ?? "",
        phone: row.phone ?? "",
        childName: row.childName ?? "",
      })));
      const databaseIds = new Set(databaseIdentities.map(row => row.id));
      const supplementByIdentity = new Map<string, (typeof supplement.leads)[number]>();
      const supplementRows = includeWalkins
        ? [...supplement.leads, ...(supplement.walkins ?? [])]
        : supplement.leads;
      supplementRows.forEach((row, index) => {
        const hasIdentity = Boolean(row.phone || row.childName);
        const key = hasIdentity
          ? supplementLeadKey(row)
          : `unmatched|${row.enquiryDate}|${row.program}|${row.leadOwner}|${index}`;
        supplementByIdentity.set(key, row);
      });

      const branchRows = includeWalkins
        ? await db.select({
            id: walkinBranches.id,
            name: walkinBranches.name,
          }).from(walkinBranches).where(eq(walkinBranches.brand, brand))
        : [];
      const branchIds = new Map(
        branchRows.map(row => [row.name.trim().toLowerCase(), row.id] as const),
      );
      const supplementaryLeads = [...supplementByIdentity.values()]
        .filter(row => {
          const key = `${brand}|${supplementLeadKey(row)}`;
          const importedId = `crm-${createHash("sha256").update(key).digest("hex")}`;
          return !databaseKeys.has(supplementLeadKey(row)) && !databaseIds.has(importedId);
        })
        .map(row => ({
          ...row,
          branchId: row.branchName
            ? branchIds.get(row.branchName.trim().toLowerCase()) ?? null
            : null,
        }));
      const leads = [...databaseLeads, ...supplementaryLeads];

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

      // The summary dashboard is a gap-filler, not an additive source. Only
      // months absent from both DB and CRM lead rows are overlaid.
      for (const month of supplement.months) {
        if (monthDetailMap.has(month.month)) continue;
        totalLeads += month.leads;
        bookings += month.bookings;
        walkins += month.walkins;
        admissions += month.admissions;
        monthMap.set(month.month, month.leads);
        monthDetailMap.set(month.month, {
          leads: month.leads,
          walkins: month.walkins,
          admissions: month.admissions,
          closed: month.closed,
        });
        if (month.closed) statusMap.set("CLOSED", (statusMap.get("CLOSED") ?? 0) + month.closed);
        if (month.open) statusMap.set("OPEN", (statusMap.get("OPEN") ?? 0) + month.open);
        if (month.bookings) statusMap.set("WALK-IN BOOKED", (statusMap.get("WALK-IN BOOKED") ?? 0) + month.bookings);
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
        dataSource: supplement.available ? "hybrid" : "database",
        sourceHealth: {
          database: "available",
          supplementary: supplement.available ? "available" : "unavailable",
          supplementaryFetchedAt: supplement.fetchedAt,
          ...(!supplement.available
            ? { warning: supplement.warning || "Supplementary figures are temporarily unavailable; totals may be incomplete" }
            : supplement.warning
              ? { warning: supplement.warning }
              : {}),
        },
      };

      // Only write cache if our generation is still current — a bust that fired
      // while we were querying the DB will have incremented the generation, so
      // we must discard this stale result rather than overwriting the fresh one.
      if ((crmStatsGeneration.get(brand) ?? 0) === myGeneration) {
        const entry: CrmStatsEntry = { data: result, storedAt: Date.now() };
        crmStatsCache.set(cacheKey, entry);
        // Only complete hybrid results qualify as last-known-good. A cold-start
        // DB-only result may be useful, but must never displace complete figures.
        if (result.dataSource === "hybrid") crmStatsLastGood.set(cacheKey, entry);
        console.log(`[walkin/crm-stats] Fresh data fetched from DB and cached for ${brand} (${totalLeads} leads)`);
      } else {
        console.log(`[walkin/crm-stats] Discarding stale in-flight result for ${brand} (generation mismatch — bust fired during fetch)`);
      }
      return result;
    } catch (fetchErr: any) {
      // On any fetch failure, serve the last-known-good data with stale:true so
      // the dashboard keeps showing real numbers instead of zeros or a 500.
      const lastGood = crmStatsLastGood.get(cacheKey);
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
        crmStatsInFlight.delete(cacheKey);
      }
    }
  })();

  crmStatsInFlight.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// ── Auto-pull timer (every minute, with a shared durable lease) ──
let autoPullInitialTimer: NodeJS.Timeout | null = null;
let autoPullInterval: NodeJS.Timeout | null = null;
let autoPullRun: Promise<void> | null = null;

async function runAutoPullCycle(): Promise<void> {
  await runWalkinSheetOperation("automatic pull", async () => {
    // MASTER must run first so its DB writes land before the brand pulls compare
    // brand-sheet values against the DB.
    const results = [
      await pullChangesFromMasterSheet(),
      await pullChangesFromSheet("RIS"),
      await pullChangesFromSheet("RPS"),
    ];
    // A failed/ambiguous pull must never be followed by a full rewrite:
    // doing so would overwrite staff edits that still need review.
    if (results.some(result => result.errors.length)) {
      console.error("[walkin/sheets] Recovery paused until sheet pull errors are resolved");
      return;
    }
    await recoverPendingReconciliations();
    // Master is a mirror of the canonical CRM. A missing Master row must not
    // silently archive a newly imported or not-yet-mirrored database lead.
    // Deletion reconciliation remains an explicit admin-only action.
  });
}

export function startAutoPull(): void {
  const INTERVAL_MS = 60 * 1000; // 1-min fallback; instant sync via Apps Script webhook

  const run = async () => {
    if (isWalkinSyncDraining() || autoPullRun) return;
    autoPullRun = runAutoPullCycle()
      .catch((e: any) => console.error("[walkin/sheets] Auto-pull skipped or failed:", e?.message))
      .finally(() => { autoPullRun = null; });
    await autoPullRun;
  };

  // First run after 30 seconds so startup isn't slowed
  autoPullInitialTimer = setTimeout(() => {
    run();
    autoPullInterval = setInterval(run, INTERVAL_MS);
  }, 30_000);

  console.log("[walkin/sheets] Auto-pull scheduled every minute");
}

export async function stopAutoPullForShutdown(timeoutMs = 25_000): Promise<boolean> {
  beginWalkinSyncShutdown();
  if (autoPullInitialTimer) clearTimeout(autoPullInitialTimer);
  if (autoPullInterval) clearInterval(autoPullInterval);
  autoPullInitialTimer = null;
  autoPullInterval = null;

  const drained = await waitForWalkinSyncDrain(timeoutMs);
  if (!drained) {
    console.warn("[walkin/sheets] Shutdown drain timed out; an expired lease will allow recovery.");
  }
  return drained;
}
