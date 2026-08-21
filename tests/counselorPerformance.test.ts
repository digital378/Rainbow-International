import { describe, expect, it } from "vitest";
import {
  academicYearForDate,
  buildCounselorPerformance,
  parseCounselorPerformanceFilters,
  type CounselorPerformanceRecord,
} from "../server/counselorPerformance";

const generatedAt = "2026-08-21T08:00:00.000Z";

function filters(query: Record<string, unknown> = {}) {
  const result = parseCounselorPerformanceFilters(query);
  if ("error" in result) throw new Error(result.error);
  return result.filters;
}

const rpsRecords: CounselorPerformanceRecord[] = [
  {
    counselor: "Asha Rao",
    branch: "Dhokali",
    source: "Digital Marketing",
    date: new Date("2026-08-02T00:00:00.000Z"),
    academicYear: "2026-27",
    status: { admission: true },
  },
  {
    counselor: "Asha Rao",
    branch: "Dhokali",
    source: "Direct Walkin",
    date: new Date("2026-08-08T00:00:00.000Z"),
    academicYear: "2026-27",
    status: { followUp: true },
  },
  {
    counselor: "Asha Rao",
    branch: "Dhokali",
    source: "Digital Marketing",
    date: new Date("2026-09-03T00:00:00.000Z"),
    academicYear: "2026-27",
    status: { open: true },
  },
  {
    counselor: "Bina Shah",
    branch: "Kalwa",
    source: "Referral",
    date: new Date("2026-08-11T00:00:00.000Z"),
    academicYear: "2026-27",
    status: { inProcess: true },
  },
  {
    counselor: "Carla D",
    branch: "Kalwa",
    source: "Referral",
    date: new Date("2026-03-11T00:00:00.000Z"),
    academicYear: "2025-26",
    status: { closed: true },
  },
];

describe("counselor performance response contract", () => {
  it("returns every matched counselor without leaderboard slicing and keeps account metadata separate", () => {
    const result = buildCounselorPerformance("rps", generatedAt, filters({ academicYear: "2026-27" }), rpsRecords);

    expect(result.account).toBe("rps");
    expect(result.generatedAt).toBe(generatedAt);
    expect(result.counselorPerformance.totalCounselors).toBe(2);
    expect(result.counselorPerformance.counselors.map((item) => item.counselor)).toEqual(["Asha Rao", "Bina Shah"]);
    expect(result.counselorPerformance.counselors[0]).toMatchObject({
      branch: "Dhokali",
      assignedEnquiries: 3,
      walkinsAssigned: 3,
      admissions: 1,
      conversionRate: 33.3,
      periodStatus: { open: 1, closed: 0, inProcess: 0, futureProspect: 0, provisional: 0 },
      activePipeline: { open: 1, followUps: 1, inProcess: 0, futureProspect: 0, total: 2 },
    });
  });

  it("filters period totals by month while retaining the current active-pipeline snapshot", () => {
    const result = buildCounselorPerformance("ris", generatedAt, filters({ month: "2026-08" }), rpsRecords);
    const asha = result.counselorPerformance.counselors.find((item) => item.counselor === "Asha Rao");

    expect(result.counselorPerformance.period).toEqual({
      academicYear: null,
      month: "2026-08",
      dateRange: { from: "2026-08-01", to: "2026-08-31" },
      timezone: "Asia/Kolkata",
    });
    expect(asha).toMatchObject({
      assignedEnquiries: 2,
      followUps: 1,
      admissions: 1,
      activePipeline: { open: 1, followUps: 1, total: 2 },
    });
  });

  it("filters inclusive date ranges", () => {
    const result = buildCounselorPerformance(
      "rps",
      generatedAt,
      filters({ from: "2026-08-08", to: "2026-08-11" }),
      rpsRecords,
    );

    expect(result.counselorPerformance.counselors.map((item) => ({
      counselor: item.counselor,
      assignedEnquiries: item.assignedEnquiries,
    }))).toEqual([
      { counselor: "Asha Rao", assignedEnquiries: 1 },
      { counselor: "Bina Shah", assignedEnquiries: 1 },
    ]);
  });

  it("filters by branch, counselor, and source without leaking person-level record fields", () => {
    const result = buildCounselorPerformance(
      "rps",
      generatedAt,
      filters({ branch: "dhokali", counselor: "asha rao", source: "digital marketing" }),
      rpsRecords,
    );
    const [asha] = result.counselorPerformance.counselors;

    expect(result.counselorPerformance.totalCounselors).toBe(1);
    expect(asha).toMatchObject({ counselor: "Asha Rao", assignedEnquiries: 2, admissions: 1 });
    expect(Object.keys(asha).sort()).toEqual([
      "activePipeline",
      "admissions",
      "assignedEnquiries",
      "branch",
      "conversionRate",
      "counselor",
      "followUps",
      "periodStatus",
      "walkinsAssigned",
    ]);
  });

  it("validates filters and derives the April-to-March academic year for sources without an explicit field", () => {
    expect(parseCounselorPerformanceFilters({ month: "2026-08", from: "2026-08-01" })).toEqual({
      error: "month cannot be combined with from or to",
    });
    expect(parseCounselorPerformanceFilters({ from: "2026-08-32" })).toEqual({
      error: "from must use YYYY-MM-DD format",
    });
    expect(parseCounselorPerformanceFilters({ academicYear: "2026/27" })).toEqual({
      error: "academicYear must use YYYY-YY format",
    });
    expect(academicYearForDate(new Date("2026-03-31T00:00:00.000Z"))).toBe("2025-26");
    expect(academicYearForDate(new Date("2026-04-01T00:00:00.000Z"))).toBe("2026-27");
  });
});