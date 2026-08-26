/**
 * Route-level integration test: /api/callback-requests uses an atomic DB
 * transaction to insert into callback_requests and walkin_leads together,
 * then calls bustCrmStatsCache("RIS") and returns 201.
 *
 * Confirms that:
 *   1. A POST to /api/callback-requests returns 201 and the saved callback body.
 *   2. The transaction is committed before 201 is returned; by the time the
 *      caller receives 201, bustCrmStatsCache has already fired so the next
 *      readCrmLeadsTrackerStats call re-queries the DB with the new row.
 *   3. The walkin_leads insert inside the transaction is called with the
 *      caller's name, phone, brand "RIS", source "Website", and program
 *      "Callback Request".
 *   4. If the transaction fails (e.g. walkin_leads insert rejects), the route
 *      returns 500, the transaction is rolled back atomically (no partial state),
 *      and bustCrmStatsCache is NOT called (cache stays warm).
 *
 * All external I/O (Google Sheets, DB, email, SSR routes) is mocked.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import nodemailer from "nodemailer";
import express from "express";
import { createServer } from "node:http";

// ── Hoist spies so they are available inside vi.mock() factories ──────────────
const mockSheetsAppend = vi.hoisted(() => vi.fn());
const mockSheetsGet    = vi.hoisted(() => vi.fn());
const mockGoogleGetToken = vi.hoisted(() => vi.fn().mockResolvedValue({ tokens: {} }));
const mockStoreGoogleRefreshToken = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

// DB select chain (used by readCrmLeadsTrackerStats)
const mockDbWhere  = vi.hoisted(() => vi.fn());
const mockDbFrom   = vi.hoisted(() => vi.fn(() => ({ where: mockDbWhere })));
const mockDbSelect = vi.hoisted(() => vi.fn(() => ({ from: mockDbFrom })));

// ── Transaction insert mocks ──────────────────────────────────────────────────
// callback_requests insert: tx.insert(callbackRequests).values(...).returning()
const mockTxCallbackReturning = vi.hoisted(() =>
  vi.fn().mockResolvedValue([
    { id: 42, name: "Test Parent", phone: "9876543210", preferredTime: "Morning" },
  ])
);
const mockTxCallbackValues = vi.hoisted(() =>
  vi.fn(() => ({ returning: mockTxCallbackReturning }))
);

// walkin_leads insert: tx.insert(walkinLeads).values(...)
const mockTxWalkinValues = vi.hoisted(() => vi.fn().mockResolvedValue([]));

/**
 * Dispatch insert mock by table: walkinLeads mock has a `monthLabel` property;
 * callbackRequests mock does not.
 */
const mockDbInsert = vi.hoisted(() =>
  vi.fn((table: Record<string, unknown>) => {
    if (table && "monthLabel" in table) {
      return { values: mockTxWalkinValues };
    }
    return { values: mockTxCallbackValues };
  })
);

/**
 * db.transaction mock: passes a tx object (with insert) into the callback.
 * The callback's return value or thrown error propagates normally.
 */
const mockDbTransaction = vi.hoisted(() =>
  vi.fn(async (fn: (tx: { insert: typeof mockDbInsert }) => Promise<unknown>) =>
    fn({ insert: mockDbInsert })
  )
);

// Must use a regular function so it works as `new google.auth.OAuth2(...)`.
const mockOAuth2Constructor = vi.hoisted(() =>
  vi.fn(function (this: Record<string, unknown>) {
    this.setCredentials  = vi.fn();
    this.generateAuthUrl = vi.fn().mockReturnValue("https://accounts.google.com/o/oauth2/auth");
    this.getToken        = mockGoogleGetToken;
    this.credentials     = {};
    this.on              = vi.fn();
    this.request         = vi.fn().mockResolvedValue({ data: {} });
  })
);

// ── Module mocks ─────────────────────────────────────────────────────────────
vi.mock("googleapis", () => ({
  google: {
    auth:   { OAuth2: mockOAuth2Constructor },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        values: { get: mockSheetsGet, append: mockSheetsAppend },
      },
    }),
  },
}));

vi.mock("../server/db", () => ({
  db: {
    select:      mockDbSelect,
    insert:      mockDbInsert,
    transaction: mockDbTransaction,
  },
}));

vi.mock("../server/googleCredentials", () => ({
  getGoogleRefreshToken: () => process.env.GOOGLE_REFRESH_TOKEN || null,
  storeGoogleRefreshToken: mockStoreGoogleRefreshToken,
  googleOAuthSuccessPage: () => "<html><body>Google connected safely</body></html>",
}));

vi.mock("../shared/schema", () => ({
  // walkinLeads must have a `monthLabel` key so the insert dispatch works
  walkinLeads: {
    monthLabel:   "monthLabel",
    status:       "status",
    source:       "source",
    leadOwner:    "leadOwner",
    program:      "program",
    branchId:     "branchId",
    brand:        "brand",
    academicYear: "academicYear",
    isArchived:   "isArchived",
  },
  // callbackRequests must NOT have a `monthLabel` key
  callbackRequests: { name: "name", phone: "phone", preferredTime: "preferred_time" },
  walkinBranches:      {},
  walkinLeadAuditLog:  {},
  walkinStatuses:      {},
  walkinCloseReasons:  {},
  walkinPrograms:      {},
  walkinSources:       {},
  walkinStaff:         {},
  insertCallbackRequestSchema: { parse: (d: unknown) => d },
  insertInquirySchema:         { parse: (d: unknown) => d },
  insertEventSchema:           { parse: (d: unknown) => d },
  insertCareerApplicationSchema: { parse: (d: unknown) => d },
  insertBrochureRequestSchema:  { parse: (d: unknown) => d },
  insertRaSchema:              { parse: (d: unknown) => d },
  insertFriendshipSchoolSchema: { parse: (d: unknown) => d },
  insertFriendshipLeadSchema:  { parse: (d: unknown) => d },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(), and: vi.fn(), or: vi.fn(), isNull: vi.fn(), sql: vi.fn(),
}));

vi.mock("../server/storage", () => ({
  storage: {
    getAllBlogSlugs:            vi.fn().mockResolvedValue([]),
    getAllCallbackRequests:     vi.fn().mockResolvedValue([]),
    getAllInquiries:            vi.fn().mockResolvedValue([]),
    createInquiry:             vi.fn().mockResolvedValue({ id: 1 }),
    getAllBlogPosts:            vi.fn().mockResolvedValue([]),
    getBlogPostBySlug:          vi.fn().mockResolvedValue(null),
    getAllEvents:               vi.fn().mockResolvedValue([]),
    createEvent:               vi.fn().mockResolvedValue({ id: 1 }),
    createCareerApplication:   vi.fn().mockResolvedValue({ id: 1 }),
    createBrochureRequest:     vi.fn().mockResolvedValue({ id: 1 }),
    createRa:                  vi.fn().mockResolvedValue({ id: 1 }),
    getAllFriendshipSchools:    vi.fn().mockResolvedValue([]),
    createFriendshipSchool:    vi.fn().mockResolvedValue({ id: 1 }),
    getAllFriendshipLeads:      vi.fn().mockResolvedValue([]),
    createFriendshipLead:      vi.fn().mockResolvedValue({ id: 1 }),
    getFriendshipLeadsBySchool: vi.fn().mockResolvedValue([]),
    updateFriendshipLead:      vi.fn().mockResolvedValue({ id: 1 }),
    deleteFriendshipLead:      vi.fn().mockResolvedValue(undefined),
    getFriendshipSchoolByCode:  vi.fn().mockResolvedValue(null),
  },
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({}),
    }),
  },
}));

vi.mock("../server/ssrBlog",           () => ({ registerSSRRoutes:        vi.fn() }));
vi.mock("../server/ssrHome",           () => ({ registerHomeSSR:           vi.fn() }));
vi.mock("../server/ssrPages",          () => ({ registerPageSSR:           vi.fn() }));
vi.mock("../server/ssrSpainArgentina", () => ({ registerSpainArgentinaSSR: vi.fn() }));
vi.mock("../server/seoMonitor",        () => ({ runAndAlert:               vi.fn() }));
vi.mock("../server/walkinRoutes",      () => ({ registerWalkinRoutes:      vi.fn() }));
vi.mock("../server/openapiSpec",       () => ({ OPENAPI_YAML:              "" }));
vi.mock("../server/mcpGateway",        () => ({ registerMcpGateway:        vi.fn() }));

// ── Import after all mocks are in place ──────────────────────────────────────
import { readCrmLeadsTrackerStats, bustCrmStatsCache } from "../server/walkinSheets";
import { registerRoutes } from "../server/routes";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDbRows(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    monthLabel:  "Jul-27",
    status:      "OPEN",
    source:      "Walk-In",
    leadOwner:   `Owner ${i + 1}`,
    program:     "Class 1",
    branchId:    1,
  }));
}

// ── Test setup ────────────────────────────────────────────────────────────────
let serverUrl = "";
let httpServer: ReturnType<typeof createServer>;

beforeEach(async () => {
  process.env.GOOGLE_REFRESH_TOKEN      = "test-refresh-token";
  process.env.GOOGLE_CLIENT_ID          = "test-client-id";
  process.env.GOOGLE_CLIENT_SECRET      = "test-client-secret";
  process.env.RIS_WALKIN_SHEET_ID_2728  = "test-sheet-id-ris";

  mockSheetsAppend.mockReset();
  mockSheetsGet.mockReset();
  mockSheetsAppend.mockResolvedValue({});
  mockGoogleGetToken.mockReset();
  mockGoogleGetToken.mockResolvedValue({ tokens: {} });
  mockStoreGoogleRefreshToken.mockReset();
  mockStoreGoogleRefreshToken.mockResolvedValue(undefined);

  mockDbWhere.mockReset();
  mockDbSelect.mockImplementation(() => ({ from: mockDbFrom }));
  mockDbFrom.mockImplementation(() => ({ where: mockDbWhere }));

  mockDbInsert.mockClear();
  mockTxCallbackValues.mockClear();
  mockTxCallbackReturning.mockReset();
  mockTxCallbackReturning.mockResolvedValue([
    { id: 42, name: "Test Parent", phone: "9876543210", preferredTime: "Morning" },
  ]);
  mockTxWalkinValues.mockReset();
  mockTxWalkinValues.mockResolvedValue([]);
  mockDbTransaction.mockClear();

  bustCrmStatsCache();

  const app = express();
  app.use(express.json());
  httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const addr = httpServer.address() as { port: number };
  serverUrl = `http://127.0.0.1:${addr.port}`;
});

afterEach(async () => {
  delete process.env.DESTINATION_READ_ONLY;
  await new Promise<void>((resolve, reject) =>
    httpServer.close((err) => (err ? reject(err) : resolve()))
  );
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("/api/callback-requests: atomic transaction then CRM stats cache bust", () => {
  it("does not create an SMTP transport when destination read-only mode is enabled", async () => {
    process.env.DESTINATION_READ_ONLY = "true";

    const res = await fetch(`${serverUrl}/api/callback-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Preview Parent", phone: "9123456789", preferredTime: "Morning" }),
    });

    expect(res.status).toBe(201);
    expect(vi.mocked(nodemailer.createTransport)).not.toHaveBeenCalled();
    expect(mockSheetsAppend).not.toHaveBeenCalled();
  });

  it("POST returns 201 and the saved callback request body", async () => {
    mockDbWhere.mockResolvedValue(makeDbRows(0));

    const res = await fetch(`${serverUrl}/api/callback-requests`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: "Test Parent", phone: "9876543210", preferredTime: "Morning" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json() as { id: number };
    expect(body.id).toBe(42);
  });

  it("cache is busted by the time 201 arrives — immediate stats read re-queries the DB", async () => {
    // Warm the cache with 3 leads (state before the callback request)
    mockDbWhere.mockResolvedValueOnce(makeDbRows(3));
    const before = await readCrmLeadsTrackerStats("RIS");
    expect(before.kpis.totalLeads).toBe(3);
    expect(mockDbWhere).toHaveBeenCalledTimes(1);

    // After the transaction the DB now has 4 leads (new walkin_leads row)
    mockDbWhere.mockResolvedValueOnce(makeDbRows(4));

    // Transaction commits → bustCrmStatsCache fires → 201 sent
    const res = await fetch(`${serverUrl}/api/callback-requests`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: "New Parent", phone: "9123456789", preferredTime: "Afternoon" }),
    });
    expect(res.status).toBe(201);

    // No timeout needed: transaction and bust happen before 201 is sent.
    // An immediate stats read must trigger a fresh DB query.
    const after = await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(2); // fresh DB query made
    expect(after.kpis.totalLeads).toBe(4);        // updated total returned
  });

  it("walkin_leads insert is called inside the transaction with the correct fields", async () => {
    mockDbWhere.mockResolvedValue(makeDbRows(0));

    await fetch(`${serverUrl}/api/callback-requests`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: "Sneha Kulkarni", phone: "9876100200", preferredTime: "Morning" }),
    });

    // The transaction was called
    expect(mockDbTransaction).toHaveBeenCalledTimes(1);

    // walkin_leads values — mockTxWalkinValues is the spy for tx.insert(walkinLeads).values(...)
    expect(mockTxWalkinValues).toHaveBeenCalledTimes(1);
    const walkinArg = mockTxWalkinValues.mock.calls[0]?.[0] as Record<string, string>;
    expect(walkinArg).toBeDefined();
    expect(walkinArg.parentName).toBe("Sneha Kulkarni");
    expect(walkinArg.phone).toBe("9876100200");
    expect(walkinArg.brand).toBe("RIS");
    expect(walkinArg.academicYear).toBe("2027-28");
    expect(walkinArg.source).toBe("Website");
    expect(walkinArg.program).toBe("Callback Request");
    expect(walkinArg.createdBy).toBe("website");

    // callback_requests insert was also made (atomically, inside the same tx)
    expect(mockTxCallbackValues).toHaveBeenCalledTimes(1);
  });

  it("returns 500 and does NOT bust the cache when the transaction fails", async () => {
    // Warm the cache: 5 leads
    mockDbWhere.mockResolvedValueOnce(makeDbRows(5));
    const before = await readCrmLeadsTrackerStats("RIS");
    expect(before.kpis.totalLeads).toBe(5);
    expect(mockDbWhere).toHaveBeenCalledTimes(1);

    // Simulate the walkin_leads insert failing inside the transaction
    // (both inserts are rolled back atomically)
    mockTxWalkinValues.mockRejectedValueOnce(new Error("DB constraint violation"));

    const res = await fetch(`${serverUrl}/api/callback-requests`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: "Error Parent", phone: "9000000001", preferredTime: "Evening" }),
    });

    // Route must surface the failure — the walkin_leads row was not created
    expect(res.status).toBe(500);

    // Cache was NOT busted — stale value served, no extra DB query
    const after = await readCrmLeadsTrackerStats("RIS");
    expect(mockDbWhere).toHaveBeenCalledTimes(1); // still 1
    expect(after.kpis.totalLeads).toBe(5);        // cached total unchanged
  });
});

describe("/auth/google/callback: refresh-token redaction", () => {
  it("stores a new refresh token server-side without returning it in HTML", async () => {
    const refreshToken = "refresh-token-that-must-never-reach-the-browser";
    const state = "valid-oauth-state";
    mockGoogleGetToken.mockResolvedValueOnce({ tokens: { refresh_token: refreshToken } });

    const res = await fetch(`${serverUrl}/auth/google/callback?code=valid-code&state=${state}`, {
      headers: { Cookie: `oauth_state=${state}` },
    });
    const html = await res.text();

    expect(res.status).toBe(200);
    expect(mockStoreGoogleRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(html).not.toContain(refreshToken);
    expect(html).not.toContain("Copy the refresh token");
    expect(html).toContain("Google connected safely");
  });
});
