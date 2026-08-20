import { LAST_YEAR, MONTHLY } from "@shared/marketingData";

export const HISTORICAL_REPORT_YEARS = [
  {
    academicYear: "2024-25",
    availability: "partial",
    providers: ["marketing.comparison-history"],
    limitation: "Marketing comparison aggregates only; no matching legacy CRM or sales workbook is available through this bridge.",
  },
  {
    academicYear: "2025-26",
    availability: "partial",
    providers: ["marketing.monthly-history"],
    limitation: "Marketing monthly aggregates only; this source is a reporting series and not a normalized CRM academic-year dataset.",
  },
  {
    academicYear: "2026-27",
    availability: "available",
    providers: ["marketing.live-dashboard", "sales.ris-live-dashboard", "sales.rps-live-dashboard"],
    limitation: "Providers remain separate because their sheet definitions and date/status semantics differ.",
  },
  {
    academicYear: "2027-28",
    availability: "available",
    providers: ["crm.database"],
    limitation: "Use the database-backed CRM aggregate included in the reports response.",
  },
] as const;

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

const CATEGORY_FIELDS = new Set(["branch", "grade", "source", "status", "segment"]);

const APPROVED_BRANCHES = new Map([
  ["main", "Main"], ["ris", "RIS"], ["agarwal", "Agarwal"], ["aggarwal", "Agarwal"],
  ["agrawal", "Agarwal"],
  ["dhokali", "Dhokali"], ["kasarwadavali", "Kasarwadavali"], ["kasarvadavali", "Kasarwadavali"],
  ["anand nagar", "Anand Nagar"], ["anandnagar", "Anand Nagar"], ["hariniwas", "Hariniwas"],
  ["kalwa", "Kalwa"], ["unassigned", "Unassigned"], ["unknown", "Unknown"],
]);
const APPROVED_SOURCES = new Map([
  ["direct walkin", "Direct Walk-in"], ["walk-in", "Direct Walk-in"], ["walkin", "Direct Walk-in"],
  ["digital marketing", "Digital Marketing"], ["dm", "Digital Marketing"],
  ["dm online enquiry", "Digital Marketing"], ["google", "Google"], ["meta", "Meta"],
  ["facebook", "Facebook"], ["instagram", "Instagram"], ["website", "Website"],
  ["website enquiry", "Website"], ["referral", "Referral"], ["organic", "Organic"],
  ["justdial", "Justdial"], ["brand tie up", "Brand Tie-up"], ["ex-parent", "Ex-Parent"],
  ["ex parent", "Ex-Parent"], ["sibling", "Sibling"], ["telephonic", "Telephonic"],
  ["unknown", "Unknown"], ["unassigned", "Unassigned"],
]);
const APPROVED_STATUSES = new Map([
  ["open", "OPEN"], ["walk-in booked", "WALK-IN BOOKED"], ["walk-in completed", "WALK-IN COMPLETED"],
  ["admission done", "ADMISSION DONE"], ["adm done", "ADM DONE"], ["adm done in ris", "ADM DONE IN RIS"],
  ["closed", "CLOSED"], ["follow up", "FOLLOW UP"], ["followup", "FOLLOW UP"],
  ["provisional", "PROVISIONAL"], ["in process adm", "IN PROCESS ADM"],
  ["future prospect", "FUTURE PROSPECT"], ["unknown", "Unknown"], ["unassigned", "Unassigned"],
]);
const APPROVED_SEGMENTS = new Set([
  "Location / Not in Catchment", "Distance / Too Far", "Joined Another School",
  "Finance / Fees", "Board / Curriculum Preference", "Not Interested / Unresponsive",
  "Timing / Schedule", "No Reason Recorded", "Other",
]);

function safeCategory(field: string, value: unknown) {
  if (typeof value !== "string") return "Other / Unclassified";
  const normalized = value.trim().replace(/\s+/g, " ");
  if (
    normalized.length > 80 ||
    /@/.test(normalized) ||
    /\d[\d\s().-]{7,}/.test(normalized)
  ) {
    return "Other / Unclassified";
  }
  const key = normalized.toLowerCase();
  if (field === "branch") return APPROVED_BRANCHES.get(key) || "Other / Unclassified";
  if (field === "source") return APPROVED_SOURCES.get(key) || "Other / Unclassified";
  if (field === "status") return APPROVED_STATUSES.get(key) || "Other / Unclassified";
  if (field === "segment") return APPROVED_SEGMENTS.has(normalized) ? normalized : "Other / Unclassified";
  if (field === "grade") {
    return /^(nursery|jr\.? ?kg|sr\.? ?kg|lkg|ukg|pre-primary|class ?(?:[1-9]|1[0-2])|grade ?(?:[1-9]|1[0-2])|i{1,3}|iv|v|vi|vii|viii|ix|x|xi|xii|unspecified|unknown)$/i.test(normalized)
      ? normalized
      : "Other / Unclassified";
  }
  return "Other / Unclassified";
}

function allowRows(value: unknown, allowed: readonly string[]) {
  return list(value).map((entry) => {
    const source = record(entry);
    return Object.fromEntries(allowed
      .filter((key) => source[key] !== undefined)
      .map((key) => [key, CATEGORY_FIELDS.has(key) ? safeCategory(key, source[key]) : source[key]]));
  });
}

function allowCounts(value: unknown, field: "source" | "status") {
  const counts = new Map<string, number>();
  for (const [key, count] of Object.entries(record(value))) {
    if (typeof count !== "number" || !Number.isFinite(count)) continue;
    const category = safeCategory(field, key);
    counts.set(category, (counts.get(category) || 0) + count);
  }
  return Object.fromEntries(counts);
}

function historicalMarketingComparison() {
  return {
    id: "marketing.comparison-history",
    status: "available",
    source: {
      system: "Rainbow marketing history",
      type: "versioned application data",
      description: "Historical marketing comparison aggregates maintained by the Rainbow marketing dashboard.",
    },
    freshness: { cached: false, dataReadAt: new Date().toISOString() },
    coverage: { reportingPeriod: "Oct 2024 to Jun 2025", academicYearInterpretation: "source-defined marketing comparison period" },
    data: {
      monthly: LAST_YEAR.map((row) => ({
        month: row.month,
        ris: row.ris,
        rps: row.rps,
        combined: {
          spend: row.ris.spend + row.rps.spend,
          leads: row.ris.leads + row.rps.leads,
          walkins: row.ris.walkins + row.rps.walkins,
          admissions: row.ris.admissions + row.rps.admissions,
        },
      })),
    },
  };
}

function historicalMarketingMonthly() {
  return {
    id: "marketing.monthly-history",
    status: "available",
    source: {
      system: "Rainbow marketing history",
      type: "versioned application data",
      description: "Marketing dashboard monthly aggregates retained as application data.",
    },
    freshness: { cached: false, dataReadAt: new Date().toISOString() },
    coverage: { reportingPeriod: "Jun 2025 onward", academicYearInterpretation: "source-defined marketing reporting period" },
    data: {
      monthly: MONTHLY
        .filter((row) => / (25|26)$/.test(row.month))
        .map((row) => ({ month: row.month, combined: row.combined, ris: row.ris, rps: row.rps })),
    },
  };
}

async function fetchDashboard(path: string): Promise<JsonRecord> {
  const port = process.env.PORT || "5000";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Dashboard provider did not return a successful response");
    return record(await response.json());
  } finally {
    clearTimeout(timeout);
  }
}

function unavailableProvider(id: string, description: string) {
  return {
    id,
    status: "unavailable",
    source: { system: "Rainbow legacy dashboard", description },
    freshness: { cached: false, dataReadAt: new Date().toISOString() },
    error: {
      code: "provider_unavailable",
      message: "The source dashboard could not be read. Retry later; do not infer a zero value.",
    },
  };
}

async function provider<T>(id: string, description: string, read: () => Promise<T>) {
  try {
    return await read();
  } catch {
    return unavailableProvider(id, description);
  }
}

async function legacyMarketingProvider() {
  return provider("marketing.live-dashboard", "Aggregate marketing dashboard data for the 2026-27 reporting cycle.", async () => {
    const live = await fetchDashboard("/api/marketing/live");
    return {
      id: "marketing.live-dashboard",
      status: "available",
      source: {
        system: "Rainbow marketing dashboard",
        type: "Google Sheets-backed aggregate provider",
        description: "Combined and per-school marketing and CRM-report aggregates.",
      },
      freshness: { cached: false, dataReadAt: String(live.generatedAt || new Date().toISOString()) },
      coverage: { academicYear: "2026-27", reportingPeriod: "provider-defined live dashboard history" },
      data: {
        monthlyTotals: allowRows(live.monthlyTotals, ["month", "leads", "bookings", "walkins", "admissions", "meta", "google", "spend", "freshWalkins", "risFreshWalkins", "rpsFreshWalkins"]),
        risSchoolMonthly: allowRows(live.risSchoolMonthly, ["month", "leads", "bookings", "walkins", "admissions"]),
        rpsSchoolMonthly: allowRows(live.rpsSchoolMonthly, ["month", "leads", "bookings", "walkins", "admissions"]),
        risSpend: allowRows(live.risSpend, ["month", "salaries", "meta", "google", "adSpend"]),
        rpsSpend: allowRows(live.rpsSpend, ["month", "salaries", "meta", "google", "adSpend"]),
        risCrm: {
          byMonth: allowRows(record(live.risCrm).byMonth, ["month", "leads", "bookings", "walkins", "admissions", "closed"]),
          bySource: allowCounts(record(live.risCrm).bySource, "source"),
          statusSummary: allowCounts(record(live.risCrm).statusSummary, "status"),
        },
        rpsCrm: {
          byMonth: allowRows(record(live.rpsCrm).byMonth, ["month", "leads", "bookings", "walkins", "admissions", "closed"]),
          bySource: allowCounts(record(live.rpsCrm).bySource, "source"),
          statusSummary: allowCounts(record(live.rpsCrm).statusSummary, "status"),
        },
      },
    };
  });
}

async function legacyRisSalesProvider() {
  return provider("sales.ris-live-dashboard", "Aggregate RIS sales dashboard data for the 2026-27 reporting cycle.", async () => {
    const live = await fetchDashboard("/api/sales/live?full=1");
    const walkins = record(live.walkins);
    const admissions = record(live.admissions);
    return {
      id: "sales.ris-live-dashboard",
      status: "available",
      source: {
        system: "RIS sales dashboard",
        type: "Google Sheets-backed aggregate provider",
        description: "RIS walk-in and admission funnel aggregates.",
      },
      freshness: { cached: false, dataReadAt: String(live.generatedAt || new Date().toISOString()) },
      coverage: { academicYear: "2026-27", reportingPeriod: "Oct 2025 to Sep 2026 source workbook cycle" },
      data: {
        kpis: record(live.kpis),
        monthlyTargets: allowRows(live.monthlyTargets, ["month", "target", "achieved", "gap"]),
        walkins: {
          byMonth: allowRows(walkins.byMonth, ["monthKey", "month", "count"]),
          bySource: allowRows(walkins.bySource, ["source", "count"]),
          byStatus: allowRows(walkins.byStatus, ["status", "count"]),
          byGrade: allowRows(walkins.byGrade, ["grade", "count"]),
          closedReasonSegments: allowRows(walkins.closedReasonSegments, ["segment", "count"]),
        },
        admissions: {
          byMonth: allowRows(admissions.byMonth, ["monthKey", "month", "total"]),
          byBranch: allowRows(admissions.byBranch, ["branch", "count"]),
          byGrade: allowRows(admissions.byGrade, ["grade", "count"]),
          bySource: allowRows(admissions.bySource, ["source", "count"]),
        },
      },
    };
  });
}

async function legacyRpsSalesProvider() {
  return provider("sales.rps-live-dashboard", "Aggregate RPS sales dashboard data for the 2026-27 reporting cycle.", async () => {
    const live = await fetchDashboard("/api/rps-sales/live?full=1&academicYear=2026-27");
    return {
      id: "sales.rps-live-dashboard",
      status: "available",
      source: {
        system: "RPS sales dashboard",
        type: "Google Sheets-backed aggregate provider",
        description: "RPS enquiry, admission, branch, grade, and source aggregates.",
      },
      freshness: { cached: false, dataReadAt: String(live.generatedAt || new Date().toISOString()) },
      coverage: { academicYear: "2026-27", reportingPeriod: "Oct 2025 to Sep 2026 source workbook cycle" },
      data: {
        kpis: record(live.kpis),
        byMonth: allowRows(live.byMonth, ["monthKey", "label", "enquiries", "admissions"]),
        byBranch: allowRows(live.byBranch, ["branch", "enquiries", "admissions", "open", "closed", "conversion"]),
        bySource: allowRows(live.bySource, ["source", "enquiries", "admissions"]),
        byGrade: allowRows(live.byGrade, ["grade", "count"]),
        monthlyDetail: allowRows(live.monthlyDetail, ["monthKey", "label", "enquiries", "admissions"]),
        misHistory: allowRows(live.misHistory, ["date", "walkins", "admissions", "gap"]),
      },
    };
  });
}

export async function readHistoricalDashboardProviders(academicYear: string) {
  if (academicYear === "2024-25") return [historicalMarketingComparison()];
  if (academicYear === "2025-26") return [historicalMarketingMonthly()];
  if (academicYear !== "2026-27") return [];
  return Promise.all([legacyMarketingProvider(), legacyRisSalesProvider(), legacyRpsSalesProvider()]);
}