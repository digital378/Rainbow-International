/**
 * Integration tests: inactive counsellors must not appear on the kiosk form.
 *
 * Strategy
 * --------
 * We start a real Express app (with registerWalkinRoutes) on an ephemeral port,
 * mock the `db` module, and hit the routes with Node's built-in fetch.
 *
 * The critical design choice: the mock DB always holds BOTH active and inactive
 * staff. For each query it receives the Drizzle `where(...)` condition the route
 * built; a helper inspects the condition's queryChunks to detect whether an
 * `isActive = true` filter was requested, then applies that filter itself.
 *
 * This means: if the route stops passing the isActive filter, the mock returns
 * ALL staff and the "deactivated counsellor is absent" assertion fails — i.e.
 * the test genuinely catches the regression it was written to prevent.
 *
 * Scenario
 * ─────────
 * 1. GET /api/walkin/lookups (no token, kiosk) — inactive counsellor absent,
 *    active counsellor present.
 * 2. GET /api/walkin/lookups?includeInactive=true (admin) — both appear,
 *    confirming the admin path is not accidentally broken.
 * 3. PATCH /api/walkin/staff/:id sets isActive=false (admin only).
 * 4. PATCH /api/walkin/staff/:id is rejected without an admin token (401).
 * 5. Full stateful flow: create → deactivate → kiosk lookups excludes the
 *    deactivated counsellor.
 */

import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import type { AddressInfo } from "net";

// ── Hoist mock refs ────────────────────────────────────────────────────────────
const { mockDbSelect, mockDbUpdate, mockDbInsert, mockDbExecute, mockDbTransaction } = vi.hoisted(
  () => ({
    mockDbSelect: vi.fn(),
    mockDbUpdate: vi.fn(),
    mockDbInsert: vi.fn(),
    mockDbExecute: vi.fn(),
    mockDbTransaction: vi.fn(),
  }),
);

// ── Mock the DB ────────────────────────────────────────────────────────────────
vi.mock("../server/db", () => ({
  db: {
    select: mockDbSelect,
    update: mockDbUpdate,
    insert: mockDbInsert,
    execute: mockDbExecute,
    transaction: mockDbTransaction,
  },
}));

// ── Mock googleapis (walkinRoutes imports walkinSheets which needs it) ─────────
vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: class OAuth2 {
        setCredentials(_: object) {}
      },
    },
    sheets: vi.fn().mockReturnValue({
      spreadsheets: {
        get: vi.fn().mockResolvedValue({ data: { sheets: [] } }),
        values: {
          get: vi.fn().mockResolvedValue({ data: { values: [] } }),
          update: vi.fn().mockResolvedValue({}),
          append: vi.fn().mockResolvedValue({}),
          batchUpdate: vi.fn().mockResolvedValue({}),
        },
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    }),
  },
}));

// ── Mock walkinSheets fire-and-forget helpers ──────────────────────────────────
vi.mock("../server/walkinSheets", async () => {
  const actual =
    await vi.importActual<typeof import("../server/walkinSheets")>(
      "../server/walkinSheets",
    );
  return {
    ...actual,
    queueUpsert: vi.fn(),
    queueRemove: vi.fn(),
    resyncBrandToSheet: vi.fn().mockResolvedValue(undefined),
    resyncMasterSheet: vi.fn().mockResolvedValue(undefined),
    getSyncStatus: vi.fn().mockReturnValue({ lastSync: null, pending: 0 }),
    startAutoPull: vi.fn(),
    getPullLog: vi.fn().mockReturnValue([]),
    pullChangesFromSheet: vi.fn().mockResolvedValue({ changesApplied: 0, errors: [] }),
    pullChangesFromMasterSheet: vi.fn().mockResolvedValue({ changesApplied: 0, errors: [] }),
  };
});

// ── Import route registration AFTER mocks ─────────────────────────────────────
import { registerWalkinRoutes } from "../server/walkinRoutes";
import { queueUpsert } from "../server/walkinSheets";
import { walkinLeads } from "../shared/schema";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const ACTIVE_COUNSELLOR = {
  id: 1, name: "Alice Active", brand: "RIS", branchId: null,
  isActive: true, sortOrder: 0,
  createdAt: new Date(), updatedAt: new Date(),
};

const INACTIVE_COUNSELLOR = {
  id: 2, name: "Bob Inactive", brand: "RIS", branchId: null,
  isActive: false, sortOrder: 1,
  createdAt: new Date(), updatedAt: new Date(),
};

/** All counsellors that live in the "database". */
const ALL_STAFF = [ACTIVE_COUNSELLOR, INACTIVE_COUNSELLOR];

// ── Drizzle condition inspector ────────────────────────────────────────────────
//
// Drizzle builds WHERE conditions as a tree of SQL chunks.  Each chunk is
// either a raw string wrapper ({ value: [string] }) or a column descriptor
// ({ name: 'column_name', ... }) or a bound parameter ({ value: scalar }).
//
// For  eq(walkinStaff.isActive, true)  the chunk sequence is:
//   [0] { value: [''] }          — opening paren
//   [1] { name: 'is_active', … } — column
//   [2] { value: [' = '] }       — operator
//   [3] { value: true, … }       — bound parameter
//   [4] { value: [''] }          — closing paren
//
// and() nests conditions by embedding their queryChunks inline.
// We flatten the whole tree and scan for the pattern above.

type DrizzleChunk = { name?: string; value?: unknown; queryChunks?: DrizzleChunk[] };

function flattenChunks(condition: DrizzleChunk | undefined): DrizzleChunk[] {
  if (!condition?.queryChunks) return [];
  const out: DrizzleChunk[] = [];
  for (const chunk of condition.queryChunks) {
    if (chunk?.queryChunks) {
      out.push(...flattenChunks(chunk));
    } else {
      out.push(chunk);
    }
  }
  return out;
}

/**
 * Returns true/false if the condition contains  is_active = <bool>,
 * or undefined if no is_active filter is present at all.
 */
function extractIsActiveFilter(condition: DrizzleChunk | undefined): boolean | undefined {
  const chunks = flattenChunks(condition);
  for (let i = 0; i < chunks.length - 2; i++) {
    if (chunks[i]?.name === "is_active") {
      const valChunk = chunks[i + 2];
      if (valChunk !== undefined && typeof valChunk.value !== "undefined") {
        return valChunk.value === true;
      }
    }
  }
  return undefined;
}

// ── Smart lookup mock ──────────────────────────────────────────────────────────
//
// GET /api/walkin/lookups fires 6 queries in a Promise.all in this order:
//   0 walkinPrograms, 1 walkinSources, 2 walkinStatuses, 3 walkinCloseReasons,
//   4 walkinStaff, 5 walkinBranches
//
// For the staff query (index 4) we inspect the WHERE condition and filter
// ALL_STAFF accordingly.  Every other query returns [].
//
// IMPORTANT: if the route ever stops passing the isActive filter, the mock
// returns ALL_STAFF (both active AND inactive) and any "absent" assertion fails.

function wireLookupsDb(staffOverride?: typeof ACTIVE_COUNSELLOR[]) {
  let callCount = 0;
  mockDbSelect.mockImplementation(() => {
    const idx = callCount++;
    const isStaffQuery = idx === 4;

    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockImplementation((condition: DrizzleChunk) => {
          return {
            orderBy: vi.fn().mockImplementation(() => {
              if (!isStaffQuery) return Promise.resolve([]);
              if (staffOverride) return Promise.resolve(staffOverride);
              // Apply filter derived from what the route actually passed
              const activeFilter = extractIsActiveFilter(condition);
              if (activeFilter === true)  return Promise.resolve(ALL_STAFF.filter((s) => s.isActive));
              if (activeFilter === false) return Promise.resolve(ALL_STAFF.filter((s) => !s.isActive));
              return Promise.resolve(ALL_STAFF); // no isActive filter → return all
            }),
          };
        }),
        // Some queries don't call .where(); handle .orderBy() directly too
        orderBy: vi.fn().mockResolvedValue([]),
      }),
    };
  });
}

// ── Express test server ────────────────────────────────────────────────────────

const testApp = express();
testApp.use(express.json());
registerWalkinRoutes(testApp);

let baseUrl: string;
let server: ReturnType<typeof testApp.listen>;

beforeAll(async () => {
  process.env.ADMIN_TOKEN = "test-admin-token";
  await new Promise<void>((resolve) => {
    server = testApp.listen(0, "127.0.0.1", () => {
      const port = (server.address() as AddressInfo).port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  delete process.env.ADMIN_TOKEN;
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Inactive counsellors hidden from the kiosk form", () => {

  // ── Core filtering behaviour ───────────────────────────────────────────────

  it("kiosk GET /api/walkin/lookups (no token) excludes inactive counsellors", async () => {
    // DB holds BOTH active and inactive staff; the route must filter them.
    wireLookupsDb();

    const res = await fetch(`${baseUrl}/api/walkin/lookups`);
    expect(res.status).toBe(200);

    const body = await res.json() as { staff: Array<{ name: string }> };
    const names = body.staff.map((s) => s.name);

    expect(names).not.toContain("Bob Inactive");
    expect(names).toContain("Alice Active");
  });

  it("admin GET /api/walkin/lookups?includeInactive=true returns both active and inactive", async () => {
    // DB holds both; admin route must NOT apply the isActive filter.
    wireLookupsDb();

    const res = await fetch(
      `${baseUrl}/api/walkin/lookups?includeInactive=true`,
      { headers: { "x-api-key": "test-admin-token" } },
    );
    expect(res.status).toBe(200);

    const body = await res.json() as { staff: Array<{ name: string }> };
    const names = body.staff.map((s) => s.name);

    expect(names).toContain("Alice Active");
    expect(names).toContain("Bob Inactive");
  });

  // ── PATCH endpoint ─────────────────────────────────────────────────────────

  it("PATCH /api/walkin/staff/:id sets isActive=false (admin token required)", async () => {
    mockDbUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ ...INACTIVE_COUNSELLOR }]),
        }),
      }),
    });

    const res = await fetch(`${baseUrl}/api/walkin/staff/2`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-admin-token",
      },
      body: JSON.stringify({ isActive: false }),
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { isActive: boolean };
    expect(body.isActive).toBe(false);
  });

  it("PATCH /api/walkin/staff/:id is rejected without admin token (kiosk cannot deactivate)", async () => {
    const res = await fetch(`${baseUrl}/api/walkin/staff/1`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    expect(res.status).toBe(401);
  });

  // ── Full stateful flow ─────────────────────────────────────────────────────

  it("full flow: create → deactivate → kiosk lookups excludes the deactivated counsellor", async () => {
    // ── Step 1: create ───────────────────────────────────────────────────────
    const newStaff = {
      id: 3, name: "Carol Created", brand: "RIS", branchId: null,
      isActive: true, sortOrder: 0,
      createdAt: new Date(), updatedAt: new Date(),
    };
    mockDbInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([newStaff]),
      }),
    });

    const createRes = await fetch(`${baseUrl}/api/walkin/staff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-admin-token",
      },
      body: JSON.stringify({ name: "Carol Created", brand: "RIS" }),
    });
    expect(createRes.status).toBe(201);
    const created = await createRes.json() as { id: number; isActive: boolean };
    expect(created.isActive).toBe(true);

    // ── Step 2: deactivate ───────────────────────────────────────────────────
    const deactivatedStaff = { ...newStaff, isActive: false };
    mockDbUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([deactivatedStaff]),
        }),
      }),
    });

    const patchRes = await fetch(`${baseUrl}/api/walkin/staff/${created.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "test-admin-token",
      },
      body: JSON.stringify({ isActive: false }),
    });
    expect(patchRes.status).toBe(200);
    const patched = await patchRes.json() as { isActive: boolean };
    expect(patched.isActive).toBe(false);

    // ── Step 3: kiosk lookups — Carol must not appear ─────────────────────────
    // The "database" now contains Alice (active), Bob (inactive), and Carol
    // (just deactivated).  wireLookupsDb() with no override lets the smart mock
    // apply the isActive filter from the route's WHERE clause.
    const allThree = [ACTIVE_COUNSELLOR, INACTIVE_COUNSELLOR, deactivatedStaff];
    let staffCallCount = 0;
    mockDbSelect.mockImplementation(() => {
      const idx = staffCallCount++;
      const isStaffQuery = idx === 4;
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockImplementation((condition: DrizzleChunk) => ({
            orderBy: vi.fn().mockImplementation(() => {
              if (!isStaffQuery) return Promise.resolve([]);
              const activeFilter = extractIsActiveFilter(condition);
              if (activeFilter === true) return Promise.resolve(allThree.filter((s) => s.isActive));
              if (activeFilter === false) return Promise.resolve(allThree.filter((s) => !s.isActive));
              return Promise.resolve(allThree);
            }),
          })),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      };
    });

    const lookupsRes = await fetch(`${baseUrl}/api/walkin/lookups`);
    expect(lookupsRes.status).toBe(200);

    const lookups = await lookupsRes.json() as { staff: Array<{ name: string }> };
    const names = lookups.staff.map((s) => s.name);

    expect(names).not.toContain("Carol Created");   // just deactivated
    expect(names).not.toContain("Bob Inactive");    // was already inactive
    expect(names).toContain("Alice Active");        // still active
  });
});

describe("2027–28 contact checks block repeat walk-ins", () => {
  const father = "9000000011";
  const mother = "9000000022";
  const payload = {
    brand: "RPS", academicYear: "2027-28", enquiryDate: "2026-09-20",
    parentName: "Test Father", motherName: "Test Mother", childName: "Test Child",
    phone: father, altPhone: mother, program: "Nursery", source: "Walk-in",
  };

  function selectResults(rows: Array<{ id: string }>) {
    mockDbSelect.mockImplementation(() => ({
      from: () => ({ where: () => ({ orderBy: () => ({ limit: async () => rows }) }) }),
    }));
  }

  it("returns only a boolean from the public lookup, including cross-school matches", async () => {
    selectResults([{ id: "private-existing-lead-id" }]);
    const res = await fetch(`${baseUrl}/api/walkin/leads/check-duplicate?phone=${father}&altPhone=${mother}&ay=2027-28`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ duplicate: true });
  });

  it("rejects a repeat at save time without inserting or revealing the matched record", async () => {
    selectResults([{ id: "private-existing-lead-id" }]);
    mockDbTransaction.mockImplementation(async (cb) => cb({
      execute: vi.fn().mockResolvedValue({ rows: [] }),
      select: mockDbSelect,
      insert: mockDbInsert,
    }));

    const res = await fetch(`${baseUrl}/api/walkin/leads`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.duplicate).toBe(true);
    expect(JSON.stringify(body)).not.toContain("private-existing-lead-id");
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it("saves all siblings in one transaction without self-blocking", async () => {
    selectResults([]);
    const storedChildren: string[] = [];
    const txInsert = vi.fn((table) => ({
      values: (values: { childName?: string }) => {
        if (table !== walkinLeads) return Promise.resolve();
        storedChildren.push(values.childName!);
        return { returning: async () => [{ ...values, id: `test-${storedChildren.length}` }] };
      },
    }));
    mockDbTransaction.mockImplementation(async (cb) => cb({
      execute: vi.fn().mockResolvedValue({ rows: [{ brandSeqNum: "1" }] }),
      select: mockDbSelect,
      insert: txInsert,
    }));

    const res = await fetch(`${baseUrl}/api/walkin/leads`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, siblings: [{ name: "Test Sibling", program: "KG" }] }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.siblings).toHaveLength(1);
    expect(storedChildren).toEqual(["Test Child", "Test Sibling"]);
    expect(queueUpsert).toHaveBeenCalledTimes(2);
  });
});

describe("the original enquiry Source survives walk-in updates", () => {
  const lead = {
    id: "existing-lead", brand: "RIS", parentName: "Test Parent",
    childName: "Test Child", source: "DM", status: "OPEN",
    isArchived: false, walkInDate: null, closeReason: null,
  };

  beforeEach(() => {
    mockDbSelect.mockImplementation(() => ({
      from: () => ({ where: async () => [lead] }),
    }));
  });

  it("rejects a new Source even when the request also records the walk-in", async () => {
    const res = await fetch(`${baseUrl}/api/walkin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-api-key": "test-admin-token" },
      body: JSON.stringify({
        source: "Referral", status: "WALK-IN COMPLETED", walkInDate: "2026-09-29",
      }),
    });
    expect(res.status).toBe(409);
    expect((await res.json()).message).toContain("locked");
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it("accepts a walk-in update with unchanged legacy Source but never writes Source", async () => {
    const set = vi.fn((patch) => ({
      where: () => ({ returning: async () => [{ ...lead, ...patch }] }),
    }));
    mockDbUpdate.mockReturnValue({ set });
    mockDbInsert.mockReturnValue({ values: vi.fn().mockResolvedValue([]) });
    const res = await fetch(`${baseUrl}/api/walkin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-api-key": "test-admin-token" },
      body: JSON.stringify({
        source: "DM", status: "WALK-IN COMPLETED", walkInDate: "2026-09-29",
      }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).source).toBe("DM");
    expect(set).toHaveBeenCalledOnce();
    expect(set.mock.calls[0][0]).not.toHaveProperty("source");
  });
});
