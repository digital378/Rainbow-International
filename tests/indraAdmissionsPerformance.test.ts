import { createServer } from "node:http";
import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockAnd,
  mockDbFrom,
  mockDbSelect,
  mockDbWhere,
  mockEq,
} = vi.hoisted(() => ({
  mockAnd: vi.fn(),
  mockDbFrom: vi.fn(),
  mockDbSelect: vi.fn(),
  mockDbWhere: vi.fn(),
  mockEq: vi.fn(),
}));

vi.mock("../server/db", () => ({
  db: { select: mockDbSelect },
}));

vi.mock("drizzle-orm", () => ({
  and: mockAnd,
  desc: vi.fn(),
  eq: mockEq,
  gte: vi.fn(),
  isNull: vi.fn(),
  lte: vi.fn(),
  or: vi.fn(),
  sql: vi.fn(),
}));

vi.mock("../shared/schema", () => ({
  blogPostsTable: {},
  brochureRequests: {},
  callbackRequests: {},
  careerApplications: {},
  friendshipSchoolLeads: {},
  friendshipSchools: {},
  indraSyncStates: {},
  inquiries: {},
  walkinBranches: {},
  walkinCloseReasons: {},
  walkinLeads: {
    academicYear: "academicYear",
    brand: "brand",
    branchId: "branchId",
    isArchived: "isArchived",
    status: "status",
  },
  walkinPrograms: {},
  walkinSources: {},
  walkinStaff: {},
  walkinStatuses: {},
}));

vi.mock("../shared/codeOwnedBlogs", () => ({
  CODE_OWNED_BLOGS: [],
}));

import { registerIndraIntegrationRoutes } from "../server/indraIntegration";

type FakeLead = {
  academicYear: string;
  brand: "RIS" | "RPS";
  branchId: number;
  isArchived: boolean;
  status: string;
};

const CRM_ROWS: FakeLead[] = [
  { academicYear: "2027-28", brand: "RIS", branchId: 1, isArchived: false, status: "OPEN" },
  { academicYear: "2027-28", brand: "RIS", branchId: 1, isArchived: false, status: "WALK-IN COMPLETED" },
  { academicYear: "2027-28", brand: "RIS", branchId: 1, isArchived: false, status: "ADMISSION DONE" },
  { academicYear: "2027-28", brand: "RIS", branchId: 2, isArchived: false, status: "ADMISSION DONE" },
  { academicYear: "2027-28", brand: "RPS", branchId: 2, isArchived: false, status: "ADMISSION DONE" },
  { academicYear: "2027-28", brand: "RPS", branchId: 2, isArchived: false, status: "CLOSED" },
  { academicYear: "2026-27", brand: "RPS", branchId: 2, isArchived: false, status: "ADMISSION DONE" },
  { academicYear: "2027-28", brand: "RIS", branchId: 1, isArchived: true, status: "ADMISSION DONE" },
];

function filterRows(conditions: Array<{ column: keyof FakeLead; value: unknown }>) {
  return CRM_ROWS.filter((row) => conditions.every((condition) => row[condition.column] === condition.value));
}

let httpServer: ReturnType<typeof createServer>;
let serverUrl = "";
let originalToken: string | undefined;
let originalPort: string | undefined;

beforeEach(async () => {
  originalToken = process.env.INDRA_API_TOKEN;
  originalPort = process.env.PORT;
  process.env.INDRA_API_TOKEN = "indra-regression-token";

  mockEq.mockImplementation((column: keyof FakeLead, value: unknown) => ({ column, value }));
  mockAnd.mockImplementation((...conditions) => conditions.filter(Boolean));
  mockDbWhere.mockImplementation((conditions) => Promise.resolve(
    Array.isArray(conditions) ? filterRows(conditions) : [],
  ));
  mockDbFrom.mockImplementation(() => ({
    where: mockDbWhere,
    then: (resolve, reject) => Promise.resolve([{ total: 0 }]).then(resolve, reject),
  }));
  mockDbSelect.mockImplementation(() => ({ from: mockDbFrom }));

  const app = express();
  httpServer = createServer(app);
  registerIndraIntegrationRoutes(app);
  await new Promise<void>((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
  const address = httpServer.address() as { port: number };
  serverUrl = `http://127.0.0.1:${address.port}`;
  process.env.PORT = String(address.port);
});

afterEach(async () => {
  if (originalToken === undefined) delete process.env.INDRA_API_TOKEN;
  else process.env.INDRA_API_TOKEN = originalToken;
  if (originalPort === undefined) delete process.env.PORT;
  else process.env.PORT = originalPort;
  await new Promise<void>((resolve, reject) =>
    httpServer.close((error) => (error ? reject(error) : resolve())),
  );
});

describe("GET /api/indra/v1/crm/admissions-performance", () => {
  it("rejects a request without the dedicated Indra token", async () => {
    const response = await fetch(`${serverUrl}/api/indra/v1/crm/admissions-performance?academicYear=2027-28`);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: "Unauthorized" });
  });

  it("returns live aggregate KPIs, conversion figures, provenance, and the approved admission definition", async () => {
    const response = await fetch(`${serverUrl}/api/indra/v1/crm/admissions-performance?academicYear=2027-28`, {
      headers: { "X-Indra-Api-Key": "indra-regression-token" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      dataset: "crm.admissions-performance",
      source: "rainbow-international-school",
      data: {
        source: {
          table: "walkin_leads",
          description: "Live, non-archived CRM lead records from the database source of truth.",
        },
        freshness: { cached: false },
        filters: { academicYear: "2027-28", brand: null, branchId: null },
        definitions: {
          admission: 'A lead is counted as an admission only when its CRM status, after trimming and uppercasing, is exactly "ADMISSION DONE".',
        },
        byBrand: [
          {
            brand: "RIS",
            leads: 4,
            walkIns: 3,
            admissions: 2,
            conversions: { leadToAdmissionRate: 50, walkInToAdmissionRate: 66.67 },
          },
          {
            brand: "RPS",
            leads: 2,
            walkIns: 1,
            admissions: 1,
            conversions: { leadToAdmissionRate: 50, walkInToAdmissionRate: 100 },
          },
        ],
      },
    });
    expect(Number.isNaN(Date.parse(body.generatedAt))).toBe(false);
    expect(Number.isNaN(Date.parse(body.data.freshness.dataReadAt))).toBe(false);

    // The selected data shape never includes a contact field or a raw CRM row.
    expect(body.data.byBrand[0]).toEqual({
      brand: "RIS",
      leads: 4,
      walkIns: 3,
      admissions: 2,
      conversions: { leadToAdmissionRate: 50, walkInToAdmissionRate: 66.67 },
    });
    expect(JSON.stringify(body)).not.toMatch(/parentName|childName|phone|email|remark/i);
  });

  it("requires a valid academic year and applies brand and branch filters", async () => {
    const missingYear = await fetch(`${serverUrl}/api/indra/v1/crm/admissions-performance`, {
      headers: { Authorization: "Bearer indra-regression-token" },
    });
    expect(missingYear.status).toBe(400);
    expect(await missingYear.json()).toEqual({
      message: "academicYear is required and must use the YYYY-YY format",
    });

    const filtered = await fetch(
      `${serverUrl}/api/indra/v1/crm/admissions-performance?academicYear=2027-28&brand=RIS&branchId=1`,
      { headers: { Authorization: "Bearer indra-regression-token" } },
    );
    const body = await filtered.json();

    expect(filtered.status).toBe(200);
    expect(body.data.filters).toEqual({ academicYear: "2027-28", brand: "RIS", branchId: 1 });
    expect(body.data.byBrand).toEqual([{
      brand: "RIS",
      leads: 3,
      walkIns: 2,
      admissions: 1,
      conversions: { leadToAdmissionRate: 33.33, walkInToAdmissionRate: 50 },
    }]);
  });

  it("reports a valid no-match filter as fresh, empty aggregate data", async () => {
    const response = await fetch(
      `${serverUrl}/api/indra/v1/crm/admissions-performance?academicYear=2030-31&brand=RIS&branchId=1`,
      { headers: { Authorization: "Bearer indra-regression-token" } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      freshness: {
        cached: false,
        status: "no_matching_records",
      },
      filters: {
        academicYear: "2030-31",
        brand: "RIS",
        branchId: 1,
      },
      byBrand: [{
        brand: "RIS",
        leads: 0,
        walkIns: 0,
        admissions: 0,
        conversions: {
          leadToAdmissionRate: null,
          walkInToAdmissionRate: null,
        },
      }],
    });
    expect(Number.isNaN(Date.parse(body.data.freshness.dataReadAt))).toBe(false);
  });
});

describe("Indra catalog and admissions aggregate routing", () => {
  it("defaults optional CRM year filters to the current 2026-27 trackers while preserving explicit years", async () => {
    const headers = { Authorization: "Bearer indra-regression-token" };
    mockDbSelect.mockImplementation((selection?: Record<string, unknown>) => ({
      from: () => ({
        where: (conditions: Array<{ column: keyof FakeLead; value: unknown }>) => {
          let rows = filterRows(conditions);
          const selectedField = Object.keys(selection || {}).find((field) => field !== "total");
          const result = () => {
            if (selectedField) {
              return [...new Map(rows.map((row) => [row[selectedField as keyof FakeLead], row]))
                .entries()]
                .map(([value]) => ({ [selectedField]: value, total: rows.filter((row) => row[selectedField as keyof FakeLead] === value).length }));
            }
            return selection ? [{ total: rows.length }] : rows;
          };
          const query: any = {
            orderBy: () => query,
            limit: (count: number) => {
              rows = rows.slice(0, count);
              return query;
            },
            offset: (start: number) => {
              rows = rows.slice(start);
              return query;
            },
            groupBy: () => Promise.resolve(result()),
            then: (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
              Promise.resolve(result()).then(resolve, reject),
          };
          return query;
        },
      }),
    }));

    const defaultLeads = await fetch(`${serverUrl}/api/indra/v1/crm/leads`, { headers });
    const defaultLeadsBody = await defaultLeads.json();
    const defaultSummary = await fetch(`${serverUrl}/api/indra/v1/crm/summary`, { headers });
    const defaultSummaryBody = await defaultSummary.json();
    const futureLeads = await fetch(`${serverUrl}/api/indra/v1/crm/leads?academicYear=2027-28`, { headers });
    const futureLeadsBody = await futureLeads.json();

    expect(defaultLeads.status).toBe(200);
    expect(defaultLeadsBody.total).toBe(1);
    expect(defaultLeadsBody.data).toHaveLength(1);
    expect(defaultLeadsBody.data.every((lead: { academicYear: string }) => lead.academicYear === "2026-27")).toBe(true);
    expect(defaultSummary.status).toBe(200);
    expect(defaultSummaryBody.data.academicYear).toBe("2026-27");

    expect(futureLeads.status).toBe(200);
    expect(futureLeadsBody.total).toBeGreaterThan(0);
    expect(futureLeadsBody.data.every((lead: { academicYear: string }) => lead.academicYear === "2027-28")).toBe(true);
  });

  it("publishes aggregate-first routing guidance and valid filters", async () => {
    const response = await fetch(`${serverUrl}/api/indra/v1/catalog`, {
      headers: { "X-Indra-Api-Key": "indra-regression-token" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.queryRouting).toEqual(expect.arrayContaining([
      expect.objectContaining({
        intent: "admissions",
        path: "/api/indra/v1/crm/admissions",
        requiredFilters: ["academicYear"],
      }),
      expect.objectContaining({
        intent: "admissions-performance",
        path: "/api/indra/v1/crm/admissions-performance",
        requiredFilters: ["academicYear"],
      }),
      expect.objectContaining({
        intent: "dashboard-overview",
        path: "/api/indra/v1/dashboard/overview",
        requiredFilters: ["academicYear"],
      }),
      expect.objectContaining({
        intent: "lead-records",
        path: "/api/indra/v1/crm/leads",
        requiredFilters: [],
      }),
    ]));
    expect(body.data.resources).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: "crm.admissions",
        filters: ["brand", "academicYear", "branchId"],
      }),
      expect.objectContaining({
        id: "crm.admissions-performance",
        filters: ["academicYear", "brand", "branchId"],
      }),
    ]));
  });

  it("requires an explicit academic year for admissions aggregates", async () => {
    const response = await fetch(`${serverUrl}/api/indra/v1/crm/admissions`, {
      headers: { Authorization: "Bearer indra-regression-token" },
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "academicYear is required and must use the YYYY-YY format",
    });
  });

  it("returns applied filters and no-matching-records freshness without treating leads as totals", async () => {
    const response = await fetch(
      `${serverUrl}/api/indra/v1/crm/admissions?academicYear=2030-31&brand=RIS&branchId=1`,
      { headers: { "X-Indra-Api-Key": "indra-regression-token" } },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      academicYear: "2030-31",
      requestedBrand: "RIS",
      freshness: {
        cached: false,
        status: "no_matching_records",
      },
      filters: {
        academicYear: "2030-31",
        brand: "RIS",
        branchId: 1,
      },
      combined: {
        kpis: {
          totalLeads: 0,
          bookings: 0,
          walkins: 0,
          admissions: 0,
        },
      },
    });
    expect(Number.isNaN(Date.parse(body.data.freshness.dataReadAt))).toBe(false);
  });

  it("keeps dashboard-wide metrics scoped while surfacing an empty valid admissions filter", async () => {
    const missingYear = await fetch(`${serverUrl}/api/indra/v1/dashboard/overview`, {
      headers: { Authorization: "Bearer indra-regression-token" },
    });
    expect(missingYear.status).toBe(400);
    expect(await missingYear.json()).toEqual({
      message: "academicYear is required and must use the YYYY-YY format",
    });

    const response = await fetch(
      `${serverUrl}/api/indra/v1/dashboard/overview?academicYear=2030-31&brand=RIS&branchId=1`,
      { headers: { Authorization: "Bearer indra-regression-token" } },
    );
    const body = await response.json();

    expect(response.status, JSON.stringify(body)).toBe(200);
    expect(body.data).toMatchObject({
      freshness: {
        cached: false,
        status: "no_matching_records",
      },
      filters: {
        admissions: {
          academicYear: "2030-31",
          brand: "RIS",
          branchId: 1,
        },
        organizationWideSections: {
          scope: "all-time, organization-wide",
        },
      },
      admissions: {
        freshness: {
          status: "no_matching_records",
        },
        filters: {
          academicYear: "2030-31",
          brand: "RIS",
          branchId: 1,
        },
      },
    });
    expect(Number.isNaN(Date.parse(body.data.freshness.dataReadAt))).toBe(false);
  });
});

describe("Indra historical dashboard aggregates", () => {
  it("protects academic-year discovery with the dedicated token", async () => {
    const response = await fetch(`${serverUrl}/api/indra/v1/dashboard/academic-years`);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ message: "Unauthorized" });
  });

  it("publishes provider coverage and keeps static history aggregate-only", async () => {
    const response = await fetch(`${serverUrl}/api/indra/v1/dashboard/reports?academicYear=2024-25`, {
      headers: { "X-Indra-Api-Key": "indra-regression-token" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      requestedAcademicYear: "2024-25",
      aggregateOnly: true,
      reports: [{
        academicYear: "2024-25",
        availability: "partial",
        providers: [expect.objectContaining({
          id: "marketing.comparison-history",
          status: "available",
        })],
      }],
    });
    expect(JSON.stringify(body)).not.toMatch(/parentName|childName|phone|email|remark|spreadsheet/i);
  });

  it("distinguishes an unavailable legacy provider from a zero-value report", async () => {
    const response = await fetch(`${serverUrl}/api/indra/v1/dashboard/reports?academicYear=2026-27`, {
      headers: { Authorization: "Bearer indra-regression-token" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.reports[0].providers).toHaveLength(3);
    expect(body.data.reports[0].providers).toEqual(expect.arrayContaining([
      expect.objectContaining({
        status: "unavailable",
        error: expect.objectContaining({ code: "provider_unavailable" }),
      }),
    ]));
    expect(JSON.stringify(body)).not.toMatch(/parentName|childName|phone|email|remark/i);
  });
});