/**
 * One-time script: delete test rows from the "All Friendship Leads" aggregate tab.
 * Identifies rows by phone number matching test patterns.
 * Run: node scripts/clean-test-sheet-rows.mjs
 */
import { google } from "googleapis";

const SHEET_ID = "1eTo457sA4SXnlQoEthHclcnr2WO_YG6cosUfhcrRmxA";
const TAB      = "All Friendship Leads";

// Phones used in all three test runs
const TEST_PHONES = new Set([
  "9100001111","9100002222",
  "9200001111","9200002222",
  "9300001111","9300002222",
  "8811110001","8811110002",
  "8822220001","8822220002",
  "8833330001","8833330002",
  "8899999999",  // ghost lead
]);

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const sheets = google.sheets({ version: "v4", auth });

// 1. Read all rows
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SHEET_ID,
  range: `${TAB}!A:K`,
});
const rows = res.data.values || [];
console.log(`Total rows (incl. header): ${rows.length}`);

// 2. Collect 1-based row indices to delete (skip header at index 0)
const toDelete = [];
for (let i = 1; i < rows.length; i++) {
  const phone = (rows[i][5] || "").toString().replace(/\D/g, "");
  if (TEST_PHONES.has(phone)) {
    toDelete.push(i); // 0-based sheet row index (header = 0)
  }
}
console.log(`Rows to delete: ${toDelete.length} → row indices (0-based): ${toDelete.join(", ")}`);

if (!toDelete.length) {
  console.log("Nothing to delete.");
  process.exit(0);
}

// Get the sheet's internal sheetId (not the spreadsheetId)
const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
const tabMeta = meta.data.sheets.find(s => s.properties.title === TAB);
if (!tabMeta) throw new Error(`Tab "${TAB}" not found`);
const sheetId = tabMeta.properties.sheetId;

// 3. Build deleteDimension requests in REVERSE order so indices don't shift
const requests = [...toDelete].reverse().map(rowIndex => ({
  deleteDimension: {
    range: {
      sheetId,
      dimension: "ROWS",
      startIndex: rowIndex,
      endIndex: rowIndex + 1,
    },
  },
}));

await sheets.spreadsheets.batchUpdate({
  spreadsheetId: SHEET_ID,
  requestBody: { requests },
});

console.log(`✓ Deleted ${toDelete.length} test rows from "${TAB}".`);
