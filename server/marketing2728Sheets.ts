import { google } from "googleapis";
import { getGoogleRefreshToken } from "./googleCredentials";

export type SupplementLead = {
  enquiryDate: string;
  monthLabel: string;
  childName: string;
  phone: string;
  status: string;
  source: string;
  leadOwner: string;
  program: string;
};

export type SupplementMonth = {
  month: string;
  leads: number;
  bookings: number;
  walkins: number;
  admissions: number;
  closed: number;
  open: number;
};

export type SupplementResult = {
  leads: SupplementLead[];
  months: SupplementMonth[];
  fetchedAt: string | null;
  available: boolean;
  mode: "oauth" | "public" | "unavailable";
  warning?: string;
};

const SOURCES = {
  RPS: { spreadsheetId: "1cai6w40yIbCcAn6KvjrQomgu4BpBVh_yB00UqKaHEXA", dashboardGid: "853997856" },
  RIS: { spreadsheetId: "1YoMro8ypodwcleFc7PQ5JZ0FccycUm0h_VSeRxwpYhA", dashboardGid: "2097604776" },
} as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LOOKUP = new Map(MONTHS.flatMap((short, index) => [
  [short.toLowerCase(), index],
  [[
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ][index], index],
] as Array<[string, number]>));

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function headerKey(value: unknown): string {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function numberValue(value: unknown): number {
  const parsed = Number(clean(value).replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function normalizeDate(raw: string): { iso: string; month: string } | null {
  const value = clean(raw);
  let year: number;
  let month: number;
  let day: number;
  let match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    day = Number(match[1]);
    month = Number(match[2]) - 1;
    year = Number(match[3]);
  } else if ((match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {
    year = Number(match[1]);
    month = Number(match[2]) - 1;
    day = Number(match[3]);
  } else if ((match = value.match(/^(\d{1,2})[-\s]([A-Za-z]{3,9})[-\s](\d{2,4})$/))) {
    day = Number(match[1]);
    month = MONTH_LOOKUP.get(match[2].toLowerCase()) ?? -1;
    year = Number(match[3]);
    if (year < 100) year += 2000;
  } else {
    return null;
  }
  const date = new Date(Date.UTC(year, month, day));
  if (month < 0 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month || date.getUTCDate() !== day) return null;
  return {
    iso: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    month: `${MONTHS[month]}-${String(year).slice(-2)}`,
  };
}

export function parseLeadRows(rows: string[][]): SupplementLead[] {
  if (!rows.length) return [];
  const headers = rows[0].map(headerKey);
  const index = (...names: string[]) => names.map(headerKey).map(name => headers.indexOf(name)).find(i => i >= 0) ?? -1;
  const columns = {
    date: index("Date", "Enquiry Date"),
    child: index("Child's Name", "Child Name", "Student Name"),
    phone: index("Phone Number", "Phone", "Contact No"),
    status: index("Status"),
    source: index("Source"),
    owner: index("Lead Owner", "Counsellor Name"),
    program: index("Program", "Programme", "Grade"),
  };
  if (columns.date < 0 || columns.status < 0) throw new Error("CRM lead headers are not recognised");

  const leads: SupplementLead[] = [];
  for (const row of rows.slice(1)) {
    const parsedDate = normalizeDate(row[columns.date] ?? "");
    const rawStatus = clean(row[columns.status]).toUpperCase();
    // In the live tracker this value marks the start of the next academic-year
    // section. Stop rather than merely dropping the marker row, because later
    // rows can have ordinary statuses while still belonging to AY 2028-29.
    if (/^AY\s*28\s*[-–]\s*29$/.test(rawStatus)) break;
    if (!parsedDate) continue;
    const status = rawStatus
      .replace(/^WALKIN BOOKED$/, "WALK-IN BOOKED")
      .replace(/^WALKIN COMPLETED$/, "WALK-IN COMPLETED");
    leads.push({
      enquiryDate: parsedDate.iso,
      monthLabel: parsedDate.month,
      childName: clean(row[columns.child]),
      phone: clean(row[columns.phone]).replace(/\D/g, "").slice(-10),
      status,
      source: clean(row[columns.source]) || "Unknown",
      leadOwner: clean(row[columns.owner]),
      program: clean(row[columns.program]) || "Unknown",
    });
  }
  return leads;
}

export function parseDashboardRows(rows: string[][]): SupplementMonth[] {
  if (!rows.length) return [];
  const headers = rows[0].map(headerKey);
  const index = (name: string, after = -1) => headers.findIndex((header, i) => i > after && header === headerKey(name));
  const columns = {
    leads: index("Total Leads"),
    closed: index("Closed"),
    open: index("Open"),
    bookings: index("Bookings"),
    walkins: index("Walk-ins"),
    admissions: index("Admissions"),
  };
  if (columns.leads < 0) throw new Error("Dashboard headers are not recognised");
  const months: SupplementMonth[] = [];
  let reportingWindowStart: number | null = null;
  for (const row of rows.slice(1)) {
    if (row.some(cell => /^AY\s*28\s*[-–]\s*29$/i.test(clean(cell)))) break;
    const match = clean(row[0]).match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (!match) continue;
    const monthIndex = MONTH_LOOKUP.get(match[1].toLowerCase());
    if (monthIndex == null) continue;
    const ordinal = Number(match[2]) * 12 + monthIndex;
    if (reportingWindowStart == null) reportingWindowStart = ordinal;
    // A workbook is scoped to one academic-year cycle. This also protects the
    // dashboard if a later-year section is appended without a marker row.
    if (ordinal < reportingWindowStart || ordinal >= reportingWindowStart + 12) continue;
    months.push({
      month: `${MONTHS[monthIndex]}-${match[2].slice(-2)}`,
      leads: numberValue(row[columns.leads]),
      closed: numberValue(row[columns.closed]),
      open: numberValue(row[columns.open]),
      bookings: numberValue(row[columns.bookings]),
      walkins: numberValue(row[columns.walkins]),
      admissions: numberValue(row[columns.admissions]),
    });
  }
  return months;
}

async function readWithOAuth(brand: "RIS" | "RPS"): Promise<{ leads: string[][]; dashboard: string[][] }> {
  const refreshToken = getGoogleRefreshToken();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) throw new Error("Google access is not configured");
  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = SOURCES[brand].spreadsheetId;
  const [leadResponse, dashboardResponse] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: "'CRM Leads Tracker'!A:Z" }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: "'Eshan Sir Dashboard'!A:Z" }),
  ]);
  return {
    leads: (leadResponse.data.values ?? []) as string[][],
    dashboard: (dashboardResponse.data.values ?? []) as string[][],
  };
}

async function readPublicCsv(brand: "RIS" | "RPS"): Promise<{ leads: string[][]; dashboard: string[][] }> {
  const source = SOURCES[brand];
  const base = `https://docs.google.com/spreadsheets/d/${source.spreadsheetId}/gviz/tq`;
  const [leadResponse, dashboardResponse] = await Promise.all([
    fetch(`${base}?tqx=out:csv&sheet=${encodeURIComponent("CRM Leads Tracker")}`),
    fetch(`${base}?tqx=out:csv&gid=${source.dashboardGid}`),
  ]);
  if (!leadResponse.ok || !dashboardResponse.ok) throw new Error("Supplementary workbook is not accessible");
  return {
    leads: parseCsv(await leadResponse.text()),
    dashboard: parseCsv(await dashboardResponse.text()),
  };
}

export async function readMarketing2728Supplement(brand: "RIS" | "RPS"): Promise<SupplementResult> {
  if (process.env.NODE_ENV === "test") {
    return { leads: [], months: [], fetchedAt: null, available: false, mode: "unavailable" };
  }
  let rows: { leads: string[][]; dashboard: string[][] };
  let mode: SupplementResult["mode"] = "oauth";
  let oauthWarning: string | undefined;
  try {
    rows = await readWithOAuth(brand);
  } catch (error: any) {
    oauthWarning = `Authenticated Sheet access failed: ${error?.message ?? "unknown error"}`;
    try {
      rows = await readPublicCsv(brand);
      mode = "public";
    } catch (publicError: any) {
      return {
        leads: [], months: [], fetchedAt: null, available: false, mode: "unavailable",
        warning: `${oauthWarning}; read-only fallback failed: ${publicError?.message ?? "unknown error"}`,
      };
    }
  }
  try {
    return {
      leads: parseLeadRows(rows.leads),
      months: parseDashboardRows(rows.dashboard),
      fetchedAt: new Date().toISOString(),
      available: true,
      mode,
      warning: oauthWarning,
    };
  } catch (error: any) {
    return {
      leads: [], months: [], fetchedAt: null, available: false, mode: "unavailable",
      warning: `Supplementary data could not be parsed: ${error?.message ?? "unknown error"}`,
    };
  }
}

export function supplementLeadKey(lead: Pick<SupplementLead, "enquiryDate" | "phone" | "childName">): string {
  return [
    clean(lead.enquiryDate),
    clean(lead.phone).replace(/\D/g, "").slice(-10),
    clean(lead.childName).toLowerCase().replace(/\s+/g, " "),
  ].join("|");
}