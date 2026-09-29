import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "net";

const { mockSelect, mockUpdate, mockInsert } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockUpdate: vi.fn(),
  mockInsert: vi.fn(),
}));

vi.mock("../server/db", () => ({
  db: { select: mockSelect, update: mockUpdate, insert: mockInsert, execute: vi.fn() },
}));

vi.mock("../server/walkinSheets", () => ({
  queueUpsert: vi.fn(),
  queueRemove: vi.fn(),
  resyncBrandToSheet: vi.fn().mockResolvedValue(undefined),
  resyncMasterSheet: vi.fn().mockResolvedValue(undefined),
  resyncArchivedLead: vi.fn().mockResolvedValue(undefined),
  removeLeadFromMasterSheet: vi.fn().mockResolvedValue(undefined),
  getSyncStatus: vi.fn().mockReturnValue({ lastSync: null, pending: 0 }),
  startAutoPull: vi.fn(),
  getPullLog: vi.fn().mockReturnValue([]),
  pullChangesFromSheet: vi.fn().mockResolvedValue({ changesApplied: 0, errors: [] }),
  pullChangesFromMasterSheet: vi.fn().mockResolvedValue({ changesApplied: 0, errors: [] }),
  readCrmLeadsTrackerStats: vi.fn().mockResolvedValue({}),
  bustCrmStatsCache: vi.fn(),
  syncDeletionsFromMaster: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../server/marketing2728Sheets", () => ({
  readMarketing2728Supplement: vi.fn().mockResolvedValue({ leads: [], walkins: [] }),
  supplementLeadKey: (lead: { enquiryDate: string; phone?: string; childName?: string }) =>
    `${lead.enquiryDate}|${lead.phone ?? ""}|${lead.childName ?? ""}`,
}));

import { registerWalkinRoutes } from "../server/walkinRoutes";
import { walkinLeads, walkinLeadAuditLog } from "../shared/schema";

type Chunk = { name?: string; value?: unknown; queryChunks?: Chunk[] };

function flatten(condition: Chunk | undefined): Chunk[] {
  if (!condition?.queryChunks) return [];
  return condition.queryChunks.flatMap((chunk) =>
    chunk.queryChunks ? flatten(chunk) : [chunk],
  );
}

function equalityValue(condition: Chunk | undefined, columnName: string): unknown {
  const chunks = flatten(condition);
  const index = chunks.findIndex((chunk) => chunk.name === columnName);
  if (index < 0) return undefined;
  return chunks.slice(index + 1, index + 4)
    .find((chunk) => Object.hasOwn(chunk, "value") && typeof chunk.value !== "object")
    ?.value;
}

const now = new Date("2026-09-29T10:00:00.000Z");
const leadFixtures = [
  {
    id: "ris-lead-1", brand: "RIS", branchId: 1, academicYear: "2027-28",
    enquiryDate: "2026-09-28", monthLabel: "Sep-26",
    parentName: "RIS Parent", childName: "RIS Child", phone: "9000000001",
    altPhone: "9000000002", email: null, program: "Grade 1", source: "Walk-in",
    status: "OPEN", closeReason: null, remark: "RIS note", leadOwner: null,
    walkInDate: null, admissionDate: null, revisitDate: null, revisitDate2: null,
    misCallingRemarks: null, isArchived: false, createdBy: "kiosk", updatedBy: null,
    createdAt: now, updatedAt: now,
  },
  {
    id: "rps-lead-1", brand: "RPS", branchId: 2, academicYear: "2027-28",
    enquiryDate: "2026-09-27", monthLabel: "Sep-26",
    parentName: "RPS Parent", childName: "RPS Child", phone: "9000000003",
    altPhone: "9000000004", email: null, program: "Nursery", source: "Referral",
    status: "OPEN", closeReason: null, remark: "RPS note", leadOwner: null,
    walkInDate: null, admissionDate: null, revisitDate: null, revisitDate2: null,
    misCallingRemarks: null, isArchived: false, createdBy: "kiosk", updatedBy: null,
    createdAt: now, updatedAt: now,
  },
];

const testApp = express();
testApp.use(express.json());
registerWalkinRoutes(testApp);

let baseUrl = "";
let server: ReturnType<typeof testApp.listen>;
let risToken = "";
let rpsToken = "";
let groupToken = "";

async function signIn(passcode: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/walkin/page-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope: "leads", passcode }),
  });
  expect(response.status).toBe(200);
  return (await response.json() as { token: string }).token;
}

function leadRowsFor(condition: Chunk | undefined) {
  const requestedBrand = equalityValue(condition, "brand");
  const requestedId = equalityValue(condition, "id");
  return leadFixtures.filter((lead) =>
    (requestedBrand === undefined || lead.brand === requestedBrand) &&
    (requestedId === undefined || lead.id === requestedId),
  );
}

function mockLeadQueries() {
  mockSelect.mockImplementation(() => ({
    from: (table: unknown) => ({
      where: (condition: Chunk | undefined) => {
        const rows = table === walkinLeads
          ? leadRowsFor(condition)
          : table === walkinLeadAuditLog
            ? []
            : [];
        const query = Promise.resolve(rows) as Promise<unknown[]> & {
          orderBy: () => Promise<unknown[]>;
          limit: () => Promise<unknown[]>;
        };
        query.orderBy = () => Promise.resolve(rows);
        query.limit = () => Promise.resolve(rows);
        return query;
      },
      orderBy: () => Promise.resolve([]),
    }),
  }));
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function get(path: string, token: string) {
  return fetch(`${baseUrl}${path}`, { headers: auth(token) });
}

beforeAll(async () => {
  process.env.SESSION_SECRET = "walkin-brand-access-test-session-secret";
  process.env.WALKIN_LEADS_PASSCODE = "test-group-leads-passcode";
  process.env.WALKIN_RIS_LEADS_PASSCODE = "test-ris-leads-passcode";
  process.env.WALKIN_RPS_LEADS_PASSCODE = "test-rps-leads-passcode";
  process.env.ADMIN_TOKEN = "test-master-admin-token";

  await new Promise<void>((resolve) => {
    server = testApp.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      resolve();
    });
  });

  [risToken, rpsToken, groupToken] = await Promise.all([
    signIn("test-ris-leads-passcode"),
    signIn("test-rps-leads-passcode"),
    signIn("test-group-leads-passcode"),
  ]);
});

afterAll(async () => {
  delete process.env.SESSION_SECRET;
  delete process.env.WALKIN_LEADS_PASSCODE;
  delete process.env.WALKIN_RIS_LEADS_PASSCODE;
  delete process.env.WALKIN_RPS_LEADS_PASSCODE;
  delete process.env.ADMIN_TOKEN;
  if (server) await new Promise<void>((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve()),
  );
});

beforeEach(() => {
  vi.clearAllMocks();
  mockLeadQueries();
});

describe("brand-scoped Leads access", () => {
  it("RIS sees only RIS list rows and cannot request/export RPS with a brand query", async () => {
    const list = await get("/api/walkin/leads", risToken);
    expect(list.status).toBe(200);
    const body = await list.json() as { leads: Array<{ brand: string; parentName: string }> };
    expect(body.leads.map((lead) => lead.brand)).toEqual(["RIS"]);
    expect(JSON.stringify(body)).not.toContain("RPS Parent");

    const listBypass = await get("/api/walkin/leads?brand=RPS", risToken);
    expect(listBypass.status).toBe(403);
    const exportBypass = await get("/api/walkin/leads/export?format=csv&brand=RPS", risToken);
    expect(exportBypass.status).toBe(403);
  });

  it("RPS cannot see RIS leads, including by setting brand=RIS", async () => {
    const list = await get("/api/walkin/leads", rpsToken);
    expect(list.status).toBe(200);
    const body = await list.json() as { leads: Array<{ brand: string; parentName: string }> };
    expect(body.leads.map((lead) => lead.brand)).toEqual(["RPS"]);
    expect(JSON.stringify(body)).not.toContain("RIS Parent");

    const bypass = await get("/api/walkin/leads?brand=RIS", rpsToken);
    expect(bypass.status).toBe(403);
  });

  it("RIS receives 403 for RPS detail, history, edit, and archive endpoints", async () => {
    expect((await get("/api/walkin/leads/rps-lead-1", risToken)).status).toBe(403);
    expect((await get("/api/walkin/leads/rps-lead-1/history", risToken)).status).toBe(403);

    const edit = await fetch(`${baseUrl}/api/walkin/leads/rps-lead-1`, {
      method: "PATCH",
      headers: { ...auth(risToken), "Content-Type": "application/json" },
      body: JSON.stringify({ remark: "cross-brand edit" }),
    });
    expect(edit.status).toBe(403);
    expect(mockUpdate).not.toHaveBeenCalled();

    const archive = await fetch(`${baseUrl}/api/walkin/leads/rps-lead-1/archive`, {
      method: "POST",
      headers: { ...auth(risToken), "Content-Type": "application/json" },
      body: JSON.stringify({ archivedBy: "RIS staff" }),
    });
    expect(archive.status).toBe(403);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("RPS receives 403 for RIS detail, history, edit, and archive endpoints", async () => {
    expect((await get("/api/walkin/leads/ris-lead-1", rpsToken)).status).toBe(403);
    expect((await get("/api/walkin/leads/ris-lead-1/history", rpsToken)).status).toBe(403);

    const edit = await fetch(`${baseUrl}/api/walkin/leads/ris-lead-1`, {
      method: "PATCH",
      headers: { ...auth(rpsToken), "Content-Type": "application/json" },
      body: JSON.stringify({ remark: "cross-brand edit" }),
    });
    expect(edit.status).toBe(403);

    const archive = await fetch(`${baseUrl}/api/walkin/leads/ris-lead-1/archive`, {
      method: "POST",
      headers: { ...auth(rpsToken), "Content-Type": "application/json" },
      body: JSON.stringify({ archivedBy: "RPS staff" }),
    });
    expect(archive.status).toBe(403);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("group admins can list, export, view, and read history for both brands", async () => {
    const list = await get("/api/walkin/leads", groupToken);
    expect(list.status).toBe(200);
    expect((await list.json() as { leads: Array<{ brand: string }> }).leads.map((lead) => lead.brand))
      .toEqual(["RIS", "RPS"]);

    const risDetail = await get("/api/walkin/leads/ris-lead-1", groupToken);
    expect(risDetail.status).toBe(200);
    expect((await risDetail.json() as { brand: string }).brand).toBe("RIS");
    const rpsHistory = await get("/api/walkin/leads/rps-lead-1/history", groupToken);
    expect(rpsHistory.status).toBe(200);

    const csvResponse = await get("/api/walkin/leads/export?format=csv", groupToken);
    expect(csvResponse.status).toBe(200);
    const csv = await csvResponse.text();
    expect(csv).toContain("RIS Parent");
    expect(csv).toContain("RPS Parent");
  });
});