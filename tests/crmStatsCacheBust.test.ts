/**
 * Integration test: cache-bust after a new website enquiry.
 *
 * Confirms that:
 *   1. `readCrmLeadsTrackerStats` serves a cached result on a second call
 *      (no extra Google Sheets API call is made within the TTL).
 *   2. `bustCrmStatsCache` — called by /api/inquiries after appending —
 *      invalidates that cache entry.
 *   3. The very next `readCrmLeadsTrackerStats` call makes a fresh API call
 *      instead of returning the stale cached result.
 *
 * No real Google Sheets or database calls are made; all external I/O is mocked.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Hoist the mock spy so it is available inside vi.mock() factories ─────────
const mockSheetsGet = vi.hoisted(() => vi.fn());
// Must use a regular function (not an arrow function) so it can be used as a
// constructor via `new google.auth.OAuth2(...)`.
const mockOAuth2Constructor = vi.hoisted(() =>
  vi.fn(function (this: any) {
    this.setCredentials = vi.fn();
  })
);

vi.mock("googleapis", () => ({
  google: {
    auth: { OAuth2: mockOAuth2Constructor },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        values: {
          get: mockSheetsGet,
        },
      },
    }),
  },
}));
vi.mock("../server/db", () => ({ db: {} }));
vi.mock("../shared/schema", () => ({}));

// ── Import after mocks are in place ─────────────────────────────────────────
import { readCrmLeadsTrackerStats, bustCrmStatsCache } from "../server/walkinSheets";

// ── Synthetic Google Sheets API response (header + 3 data rows) ──────────────
// Shape mirrors a real "CRM Leads Tracker" tab.
function makeFakeSheetResponse(rowCount: number) {
  const header = ["Date", "Time", "Parent Name", "Child Name", "Phone", "Program", "Status",
                  "Remark", "Lead Owner", "Source", "Walk-In Date", "Revisit Date", "Email"];
  const rows = Array.from({ length: rowCount }, (_, i) => [
    `${String(i + 1).padStart(2, "0")}/07/2027`,
    "10:00 AM",
    `Parent ${i + 1}`,
    `Child ${i + 1}`,
    `98765${String(i).padStart(5, "0")}`,
    "Class 1",
    "OPEN",
    "",
    "Priya",
    "Walk-In",
    "",
    "",
    "",
  ]);
  return { data: { values: [header, ...rows] } };
}

// ── Test setup ───────────────────────────────────────────────────────────────
beforeEach(() => {
  // Provide the OAuth credentials that getAuthClient() requires
  process.env.GOOGLE_REFRESH_TOKEN = "test-refresh-token";
  process.env.GOOGLE_CLIENT_ID     = "test-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
  process.env.RIS_WALKIN_SHEET_ID_2728 = "test-sheet-id-ris";

  // Reset the spy call history between tests
  mockSheetsGet.mockReset();

  // Wipe the in-memory cache so each test starts fresh
  bustCrmStatsCache();
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("CRM stats cache-bust after website enquiry", () => {
  it("caches the result so a second call within the TTL skips the Sheets API", async () => {
    mockSheetsGet.mockResolvedValue(makeFakeSheetResponse(3));

    // First call: cache miss → Sheets API called once
    const first = await readCrmLeadsTrackerStats("RIS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(1);
    expect(first.kpis.totalLeads).toBe(3);

    // Second call: cache hit → Sheets API NOT called again
    const second = await readCrmLeadsTrackerStats("RIS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(1); // still 1, no new call
    expect(second.kpis.totalLeads).toBe(3);
  });

  it("bustCrmStatsCache forces a fresh fetch on the next readCrmLeadsTrackerStats call", async () => {
    // First response: 3 leads (represents the "before enquiry" state)
    // Second response: 4 leads (represents the "after enquiry was appended" state)
    mockSheetsGet
      .mockResolvedValueOnce(makeFakeSheetResponse(3))
      .mockResolvedValueOnce(makeFakeSheetResponse(4));

    // Warm the cache
    const before = await readCrmLeadsTrackerStats("RIS");
    expect(before.kpis.totalLeads).toBe(3);
    expect(mockSheetsGet).toHaveBeenCalledTimes(1);

    // Simulate what /api/inquiries does after appendEnquiryToCrmLeadsTracker resolves
    bustCrmStatsCache("RIS");

    // Next call must NOT serve the stale cached value; it must re-fetch
    const after = await readCrmLeadsTrackerStats("RIS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(2); // second Sheets API call made
    expect(after.kpis.totalLeads).toBe(4);          // fresh data returned
  });

  it("bustCrmStatsCache for RIS does not invalidate the RPS cache entry", async () => {
    // Provide a sheet ID for RPS too
    process.env.RPS_WALKIN_SHEET_ID_2728 = "test-sheet-id-rps";

    mockSheetsGet.mockResolvedValue(makeFakeSheetResponse(5));

    // Warm both brand caches
    await readCrmLeadsTrackerStats("RIS");
    await readCrmLeadsTrackerStats("RPS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(2);

    // Bust only RIS
    bustCrmStatsCache("RIS");

    // RPS should still be cached → no new Sheets call
    await readCrmLeadsTrackerStats("RPS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(2); // unchanged

    // RIS should make a fresh call
    await readCrmLeadsTrackerStats("RIS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(3); // +1 for the fresh RIS fetch
  });

  it("bustCrmStatsCache with no argument clears all brand caches", async () => {
    process.env.RPS_WALKIN_SHEET_ID_2728 = "test-sheet-id-rps";

    mockSheetsGet.mockResolvedValue(makeFakeSheetResponse(2));

    // Warm both
    await readCrmLeadsTrackerStats("RIS");
    await readCrmLeadsTrackerStats("RPS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(2);

    // Bust all
    bustCrmStatsCache();

    // Both should re-fetch
    await readCrmLeadsTrackerStats("RIS");
    await readCrmLeadsTrackerStats("RPS");
    expect(mockSheetsGet).toHaveBeenCalledTimes(4);
  });

  it("returns fresh data after bust even when called back-to-back (no in-flight coalescing issue)", async () => {
    mockSheetsGet
      .mockResolvedValueOnce(makeFakeSheetResponse(6))
      .mockResolvedValueOnce(makeFakeSheetResponse(7));

    // Call 1: populates cache
    await readCrmLeadsTrackerStats("RIS");

    // Bust (as the inquiries route does)
    bustCrmStatsCache("RIS");

    // Call 2 immediately after bust — must trigger a real fetch
    const result = await readCrmLeadsTrackerStats("RIS");
    expect(result.kpis.totalLeads).toBe(7);
    expect(mockSheetsGet).toHaveBeenCalledTimes(2);
  });
});
