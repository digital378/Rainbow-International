import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "net";

const { mockSelect, mockMarketingRead } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockMarketingRead: vi.fn(),
}));

vi.mock("../server/db", () => ({
  db: {
    select: mockSelect,
    update: vi.fn(),
    insert: vi.fn(),
    execute: vi.fn(),
  },
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
  readMarketing2728Supplement: mockMarketingRead,
  supplementLeadKey: (lead: { enquiryDate: string; phone?: string; childName?: string }) =>
    `${lead.enquiryDate}|${lead.phone ?? ""}|${lead.childName ?? ""}`,
}));

import { registerWalkinRoutes } from "../server/walkinRoutes";
import { createWalkinPageSession } from "../server/walkinPageAuth";
import { walkinLeads } from "../shared/schema";

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

const createdAt = new Date("2026-09-29T10:00:00.000Z");
const databaseLeads = [
  {
    id: "ris-branch-1", brand: "RIS", branchId: 1, academicYear: "2027-28",
    enquiryDate: "2026-09-25", monthLabel: "Sep-26",
    parentName: "RIS Branch One", childName: "RIS Student One",
    phone: "9000000001", altPhone: null, email: null, program: "Grade 1",
    source: "Walk-in", status: "OPEN", closeReason: null, remark: null,
    leadOwner: null, walkInDate: null, admissionDate: null, revisitDate: null,
    revisitDate2: null, misCallingRemarks: null, isArchived: false,
    createdBy: "kiosk", updatedBy: null, createdAt, updatedAt: createdAt,
  },
  {
    id: "ris-branch-2", brand: "RIS", branchId: 2, academicYear: "2027-28",
    enquiryDate: "2026-09-24", monthLabel: "Sep-26",
    parentName: "RIS Branch Two", childName: "RIS Student Two",
    phone: "9000000002", altPhone: null, email: null, program: "Grade 2",
    source: "Referral", status: "OPEN", closeReason: null, remark: null,
    leadOwner: null, walkInDate: null, admissionDate: null, revisitDate: null,
    revisitDate2: null, misCallingRemarks: null, isArchived: false,
    createdBy: "kiosk", updatedBy: null, createdAt, updatedAt: createdAt,
  },
  {
    id: "rps-branch-1", brand: "RPS", branchId: 1, academicYear: "2027-28",
    enquiryDate: "2026-09-23", monthLabel: "Sep-26",
    parentName: "RPS Branch One", childName: "RPS Student One",
    phone: "9000000003", altPhone: null, email: null, program: "Nursery",
    source: "Walk-in", status: "OPEN", closeReason: null, remark: null,
    leadOwner: null, walkInDate: null, admissionDate: null, revisitDate: null,
    revisitDate2: null, misCallingRemarks: null, isArchived: false,
    createdBy: "kiosk", updatedBy: null, createdAt, updatedAt: createdAt,
  },
  {
    id: "rps-branch-2", brand: "RPS", branchId: 2, academicYear: "2027-28",
    enquiryDate: "2026-09-22", monthLabel: "Sep-26",
    parentName: "RPS Branch Two", childName: "RPS Student Two",
    phone: "9000000004", altPhone: null, email: null, program: "Playgroup",
    source: "Referral", status: "OPEN", closeReason: null, remark: null,
    leadOwner: null, walkInDate: null, admissionDate: null, revisitDate: null,
    revisitDate2: null, misCallingRemarks: null, isArchived: false,
    createdBy: "kiosk", updatedBy: null, createdAt, updatedAt: createdAt,
  },
];

const supplements = {
  RIS: {
    leads: [{
      enquiryDate: "2026-09-20", monthLabel: "Sep-26", parentName: "RIS Supplement",
      childName: "RIS CRM Student", phone: "9000000011", program: "Grade 3",
      source: "Website", status: "FOLLOW-UP", leadOwner: "RIS Counsellor",
      walkInDate: null, branchName: "RIS Main",
    }],
    walkins: [],
  },
  RPS: {
    leads: [{
      enquiryDate: "2026-09-19", monthLabel: "Sep-26", parentName: "RPS Supplement",
      childName: "RPS CRM Student", phone: "9000000012", program: "Nursery",
      source: "Website", status: "FOLLOW-UP", leadOwner: "RPS Counsellor",
      walkInDate: null, branchName: "RPS Main",
    }],
    walkins: [],
  },
};

function mockDbRows() {
  mockSelect.mockImplementation(() => ({
    from: (table: unknown) => ({
      where: (condition: Chunk | undefined) => {
        if (table !== walkinLeads) return Promise.resolve([]);
        const requestedBrand = equalityValue(condition, "brand");
        const requestedBranch = equalityValue(condition, "branch_id");
        const rows = databaseLeads.filter((lead) =>
          (requestedBrand === undefined || lead.brand === requestedBrand) &&
          (requestedBranch === undefined || lead.branchId === Number(requestedBranch)),
        );
        const query = Promise.resolve(rows) as Promise<typeof rows> & {
          orderBy: () => Promise<typeof rows>;
        };
        query.orderBy = () => Promise.resolve(rows);
        return query;
      },
    }),
  }));
}

const testApp = express();
testApp.use(express.json());
registerWalkinRoutes(testApp);

let baseUrl = "";
let server: ReturnType<typeof testApp.listen>;
let leadsToken = "";

beforeAll(async () => {
  process.env.SESSION_SECRET = "walkin-filter-test-session-secret";
  process.env.WALKIN_LEADS_PASSCODE = "test-shared-leads-passcode";
  delete process.env.ADMIN_TOKEN;
  await new Promise<void>((resolve) => {
    server = testApp.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      resolve();
    });
  });
  leadsToken = createWalkinPageSession("leads", "test-shared-leads-passcode")!;
});

afterAll(async () => {
  delete process.env.SESSION_SECRET;
  delete process.env.WALKIN_LEADS_PASSCODE;
  if (server) await new Promise<void>((resolve, reject) =>
    server.close((error) => error ? reject(error) : resolve()),
  );
});

beforeEach(() => {
  vi.clearAllMocks();
  mockDbRows();
  mockMarketingRead.mockImplementation(async (brand: "RIS" | "RPS") => ({
    leads: supplements[brand].leads,
    walkins: supplements[brand].walkins,
  }));
});

function headers() {
  return { Authorization: `Bearer ${leadsToken}` };
}

async function get(path: string, authenticated = true) {
  return fetch(`${baseUrl}${path}`, {
    headers: authenticated ? headers() : {},
  });
}

describe("Walk-in Leads brand and branch filters", () => {
  it("allows a valid shared Leads session to see RIS and RPS leads", async () => {
    const response = await get("/api/walkin/leads");
    expect(response.status).toBe(200);
    const body = await response.json() as { leads: Array<{ brand: string }> };
    expect(new Set(body.leads.map((lead) => lead.brand))).toEqual(new Set(["RIS", "RPS"]));
    expect(body.leads).toHaveLength(6);
  });

  it("filters database and CRM supplement rows by RIS or RPS brand", async () => {
    const ris = await get("/api/walkin/leads?brand=RIS");
    expect(ris.status).toBe(200);
    const risLeads = (await ris.json() as { leads: Array<{ brand: string; parentName: string }> }).leads;
    expect(risLeads.every((lead) => lead.brand === "RIS")).toBe(true);
    expect(risLeads.map((lead) => lead.parentName)).toContain("RIS Supplement");
    expect(risLeads.map((lead) => lead.parentName)).not.toContain("RPS Supplement");

    const rps = await get("/api/walkin/leads?brand=RPS");
    expect(rps.status).toBe(200);
    const rpsLeads = (await rps.json() as { leads: Array<{ brand: string; parentName: string }> }).leads;
    expect(rpsLeads.every((lead) => lead.brand === "RPS")).toBe(true);
    expect(rpsLeads.map((lead) => lead.parentName)).toContain("RPS Supplement");
    expect(rpsLeads.map((lead) => lead.parentName)).not.toContain("RIS Supplement");
    expect(mockMarketingRead).toHaveBeenCalledWith("RIS");
    expect(mockMarketingRead).toHaveBeenCalledWith("RPS");
  });

  it("filters rows by branch within the selected brand and excludes branchless CRM supplements", async () => {
    const risBranch = await get("/api/walkin/leads?brand=RIS&branchId=1");
    expect(risBranch.status).toBe(200);
    const risLeads = (await risBranch.json() as {
      leads: Array<{ brand: string; branchId: number | null; parentName: string }>;
    }).leads;
    expect(risLeads.map((lead) => lead.parentName)).toEqual(["RIS Branch One"]);
    expect(risLeads.every((lead) => lead.brand === "RIS" && lead.branchId === 1)).toBe(true);

    const rpsBranch = await get("/api/walkin/leads?brand=RPS&branchId=2");
    expect(rpsBranch.status).toBe(200);
    const rpsLeads = (await rpsBranch.json() as {
      leads: Array<{ brand: string; branchId: number | null; parentName: string }>;
    }).leads;
    expect(rpsLeads.map((lead) => lead.parentName)).toEqual(["RPS Branch Two"]);
  });

  it("filters CSV exports by brand and branch for either school", async () => {
    const risExport = await get("/api/walkin/leads/export?format=csv&brand=RIS&branchId=2");
    expect(risExport.status).toBe(200);
    const risCsv = await risExport.text();
    expect(risCsv).toContain("RIS Branch Two");
    expect(risCsv).not.toContain("RIS Branch One");
    expect(risCsv).not.toContain("RPS Branch");

    const rpsExport = await get("/api/walkin/leads/export?format=csv&brand=RPS&branchId=1");
    expect(rpsExport.status).toBe(200);
    const rpsCsv = await rpsExport.text();
    expect(rpsCsv).toContain("RPS Branch One");
    expect(rpsCsv).not.toContain("RPS Branch Two");
    expect(rpsCsv).not.toContain("RIS Branch");
  });

  it("blocks unauthenticated leads list, detail, and export endpoints", async () => {
    expect((await get("/api/walkin/leads", false)).status).toBe(401);
    expect((await get("/api/walkin/leads/ris-branch-1", false)).status).toBe(401);
    expect((await get("/api/walkin/leads/export?format=csv", false)).status).toBe(401);
  });
});