export type CounselorPerformanceAccount = "ris" | "rps";

export type CounselorPerformanceFilters = {
  month: string | null;
  from: string | null;
  to: string | null;
  academicYear: string | null;
  branch: string | null;
  counselor: string | null;
  source: string | null;
};

type ParsedCounselorPerformanceFilters = CounselorPerformanceFilters & {
  fromDate: Date | null;
  toDate: Date | null;
};

export type CounselorPerformanceRecord = {
  counselor: string;
  branch: string | null;
  source: string;
  date: Date | null;
  academicYear?: string | null;
  status: {
    admission?: boolean;
    open?: boolean;
    closed?: boolean;
    followUp?: boolean;
    inProcess?: boolean;
    futureProspect?: boolean;
    provisional?: boolean;
  };
};

type PerformanceEntry = {
  counselor: string;
  branch: string | null;
  assignedEnquiries: number;
  walkinsAssigned: number;
  followUps: number;
  admissions: number;
  periodStatus: {
    open: number;
    closed: number;
    inProcess: number;
    futureProspect: number;
    provisional: number;
  };
  activePipeline: {
    open: number;
    followUps: number;
    inProcess: number;
    futureProspect: number;
    total: number;
  };
};

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{2}$/;

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

function parseIsoDate(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function academicYearForDate(date: Date | null): string | null {
  if (!date) return null;
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 3 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function parseCounselorPerformanceFilters(
  query: Record<string, unknown>,
): { filters: ParsedCounselorPerformanceFilters } | { error: string } {
  const value = (key: string): string | null => {
    const item = query[key];
    return typeof item === "string" && item.trim() ? item.trim() : null;
  };

  const filters: CounselorPerformanceFilters = {
    month: value("month"),
    from: value("from"),
    to: value("to"),
    academicYear: value("academicYear"),
    branch: value("branch"),
    counselor: value("counselor"),
    source: value("source"),
  };

  if (filters.month && !MONTH_PATTERN.test(filters.month)) {
    return { error: "month must use YYYY-MM format" };
  }
  if (filters.academicYear && !ACADEMIC_YEAR_PATTERN.test(filters.academicYear)) {
    return { error: "academicYear must use YYYY-YY format" };
  }
  if (filters.month && (filters.from || filters.to)) {
    return { error: "month cannot be combined with from or to" };
  }

  const fromDate = filters.from ? parseIsoDate(filters.from) : null;
  const toDate = filters.to ? parseIsoDate(filters.to) : null;
  if (filters.from && !fromDate) return { error: "from must use YYYY-MM-DD format" };
  if (filters.to && !toDate) return { error: "to must use YYYY-MM-DD format" };
  if (fromDate && toDate && fromDate > toDate) {
    return { error: "from cannot be after to" };
  }

  return { filters: { ...filters, fromDate, toDate } };
}

function matchesDimensionFilters(
  record: CounselorPerformanceRecord,
  filters: ParsedCounselorPerformanceFilters,
): boolean {
  const recordAcademicYear = record.academicYear || academicYearForDate(record.date);
  return (
    (!filters.academicYear || recordAcademicYear === filters.academicYear) &&
    (!filters.branch || normalize(record.branch) === normalize(filters.branch)) &&
    (!filters.counselor || normalize(record.counselor) === normalize(filters.counselor)) &&
    (!filters.source || normalize(record.source) === normalize(filters.source))
  );
}

function matchesPeriod(
  record: CounselorPerformanceRecord,
  filters: ParsedCounselorPerformanceFilters,
): boolean {
  if (!record.date) return !filters.month && !filters.fromDate && !filters.toDate;
  if (filters.month && monthKey(record.date) !== filters.month) return false;
  if (filters.fromDate && dateKey(record.date) < dateKey(filters.fromDate)) return false;
  if (filters.toDate && dateKey(record.date) > dateKey(filters.toDate)) return false;
  return true;
}

function emptyEntry(counselor: string, branch: string | null): PerformanceEntry {
  return {
    counselor,
    branch,
    assignedEnquiries: 0,
    walkinsAssigned: 0,
    followUps: 0,
    admissions: 0,
    periodStatus: { open: 0, closed: 0, inProcess: 0, futureProspect: 0, provisional: 0 },
    activePipeline: { open: 0, followUps: 0, inProcess: 0, futureProspect: 0, total: 0 },
  };
}

export function buildCounselorPerformance(
  account: CounselorPerformanceAccount,
  generatedAt: string,
  filters: ParsedCounselorPerformanceFilters,
  records: CounselorPerformanceRecord[],
) {
  const entries = new Map<string, PerformanceEntry>();

  for (const record of records) {
    if (!record.counselor || normalize(record.counselor) === "unassigned") continue;
    if (!matchesDimensionFilters(record, filters)) continue;

    const branch = record.branch?.trim() || null;
    const key = `${normalize(record.counselor)}|${normalize(branch)}`;
    const inPeriod = matchesPeriod(record, filters);
    const current = record.status.open || record.status.followUp || record.status.inProcess || record.status.futureProspect;
    if (!inPeriod && !current) continue;
    const entry = entries.get(key) || emptyEntry(record.counselor.trim(), branch);

    if (inPeriod) {
      entry.assignedEnquiries++;
      entry.walkinsAssigned++;
      if (record.status.admission) entry.admissions++;
      if (record.status.followUp) entry.followUps++;
      if (record.status.open) entry.periodStatus.open++;
      if (record.status.closed) entry.periodStatus.closed++;
      if (record.status.inProcess) entry.periodStatus.inProcess++;
      if (record.status.futureProspect) entry.periodStatus.futureProspect++;
      if (record.status.provisional) entry.periodStatus.provisional++;
    }

    if (current) {
      if (record.status.open) entry.activePipeline.open++;
      if (record.status.followUp) entry.activePipeline.followUps++;
      if (record.status.inProcess) entry.activePipeline.inProcess++;
      if (record.status.futureProspect) entry.activePipeline.futureProspect++;
      entry.activePipeline.total++;
    }

    entries.set(key, entry);
  }

  const counselors = Array.from(entries.values())
    .map((entry) => ({
      ...entry,
      conversionRate: entry.assignedEnquiries
        ? Math.round((entry.admissions / entry.assignedEnquiries) * 1000) / 10
        : 0,
    }))
    .sort((a, b) =>
      b.admissions - a.admissions ||
      b.assignedEnquiries - a.assignedEnquiries ||
      a.counselor.localeCompare(b.counselor) ||
      (a.branch || "").localeCompare(b.branch || ""),
    );

  return {
    account,
    generatedAt,
    counselorPerformance: {
      period: {
        academicYear: filters.academicYear,
        month: filters.month,
        dateRange: {
          from: filters.month ? `${filters.month}-01` : filters.from,
          to: filters.month
            ? new Date(Date.UTC(Number(filters.month.slice(0, 4)), Number(filters.month.slice(5, 7)), 0)).toISOString().slice(0, 10)
            : filters.to,
        },
        timezone: "Asia/Kolkata",
      },
      appliedFilters: {
        month: filters.month,
        from: filters.from,
        to: filters.to,
        academicYear: filters.academicYear,
        branch: filters.branch,
        counselor: filters.counselor,
        source: filters.source,
      },
      totalCounselors: counselors.length,
      counselors,
    },
  };
}