import { afterEach, describe, expect, it, vi } from "vitest";
import { readHistoricalDashboardProviders } from "../server/indraHistoricalReports";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("historical Indra dashboard providers", () => {
  it("requests a year-scoped RPS aggregate and removes unsafe sheet categories", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.includes("/api/marketing/live")) {
        return new Response(JSON.stringify({ generatedAt: "2026-08-20T00:00:00.000Z" }), { status: 200 });
      }
      if (url.includes("/api/sales/live")) {
        return new Response(JSON.stringify({ generatedAt: "2026-08-20T00:00:00.000Z", kpis: {} }), { status: 200 });
      }
      return new Response(JSON.stringify({
        generatedAt: "2026-08-20T00:00:00.000Z",
        kpis: { totalEnquiries: 2 },
        bySource: [
          { source: "Priya Shah", enquiries: 1, admissions: 0 },
          { source: "Brand Tie up", enquiries: 2, admissions: 1 },
          { source: "EX-Parent", enquiries: 3, admissions: 1 },
          { source: "Sibling", enquiries: 4, admissions: 2 },
          { source: "Telephonic", enquiries: 5, admissions: 2 },
        ],
        byBranch: [{ branch: "Agrawal", enquiries: 2, admissions: 1, open: 1, closed: 0, conversion: 50 }],
        byGrade: [{ grade: "Grade 1", count: 1 }, { grade: "Rohan's Grade", count: 1 }],
        closedReasons: [{ reason: "Call 9876543210", count: 1 }],
        monthlyDetail: [{
          monthKey: "2026-01",
          label: "Jan '26",
          enquiries: 1,
          admissions: 0,
          branches: { "Branch 9876543210": { enquiries: 1, admissions: 0 } },
        }],
      }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const providers = await readHistoricalDashboardProviders("2026-27");
    const rps = providers.find((provider) => provider.id === "sales.rps-live-dashboard");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/rps-sales/live?full=1&academicYear=2026-27"),
      expect.any(Object),
    );
    expect(rps).toMatchObject({
      status: "available",
      data: {
        monthlyDetail: [{ monthKey: "2026-01", label: "Jan '26", enquiries: 1, admissions: 0 }],
      },
    });
    const rpsData = (rps as { data: { bySource: unknown[]; byBranch: unknown[] } }).data;
    expect(rpsData.bySource).toEqual(expect.arrayContaining([
      { source: "Other / Unclassified", enquiries: 1, admissions: 0 },
      { source: "Brand Tie-up", enquiries: 2, admissions: 1 },
      { source: "Ex-Parent", enquiries: 3, admissions: 1 },
      { source: "Sibling", enquiries: 4, admissions: 2 },
      { source: "Telephonic", enquiries: 5, admissions: 2 },
    ]));
    expect(rpsData.byBranch).toEqual(expect.arrayContaining([
      { branch: "Agarwal", enquiries: 2, admissions: 1, open: 1, closed: 0, conversion: 50 },
    ]));
    expect(JSON.stringify(rps)).not.toMatch(/Priya Shah|Rohan's Grade|9876543210|closedReasons/i);
  });
});