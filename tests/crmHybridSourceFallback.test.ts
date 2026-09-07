import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDbWhere = vi.hoisted(() => vi.fn());
const mockDbFrom = vi.hoisted(() => vi.fn(() => ({ where: mockDbWhere })));
const mockDbSelect = vi.hoisted(() => vi.fn(() => ({ from: mockDbFrom })));
const mockSupplement = vi.hoisted(() => vi.fn());

vi.mock("../server/db", () => ({
  db: { select: mockDbSelect },
}));

vi.mock("../server/marketing2728Sheets", () => ({
  readMarketing2728Supplement: mockSupplement,
  supplementLeadKey: (lead: any) => [
    lead.enquiryDate ?? "",
    String(lead.phone ?? "").replace(/\D/g, "").slice(-10),
    String(lead.childName ?? "").trim().toLowerCase(),
  ].join("|"),
}));

vi.mock("../shared/schema", () => ({
  walkinLeads: {
    enquiryDate: "enquiryDate",
    childName: "childName",
    phone: "phone",
    monthLabel: "monthLabel",
    status: "status",
    source: "source",
    leadOwner: "leadOwner",
    program: "program",
    branchId: "branchId",
    brand: "brand",
    academicYear: "academicYear",
    isArchived: "isArchived",
  },
  walkinBranches: {},
  walkinLeadAuditLog: {},
  walkinStatuses: {},
  walkinCloseReasons: {},
  walkinPrograms: {},
  walkinSources: {},
  walkinStaff: {},
  walkinSyncReconciliations: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  and: vi.fn(),
  or: vi.fn(),
  isNull: vi.fn(),
  sql: vi.fn(),
}));

vi.mock("googleapis", () => ({
  google: {
    auth: { OAuth2: vi.fn(function (this: any) { this.setCredentials = vi.fn(); }) },
    sheets: vi.fn().mockReturnValue({ spreadsheets: { values: { get: vi.fn() } } }),
  },
}));

import { bustCrmStatsCache, readCrmLeadsTrackerStats } from "../server/walkinSheets";

const dbLead = {
  enquiryDate: "2026-08-01",
  childName: "Database Child",
  phone: "9000000001",
  monthLabel: "Aug-26",
  status: "OPEN",
  source: "Website",
  leadOwner: "Owner",
  program: "Nursery",
  branchId: 1,
};

const sheetLead = {
  enquiryDate: "2026-08-02",
  childName: "Sheet Child",
  phone: "9000000002",
  monthLabel: "Aug-26",
  status: "WALK-IN BOOKED",
  source: "Google",
  leadOwner: "Owner",
  program: "Nursery",
};

beforeEach(() => {
  mockDbSelect.mockClear();
  mockDbFrom.mockClear();
  mockDbWhere.mockReset();
  mockSupplement.mockReset();
  mockDbFrom.mockImplementation(() => ({ where: mockDbWhere }));
  mockDbSelect.mockImplementation(() => ({ from: mockDbFrom }));
  mockDbWhere.mockResolvedValue([dbLead]);
  bustCrmStatsCache();
});

describe("CRM hybrid source fallback", () => {
  it("preserves the last complete hybrid result when the supplementary source fails", async () => {
    mockSupplement
      .mockResolvedValueOnce({
        leads: [sheetLead],
        months: [],
        fetchedAt: "2026-09-07T10:00:00.000Z",
        available: true,
        mode: "oauth",
      })
      .mockResolvedValueOnce({
        leads: [],
        months: [],
        fetchedAt: null,
        available: false,
        mode: "unavailable",
        warning: "temporary source outage",
      });

    const complete = await readCrmLeadsTrackerStats("RIS");
    expect(complete.dataSource).toBe("hybrid");
    expect(complete.kpis).toMatchObject({ totalLeads: 2, bookings: 1 });

    bustCrmStatsCache("RIS");
    mockDbWhere.mockResolvedValueOnce([{ ...dbLead, childName: "Changed DB row" }]);
    const fallback = await readCrmLeadsTrackerStats("RIS");

    expect(fallback.dataSource).toBe("hybrid");
    expect(fallback.kpis).toEqual(complete.kpis);
    expect(fallback.stale).toBe(true);
    expect(fallback.sourceHealth.supplementary).toBe("unavailable");
    expect(fallback.sourceHealth.warning).toContain("temporary source outage");
  });

  it("returns an explicitly incomplete DB-only result on a cold start", async () => {
    mockSupplement.mockResolvedValue({
      leads: [],
      months: [],
      fetchedAt: null,
      available: false,
      mode: "unavailable",
      warning: "supplement unavailable",
    });

    const result = await readCrmLeadsTrackerStats("RPS");
    expect(result.dataSource).toBe("database");
    expect(result.kpis.totalLeads).toBe(1);
    expect(result.stale).toBeUndefined();
    expect(result.sourceHealth).toMatchObject({
      database: "available",
      supplementary: "unavailable",
      warning: "supplement unavailable",
    });
  });

  it("uses dashboard totals only for months missing from lead-level sources", async () => {
    mockSupplement.mockResolvedValue({
      leads: [sheetLead],
      months: [{
        month: "Sep-26",
        leads: 3,
        bookings: 2,
        walkins: 1,
        admissions: 1,
        closed: 1,
        open: 0,
      }],
      fetchedAt: "2026-09-07T10:00:00.000Z",
      available: true,
      mode: "oauth",
    });

    const result = await readCrmLeadsTrackerStats("RIS", { bust: true });
    expect(result.kpis).toEqual({
      totalLeads: 5,
      bookings: 3,
      walkins: 1,
      admissions: 1,
    });
    expect(result.monthlyDetail).toEqual([
      { month: "Aug-26", leads: 2, walkins: 0, admissions: 0, closed: 0 },
      { month: "Sep-26", leads: 3, walkins: 1, admissions: 1, closed: 1 },
    ]);
    // Summary-only rows have no source/program detail, so categorical totals
    // intentionally cover the two lead-level rows rather than inventing labels.
    expect(result.bySource.reduce((sum, row) => sum + row.cnt, 0)).toBe(2);
  });
});