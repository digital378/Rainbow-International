/**
 * Spot-check: RPS CRM Leads Tracker column mapping verification
 *
 * Reads the live "CRM Leads Tracker" tab from the RPS Google Sheet and
 * compares its header row against the column index constants used by the
 * parser in server/walkinSheets.ts.
 *
 * Usage:
 *   npx tsx scripts/spotCheckRpsCrmColumns.ts
 *
 * Prints PASS / MISMATCH for each expected column so staff can verify
 * the mapping without needing to open Google Sheets.
 */

import { google } from "googleapis";

// ── Expected column layout (0-based), from walkinSheets.ts ~line 1784 ──────
// Confirmed against the live RPS "CRM Leads Tracker" tab on 2026-07-30.
// The live sheet has a "Centre" column at [6]; Status and all subsequent
// columns are shifted one position right compared to the original design doc.
const EXPECTED_COLUMNS: Array<{ idx: number; name: string }> = [
  { idx: 0,  name: "Date" },
  { idx: 1,  name: "Time" },
  { idx: 2,  name: "Parent Name / Parent's Name" },
  { idx: 3,  name: "Child Name / Child's Name" },
  { idx: 4,  name: "Phone / Phone Number" },
  { idx: 5,  name: "Program" },
  { idx: 6,  name: "Centre" },
  { idx: 7,  name: "Status" },
  { idx: 8,  name: "Remark / Remarks" },
  { idx: 9,  name: "Lead Owner" },
  { idx: 10, name: "Source" },
  { idx: 11, name: "Walk-In Date" },
  { idx: 12, name: "Revisit Date" },
];

// The columns the parser actually reads (critical for KPIs)
const CRITICAL_COLUMNS = [0, 5, 7, 9, 10];

function getAuthClient() {
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing one or more of GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN"
    );
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

async function main() {
  const sheetId = process.env.RPS_WALKIN_SHEET_ID_2728;
  if (!sheetId) {
    console.error("❌  RPS_WALKIN_SHEET_ID_2728 is not set");
    process.exit(1);
  }

  const auth   = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  console.log("Fetching RPS 'CRM Leads Tracker' tab …\n");

  let allRows: string[][] = [];
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "'CRM Leads Tracker'!A:M",
    });
    allRows = (res.data.values ?? []) as string[][];
  } catch (err: any) {
    const msg: string = err?.message ?? "";
    if (msg.includes("Unable to parse range") || msg.includes("Requested entity was not found") || err?.code === 400) {
      console.error("❌  Tab 'CRM Leads Tracker' does not exist in the RPS sheet.");
      console.error("    Create the tab before running this check.");
    } else {
      console.error("❌  Google Sheets API error:", msg);
    }
    process.exit(1);
  }

  // ── Report header row ─────────────────────────────────────────────────────
  const headerRow = allRows[0] ?? [];
  const dataRows  = allRows.slice(1).filter(r => (r[0] ?? "").toString().trim() !== "");

  console.log("=".repeat(60));
  console.log("RPS CRM Leads Tracker — Column Mapping Spot-Check");
  console.log("=".repeat(60));
  console.log(`\nSheet ID : ${sheetId}`);
  console.log(`Header   : [${headerRow.map(h => `"${h}"`).join(", ")}]`);
  console.log(`Data rows (non-blank Date): ${dataRows.length}\n`);

  // ── Column comparison ─────────────────────────────────────────────────────
  let allCriticalPass = true;
  let allPass = true;

  console.log("Column mapping check:");
  for (const { idx, name: expected } of EXPECTED_COLUMNS) {
    const actual   = (headerRow[idx] ?? "").trim();
    const critical = CRITICAL_COLUMNS.includes(idx);
    const tag      = critical ? " [CRITICAL]" : "";

    // Accept partial / case-insensitive matches (e.g. "Walk-In Date" vs "Walk in Date")
    const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    // The "expected" field may list alternatives separated by " / "
    const alternatives = expected.split(" / ").map(normalise);
    const pass = alternatives.some(alt => normalise(actual).includes(alt) || alt.includes(normalise(actual)));

    const icon = pass ? "✓" : "✗";
    if (!pass) {
      allPass = false;
      if (critical) allCriticalPass = false;
    }

    console.log(
      `  [${String(idx).padStart(2)}] ${icon}${tag}  ` +
      `expected ≈ "${expected}"  actual = "${actual || "(empty)"}"`
    );
  }

  // ── KPI spot-check (if data rows exist) ──────────────────────────────────
  if (dataRows.length > 0) {
    console.log("\nKPI spot-check (manual count from raw rows):");

    const normalStatus = (r: string[]) => (r[6] ?? "").toString().trim().toUpperCase();
    const totalLeads  = dataRows.length;
    const admissions  = dataRows.filter(r => normalStatus(r) === "ADMISSION DONE").length;
    const walkins     = dataRows.filter(r => ["WALK-IN COMPLETED", "ADMISSION DONE"].includes(normalStatus(r))).length;
    const bookings    = dataRows.filter(r => normalStatus(r) === "WALK-IN BOOKED").length;

    console.log(`  totalLeads  = ${totalLeads}`);
    console.log(`  admissions  = ${admissions}`);
    console.log(`  walkins     = ${walkins}`);
    console.log(`  bookings    = ${bookings}`);
    console.log("");
    console.log("  Compare these numbers against GET /api/walkin/crm-stats?brand=RPS");
    console.log("  They should match within ±1 (one blank row tolerance).");
  } else {
    console.log("\n⚠  No data rows found — KPI spot-check skipped.");
    console.log("   Add at least 10 real rows to 'CRM Leads Tracker' then re-run.");
  }

  // ── Final verdict ─────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  if (!allCriticalPass) {
    console.log("RESULT: ❌  CRITICAL column mismatch — KPIs will be silently wrong!");
    console.log("  Update the column index constants in server/walkinSheets.ts ~line 1820-1827.");
  } else if (!allPass) {
    console.log("RESULT: ⚠  Non-critical columns differ — KPIs should still be correct,");
    console.log("   but review the mismatches above and update comments if needed.");
  } else {
    console.log("RESULT: ✓  All columns match. Parser is correctly wired.");
  }
  console.log("=".repeat(60));

  process.exit(allCriticalPass ? 0 : 1);
}

main().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
