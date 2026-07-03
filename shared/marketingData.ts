/* ═══════════════════════════════════════════════════════════════════
   Marketing dashboard data — single source of truth shared by:
     - client/src/pages/Marketing.tsx (UI)
     - server/routes.ts (token-protected JSON export at /api/marketing/export)
   When monthly numbers change, edit them HERE only.
   ═══════════════════════════════════════════════════════════════════ */

export const LAST_UPDATED = "Jul 3, 2026";
export const TODAY_DATE = 3;
export const DAYS_IN_MAY = 31;            // May 2026 — completed month (kept for LY comparisons)
export const DAYS_IN_CURRENT_MONTH = 31;  // July 2026 — current month (31 days)
export const MIN_REVENUE_PER_ADM = 90000;
export const MAY_IDX = 12;     // Jun 26 — last completed month, index in MONTHLY
export const CURRENT_IDX = 13; // Jul 26 — current in-progress month, index in MONTHLY

export type SegmentKey = "combined" | "ris" | "rps";
export type MetricSet = {
  leads: number;
  bookings: number;
  walkins: number;
  admissions: number;
  spend: number;
  meta: number;
  google: number;
};
export type MonthRow = {
  month: string;
  combined: MetricSet;
  ris: MetricSet;
  rps: MetricSet;
  freshWalkins?: number;
  risFreshWalkins?: number;
  rpsFreshWalkins?: number;
};

export const MONTHLY: MonthRow[] = [
  {
    // Jun 25 — pre-DM-team organic. Combined from DM Overall master sheet.
    month: "Jun 25",
    combined: { leads: 8,  bookings: 5,  walkins: 1,  admissions: 0, spend: 0, meta: 0, google: 0 },
    ris:      { leads: 7,  bookings: 4,  walkins: 1,  admissions: 0, spend: 0, meta: 0, google: 0 },
    rps:      { leads: 1,  bookings: 1,  walkins: 0,  admissions: 0, spend: 0, meta: 0, google: 0 },
  },
  {
    month: "Jul 25",
    combined: { leads: 4,  bookings: 3,  walkins: 4,  admissions: 0, spend: 0, meta: 0, google: 0 },
    ris:      { leads: 3,  bookings: 2,  walkins: 3,  admissions: 0, spend: 0, meta: 0, google: 0 },
    rps:      { leads: 1,  bookings: 1,  walkins: 1,  admissions: 0, spend: 0, meta: 0, google: 0 },
  },
  {
    month: "Aug 25",
    combined: { leads: 5,  bookings: 4,  walkins: 9,  admissions: 0, spend: 0, meta: 0, google: 0 },
    ris:      { leads: 4,  bookings: 3,  walkins: 7,  admissions: 0, spend: 0, meta: 0, google: 0 },
    rps:      { leads: 1,  bookings: 1,  walkins: 2,  admissions: 0, spend: 0, meta: 0, google: 0 },
  },
  {
    month: "Sep 25",
    combined: { leads: 20, bookings: 11, walkins: 15, admissions: 0, spend: 0, meta: 0, google: 0 },
    ris:      { leads: 15, bookings: 6,  walkins: 10, admissions: 0, spend: 0, meta: 0, google: 0 },
    rps:      { leads: 5,  bookings: 5,  walkins: 5,  admissions: 0, spend: 0, meta: 0, google: 0 },
  },
  {
    // Oct 25 — organic, no ad spend. School tab data (source of truth).
    month: "Oct 25",
    combined: { leads: 57,  bookings: 27, walkins: 42, admissions: 6,  spend: 0, meta: 0, google: 0 },
    ris:      { leads: 36,  bookings: 14, walkins: 25, admissions: 4,  spend: 0, meta: 0, google: 0 },
    rps:      { leads: 21,  bookings: 13, walkins: 17, admissions: 2,  spend: 0, meta: 0, google: 0 },
  },
  {
    // Nov 25 — organic, no ad spend. School tab data (source of truth).
    month: "Nov 25",
    combined: { leads: 103, bookings: 33, walkins: 68, admissions: 15, spend: 0, meta: 0, google: 0 },
    ris:      { leads: 69,  bookings: 19, walkins: 40, admissions: 8,  spend: 0, meta: 0, google: 0 },
    rps:      { leads: 34,  bookings: 14, walkins: 28, admissions: 7,  spend: 0, meta: 0, google: 0 },
  },
  {
    month: "Dec 25",
    combined: { leads: 455, bookings: 93,  walkins: 71,  admissions: 23, spend: 178604, meta: 100231, google: 78373 },
    ris:      { leads: 194, bookings: 35,  walkins: 26,  admissions: 4,  spend: 85496,  meta: 53977,  google: 31519 },
    rps:      { leads: 261, bookings: 58,  walkins: 45,  admissions: 19, spend: 93108,  meta: 46254,  google: 46854 },
  },
  {
    month: "Jan 26",
    combined: { leads: 895, bookings: 171, walkins: 125, admissions: 27, spend: 459906, meta: 248585, google: 211321 },
    ris:      { leads: 352, bookings: 58,  walkins: 39,  admissions: 8,  spend: 202555, meta: 107452, google: 95103 },
    rps:      { leads: 543, bookings: 113, walkins: 86,  admissions: 19, spend: 257351, meta: 141133, google: 116218 },
  },
  {
    month: "Feb 26",
    combined: { leads: 418, bookings: 115, walkins: 94,  admissions: 24, spend: 181038, meta: 60546,  google: 120492 },
    ris:      { leads: 180, bookings: 36,  walkins: 27,  admissions: 6,  spend: 54620,  meta: 8796,   google: 45824 },
    rps:      { leads: 238, bookings: 79,  walkins: 67,  admissions: 18, spend: 129285, meta: 51750,  google: 77535 },
  },
  {
    month: "Mar 26",
    combined: { leads: 498, bookings: 196, walkins: 121, admissions: 47, spend: 205317, meta: 71938,  google: 133379 },
    ris:      { leads: 211, bookings: 67,  walkins: 40,  admissions: 11, spend: 75051,  meta: 3011,   google: 72040 },
    rps:      { leads: 287, bookings: 130, walkins: 81,  admissions: 36, spend: 148955, meta: 68927,  google: 80028 },
  },
  {
    month: "Apr 26",
    combined: { leads: 380, bookings: 163, walkins: 91,  admissions: 28, spend: 192065, meta: 63842, google: 128223 },
    ris:      { leads: 174, bookings: 77,  walkins: 46,  admissions: 13, spend: 83801,  meta: 9996,  google: 73805 },
    rps:      { leads: 206, bookings: 86,  walkins: 45,  admissions: 15, spend: 108264, meta: 53846, google: 54418 },
  },
  {
    month: "May 26",
    combined: { leads: 313, bookings: 139, walkins: 85, admissions: 22, spend: 164434, meta: 46135, google: 118299 },
    ris:      { leads: 167, bookings: 78,  walkins: 53, admissions: 11, spend: 77004,  meta: 5459,  google: 71545 },
    rps:      { leads: 146, bookings: 61,  walkins: 32, admissions: 11, spend: 92434,  meta: 45680, google: 46754 },
  },
  {
    /* June 2026 — FINAL. Source: DM Overall master sheet (authoritative combined)
       + RIS/RPS CRM for per-school split. Locked via STATIC_ONLY_MONTHS. */
    month: "Jun 26",
    combined: { leads: 231, bookings: 126, walkins: 86, admissions: 32, spend: 64222, meta: 15185, google: 49037 },
    ris:      { leads: 68,  bookings: 47,  walkins: 15, admissions: 7,  spend: 32272, meta: 0,     google: 32272 },
    rps:      { leads: 150, bookings: 79,  walkins: 32, admissions: 10, spend: 31954, meta: 15189, google: 16765 },
  },
  {
    /* July 2026 — in progress (3 days captured as of Jul 3).
       Will be overridden by live API each load. */
    month: "Jul 26",
    combined: { leads: 0, bookings: 0, walkins: 0, admissions: 0, spend: 0, meta: 0, google: 0 },
    ris:      { leads: 0, bookings: 0, walkins: 0, admissions: 0, spend: 0, meta: 0, google: 0 },
    rps:      { leads: 0, bookings: 0, walkins: 0, admissions: 0, spend: 0, meta: 0, google: 0 },
  },
];

// All months Jun 25–Jun 26 are now individual rows in MONTHLY[].
// ORGANIC_PRE_SPEND is kept as zero so ytdFull totals = sum of all monthly rows.
export const ORGANIC_PRE_SPEND = {
  combined: { leads: 0, bookings: 0, walkins: 0, admissions: 0 },
  ris:      { leads: 0, bookings: 0, walkins: 0, admissions: 0 },
  rps:      { leads: 0, bookings: 0, walkins: 0, admissions: 0 },
};

export type LastYearRow = {
  month: string;
  ris: { spend: number; leads: number; walkins: number; admissions: number };
  rps: { spend: number; leads: number; walkins: number; admissions: number };
};

export const LAST_YEAR: LastYearRow[] = [
  { month: "Oct 24", ris: { spend: 13556, leads: 116, walkins: 40, admissions: 7 }, rps: { spend: 57147, leads: 78, walkins: 24, admissions: 12 } },
  { month: "Nov 24", ris: { spend: 15202, leads: 137, walkins: 49, admissions: 18 }, rps: { spend: 61853, leads: 96, walkins: 36, admissions: 13 } },
  { month: "Dec 24", ris: { spend: 19189, leads: 159, walkins: 54, admissions: 22 }, rps: { spend: 88738, leads: 158, walkins: 59, admissions: 20 } },
  { month: "Jan 25", ris: { spend: 56111, leads: 193, walkins: 73, admissions: 26 }, rps: { spend: 89510, leads: 160, walkins: 68, admissions: 25 } },
  { month: "Feb 25", ris: { spend: 15732, leads: 66, walkins: 40, admissions: 11 }, rps: { spend: 130200, leads: 62, walkins: 29, admissions: 12 } },
  { month: "Mar 25", ris: { spend: 200000, leads: 125, walkins: 36, admissions: 8 }, rps: { spend: 200000, leads: 122, walkins: 66, admissions: 14 } },
  { month: "Apr 25", ris: { spend: 150000, leads: 132, walkins: 35, admissions: 6 }, rps: { spend: 200000, leads: 147, walkins: 21, admissions: 14 } },
  { month: "May 25", ris: { spend: 56000, leads: 125, walkins: 53, admissions: 21 }, rps: { spend: 89050, leads: 83, walkins: 31, admissions: 16 } },
  { month: "Jun 25", ris: { spend: 5846, leads: 89, walkins: 31, admissions: 11 }, rps: { spend: 88595, leads: 114, walkins: 32, admissions: 14 } },
];

export const MAY_WEEKLY = [
  { week: "01/05 - 02/05", risLeads: 15, risAdm: 0, risWalk: 4, risBook: 6,  rpsLeads: 14, rpsAdm: 1, rpsWalk: 2, rpsBook: 6  },
  { week: "03/05 - 09/05", risLeads: 41, risAdm: 2, risWalk: 11, risBook: 18, rpsLeads: 39, rpsAdm: 3, rpsWalk: 7, rpsBook: 16 },
  { week: "10/05 - 16/05", risLeads: 40, risAdm: 3, risWalk: 11, risBook: 14, rpsLeads: 38, rpsAdm: 3, rpsWalk: 6, rpsBook: 12 },
  { week: "17/05 - 23/05", risLeads: 38, risAdm: 1, risWalk: 13, risBook: 24, rpsLeads: 36, rpsAdm: 2, rpsWalk: 8, rpsBook: 21 },
  { week: "24/05 - 31/05", risLeads: 25, risAdm: 5, risWalk: 14, risBook: 11, rpsLeads: 27, rpsAdm: 2, rpsWalk: 9, rpsBook: 11 },
];

export const SOCIAL = {
  ris: { instaFollowers: 5798,  fbFollowers: 9822,  ytViews: 5191, websiteClicks: 1512 },
  rps: { instaFollowers: 10742, fbFollowers: 12928, ytViews: 4076, websiteClicks: 431  },
};

export const DEFAULT_FIXED = {
  combined: { salary: 250000, crm: 0, overhead: 0 },
  ris:      { salary: 125000, crm: 0, overhead: 0 },
  rps:      { salary: 125000, crm: 0, overhead: 0 },
};

export type CrmRow = {
  centre: string;
  leads: number;
  bookings: number;
  walkins: number;
  admissions: number;
};

export const CRM_RPS: { month: string; rows: CrmRow[]; total: CrmRow }[] = [
  { month: "Jan 26", rows: [
    { centre: "Aggarwal",      leads: 84,  bookings: 27, walkins: 24, admissions: 7 },
    { centre: "Anand Nagar",   leads: 25,  bookings: 4,  walkins: 1,  admissions: 0 },
    { centre: "Kasarvadavali", leads: 22,  bookings: 9,  walkins: 6,  admissions: 0 },
    { centre: "Hariniwas",     leads: 70,  bookings: 19, walkins: 11, admissions: 3 },
    { centre: "Dhokali",       leads: 52,  bookings: 24, walkins: 19, admissions: 3 },
    { centre: "Kalwa",         leads: 68,  bookings: 14, walkins: 9,  admissions: 4 },
    { centre: "Unassigned",    leads: 222, bookings: 0,  walkins: 0,  admissions: 0 },
  ], total: { centre: "Total", leads: 543, bookings: 97,  walkins: 70, admissions: 17 } },
  { month: "Feb 26", rows: [
    { centre: "Aggarwal",      leads: 39, bookings: 13, walkins: 9, admissions: 6 },
    { centre: "Anand Nagar",   leads: 18, bookings: 9,  walkins: 6, admissions: 2 },
    { centre: "Kasarvadavali", leads: 24, bookings: 16, walkins: 8, admissions: 3 },
    { centre: "Hariniwas",     leads: 49, bookings: 14, walkins: 9, admissions: 6 },
    { centre: "Dhokali",       leads: 21, bookings: 12, walkins: 7, admissions: 3 },
    { centre: "Kalwa",         leads: 36, bookings: 13, walkins: 7, admissions: 2 },
    { centre: "Unassigned",    leads: 51, bookings: 0,  walkins: 0, admissions: 0 },
  ], total: { centre: "Total", leads: 238, bookings: 77, walkins: 46, admissions: 22 } },
  { month: "Mar 26", rows: [
    { centre: "Aggarwal",      leads: 71, bookings: 24, walkins: 14, admissions: 8 },
    { centre: "Anand Nagar",   leads: 32, bookings: 14, walkins: 7,  admissions: 4 },
    { centre: "Kasarvadavali", leads: 23, bookings: 7,  walkins: 5,  admissions: 2 },
    { centre: "Hariniwas",     leads: 55, bookings: 21, walkins: 10, admissions: 4 },
    { centre: "Dhokali",       leads: 37, bookings: 18, walkins: 8,  admissions: 4 },
    { centre: "Kalwa",         leads: 61, bookings: 25, walkins: 15, admissions: 5 },
    { centre: "Unassigned",    leads: 7,  bookings: 0,  walkins: 0,  admissions: 0 },
  ], total: { centre: "Total", leads: 286, bookings: 109, walkins: 59, admissions: 27 } },
  { month: "Apr 26", rows: [
    { centre: "Aggarwal",      leads: 40, bookings: 22, walkins: 9, admissions: 2 },
    { centre: "Anand Nagar",   leads: 15, bookings: 6,  walkins: 2, admissions: 1 },
    { centre: "Kasarvadavali", leads: 24, bookings: 10, walkins: 3, admissions: 2 },
    { centre: "Hariniwas",     leads: 34, bookings: 19, walkins: 6, admissions: 3 },
    { centre: "Dhokali",       leads: 26, bookings: 12, walkins: 1, admissions: 0 },
    { centre: "Kalwa",         leads: 37, bookings: 15, walkins: 4, admissions: 1 },
    { centre: "Unassigned",    leads: 0,  bookings: 0,  walkins: 0, admissions: 0 },
  ], total: { centre: "Total", leads: 176, bookings: 84, walkins: 25, admissions: 9 } },
];
