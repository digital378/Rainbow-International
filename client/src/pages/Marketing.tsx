import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════
   DATA LAYER — easily replaceable with API/Sheets later
   ═══════════════════════════════════════════════════════════════════ */

const LAST_UPDATED = "April 30, 2026";
const TODAY_DATE = 30;
const DAYS_IN_APRIL = 30;
const MIN_REVENUE_PER_ADM = 90000;

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", CYAN = "#0891b2", PURPLE = "#7c3aed", SLATE = "#475569";

type SegmentKey = "combined" | "ris" | "rps";
type MetricSet = { leads: number; bookings: number; walkins: number; admissions: number; spend: number; meta: number; google: number; };
type MonthRow = { month: string; combined: MetricSet; ris: MetricSet; rps: MetricSet; };

/* AUTHORITATIVE monthly data straight from the source sheets:
   - Combined values from "DM Overall ROI Analysis" sheet
   - RIS values from "DM RIS April'26" sheet  
   - RPS values from "DM RPS April'26" sheet
   April per-branch spend back-calculated from the sheet's published True CPA
   (RIS True CPA ₹19,224, RPS True CPA ₹18,012 — both at ₹1.25L/mo salary).
   Note: branch sums may not exactly equal Combined for some months due to
   minor source-sheet reconciliation gaps; we keep both as-published. */

/* Convenience aliases for components that read April per-branch directly */
const APRIL_IDX = 4;

const MONTHLY: MonthRow[] = [
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
    combined: { leads: 357, bookings: 147, walkins: 91,  admissions: 28, spend: 176754, meta: 55758, google: 120996 },
    ris:      { leads: 162, bookings: 68,  walkins: 45,  admissions: 13, spend: 79364,  meta: 8776,  google: 70588 },
    rps:      { leads: 195, bookings: 79,  walkins: 46,  admissions: 15, spend: 97390,  meta: 46982, google: 50408 },
  },
];

const APRIL_RIS_BASE = MONTHLY[APRIL_IDX].ris;
const APRIL_RPS_BASE = MONTHLY[APRIL_IDX].rps;

/* Pre-spend organic admissions Jun – Nov 2025 (no marketing investment).
   These reconcile the 5-month "ad-spend window" with the sheet's full-AY
   "TOTAL TILL DATE" of 170 admissions. */
const ORGANIC_PRE_SPEND = {
  combined: { leads: 197, admissions: 21 },  // Jun–Nov: 8+4+5+20+57+103 = 197 leads, 6 (Oct) + 15 (Nov) = 21 adm
  ris:      { leads: 134, admissions: 12 },  // Jun–Nov RIS: 134 leads, 4 (Oct) + 8 (Nov) = 12 adm
  rps:      { leads:  63, admissions:  9 },  // Jun–Nov RPS: 63 leads, 2 (Oct) + 7 (Nov) = 9 adm
};

/* Last year (Oct 24 – Jun 25) — real RIS/RPS splits from sheet */
const LAST_YEAR: { month: string; ris: { spend: number; leads: number; walkins: number; admissions: number }; rps: { spend: number; leads: number; walkins: number; admissions: number } }[] = [
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

const APRIL_WEEKLY = [
  { week: "01–04 Apr", risLeads: 18, risAdm: 3, risWalk: 6,  risBook: 7,  rpsLeads: 36, rpsAdm: 3, rpsWalk: 12, rpsBook: 18 },
  { week: "05–11 Apr", risLeads: 37, risAdm: 3, risWalk: 11, risBook: 15, rpsLeads: 60, rpsAdm: 4, rpsWalk: 15, rpsBook: 32 },
  { week: "12–18 Apr", risLeads: 48, risAdm: 4, risWalk: 11, risBook: 17, rpsLeads: 38, rpsAdm: 4, rpsWalk: 8,  rpsBook: 10 },
  { week: "19–25 Apr", risLeads: 47, risAdm: 3, risWalk: 13, risBook: 20, rpsLeads: 46, rpsAdm: 3, rpsWalk: 8,  rpsBook: 16 },
  { week: "26–30 Apr", risLeads: 12, risAdm: 0, risWalk: 4,  risBook: 9,  rpsLeads: 15, rpsAdm: 1, rpsWalk: 3,  rpsBook: 3  },
];

const SOCIAL = {
  ris: { instaFollowers: 5693,  fbFollowers: 9842,  ytViews: 8354, websiteClicks: 486 },
  rps: { instaFollowers: 10488, fbFollowers: 12945, ytViews: 9897, websiteClicks: 91 },
};

/* Default fixed monthly costs (per source sheet: salary line = ₹1.25L/branch/mo).
   Sheet treats this as a single fixed cost; CRM & overhead default to 0 but
   remain editable in What-If for scenario modelling. */
const DEFAULT_FIXED = {
  combined: { salary: 250000, crm: 0, overhead: 0 },   // ₹2,50,000/mo (₹1.25L × 2 branches)
  ris:      { salary: 125000, crm: 0, overhead: 0 },   // ₹1,25,000/mo
  rps:      { salary: 125000, crm: 0, overhead: 0 },   // ₹1,25,000/mo
};

/* CRM Branch Performance — RPS centre-wise breakdown (Jan – Apr 2026)
   Source: RPS sheet "Centre-wise Lead Distribution".
   RIS operates a single centre (Brahmand) so no breakdown is shown for it. */
type CrmRow = { centre: string; leads: number; bookings: number; walkins: number; admissions: number };
const CRM_RPS: { month: string; rows: CrmRow[]; total: CrmRow }[] = [
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

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const pct = (n: number) => `${n.toFixed(1)}%`;

const TICK = { fontSize: 11, fill: "#6b7280" };

function deltaArrow(curr: number, prev: number) {
  if (prev === 0) return { sign: "▲", val: "—", positive: true, raw: 0 };
  const d = ((curr - prev) / prev) * 100;
  return { sign: d >= 0 ? "▲" : "▼", val: `${Math.abs(d).toFixed(1)}%`, positive: d >= 0, raw: d };
}

function getSegment(row: MonthRow, segment: SegmentKey): MetricSet {
  return row[segment];
}

function totalsFor(rows: MonthRow[], segment: SegmentKey) {
  return rows.reduce((acc, r) => {
    const s = getSegment(r, segment);
    return {
      leads: acc.leads + s.leads, bookings: acc.bookings + s.bookings, walkins: acc.walkins + s.walkins,
      admissions: acc.admissions + s.admissions, spend: acc.spend + s.spend, meta: acc.meta + s.meta, google: acc.google + s.google,
    };
  }, { leads: 0, bookings: 0, walkins: 0, admissions: 0, spend: 0, meta: 0, google: 0 });
}

/* CPA = spend / adm  ;  TrueCPA = (spend + fixedCost*months) / adm */
const cpa = (spend: number, adm: number) => adm > 0 ? spend / adm : 0;
const trueCpa = (spend: number, adm: number, monthlyFixed: number, months: number) =>
  adm > 0 ? (spend + monthlyFixed * months) / adm : 0;
const cpl = (spend: number, leads: number) => leads > 0 ? spend / leads : 0;
const cpw = (spend: number, walkins: number) => walkins > 0 ? spend / walkins : 0;
const cpb = (spend: number, bookings: number) => bookings > 0 ? spend / bookings : 0;
const roi = (rev: number, cost: number) => cost > 0 ? ((rev - cost) / cost) * 100 : 0;

/* ═══════════════════════════════════════════════════════════════════
   UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function KpiCard({ label, value, sub, color = NAVY, deltaText, deltaPositive, tooltip }: {
  label: string; value: string; sub?: string; color?: string; deltaText?: string; deltaPositive?: boolean; tooltip?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1 relative group">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
        {label}
        {tooltip && <span className="cursor-help text-gray-300" title={tooltip}>ⓘ</span>}
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-xl font-black mt-0.5" style={{ color }}>{value}</div>
        {deltaText && (
          <span className={`text-[11px] font-bold ${deltaPositive ? "text-green-600" : "text-red-500"}`}>
            {deltaPositive ? "▲" : "▼"} {deltaText}
          </span>
        )}
      </div>
      {sub && <div className="text-[11px] text-gray-500">{sub}</div>}
    </div>
  );
}

function SectionTitle({ title, sub, badge }: { title: string; sub?: string; badge?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-lg font-black text-[#091a4f]">{title}</h2>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {badge && <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded-md">{badge}</span>}
    </div>
  );
}

function SegmentToggle({ value, onChange }: { value: SegmentKey; onChange: (s: SegmentKey) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border-2 border-amber-400 text-xs shadow-sm" data-testid="segment-toggle">
      {([
        { key: "combined" as SegmentKey, label: "COMBINED" },
        { key: "ris" as SegmentKey, label: "RIS" },
        { key: "rps" as SegmentKey, label: "RPS" },
      ]).map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`px-4 py-2 font-black uppercase tracking-wider transition-colors ${
            value === opt.key ? "text-[#091a4f] bg-amber-400" : "text-white bg-transparent hover:bg-white/10"
          }`}
          data-testid={`button-segment-${opt.key}`}
        >{opt.label}</button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════════ */

export default function Marketing() {
  const [segment, setSegment] = useState<SegmentKey>("combined");
  const [chartTab, setChartTab] = useState<"leads" | "spend" | "roi" | "truecpa" | "funnel">("leads");
  const [weeklyTab, setWeeklyTab] = useState<SegmentKey>("combined");
  const [calcSpend, setCalcSpend] = useState<number>(100000);
  const [calcMonth, setCalcMonth] = useState<string>("Apr 26");
  const [includeSalary, setIncludeSalary] = useState<boolean>(true);

  /* Editable cost inputs — initialized from segment defaults */
  const [salaryCost, setSalaryCost] = useState<number>(DEFAULT_FIXED.combined.salary);
  const [crmCost, setCrmCost] = useState<number>(DEFAULT_FIXED.combined.crm);
  const [overheadCost, setOverheadCost] = useState<number>(DEFAULT_FIXED.combined.overhead);
  const [teamSize, setTeamSize] = useState<number>(1);

  /* Brochure download requests (Brand Partners privilege card leads).
     Public GET response only exposes id/cardNumber/requestedAt — name/phone/email
     are stored server-side but only returned to admin-token callers. */
  type BrochureReq = { id: string; cardNumber: string; requestedAt: string };
  const [brochureReqs, setBrochureReqs] = useState<BrochureReq[]>([]);
  const [brochureLoading, setBrochureLoading] = useState<boolean>(true);

  useEffect(() => {
    document.title = "Marketing Dashboard | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBrochureLoading(true);
    fetch("/api/brochure-requests")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: BrochureReq[]) => {
        if (!cancelled) setBrochureReqs(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancelled) setBrochureReqs([]); })
      .finally(() => { if (!cancelled) setBrochureLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* Reset cost inputs when segment changes */
  useEffect(() => {
    const def = DEFAULT_FIXED[segment];
    setSalaryCost(def.salary); setCrmCost(def.crm); setOverheadCost(def.overhead);
  }, [segment]);

  const monthlyFixed = salaryCost + crmCost + overheadCost;

  /* ── Memoized derived datasets ── */
  const segmentRows = useMemo(() => MONTHLY.map(m => ({ month: m.month, ...getSegment(m, segment) })), [segment]);
  const totals = useMemo(() => totalsFor(MONTHLY, segment), [segment]);
  const totalMonths = MONTHLY.length;

  const totalsLastYearSegment = useMemo(() => {
    if (segment === "combined") {
      return LAST_YEAR.reduce((a, r) => ({ spend: a.spend + r.ris.spend + r.rps.spend, leads: a.leads + r.ris.leads + r.rps.leads, walkins: a.walkins + r.ris.walkins + r.rps.walkins, admissions: a.admissions + r.ris.admissions + r.rps.admissions }), { spend: 0, leads: 0, walkins: 0, admissions: 0 });
    }
    return LAST_YEAR.reduce((a, r) => {
      const v = r[segment as "ris" | "rps"];
      return { spend: a.spend + v.spend, leads: a.leads + v.leads, walkins: a.walkins + v.walkins, admissions: a.admissions + v.admissions };
    }, { spend: 0, leads: 0, walkins: 0, admissions: 0 });
  }, [segment]);

  const social = useMemo(() => {
    if (segment === "ris") return { instaFollowers: SOCIAL.ris.instaFollowers, fbFollowers: SOCIAL.ris.fbFollowers, ytViews: SOCIAL.ris.ytViews, websiteClicks: SOCIAL.ris.websiteClicks };
    if (segment === "rps") return { instaFollowers: SOCIAL.rps.instaFollowers, fbFollowers: SOCIAL.rps.fbFollowers, ytViews: SOCIAL.rps.ytViews, websiteClicks: SOCIAL.rps.websiteClicks };
    return { instaFollowers: SOCIAL.ris.instaFollowers + SOCIAL.rps.instaFollowers, fbFollowers: SOCIAL.ris.fbFollowers + SOCIAL.rps.fbFollowers, ytViews: SOCIAL.ris.ytViews + SOCIAL.rps.ytViews, websiteClicks: SOCIAL.ris.websiteClicks + SOCIAL.rps.websiteClicks };
  }, [segment]);

  const current = segmentRows[4]; // April
  const previous = segmentRows[3]; // March

  /* April last year (index 6 = "Apr 25" in LAST_YEAR) */
  const aprilLastYear = useMemo(() => {
    const ly = LAST_YEAR[6]; // Apr 25
    if (segment === "combined") return { spend: ly.ris.spend + ly.rps.spend, leads: ly.ris.leads + ly.rps.leads, walkins: ly.ris.walkins + ly.rps.walkins, admissions: ly.ris.admissions + ly.rps.admissions, bookings: 0 };
    return { ...ly[segment as "ris" | "rps"], bookings: 0 };
  }, [segment]);

  /* TY Oct–Apr totals: Oct/Nov 25 had ₹0 spend & 0 tracked digital leads; admissions from ORGANIC_PRE_SPEND oct+nov */
  const TY_OCT_NOV_ADM = { combined: 21, ris: 12, rps: 9 }; // oct+nov 25 organic adm per segment
  const tyOctAprTotals = useMemo(() => {
    const dec_apr = totalsFor(MONTHLY, segment); // Dec 25 – Apr 26 (all 5 rows)
    return {
      leads:       dec_apr.leads,       // Oct/Nov digital leads untracked; Dec-Apr only
      walkins:     dec_apr.walkins,     // same
      admissions:  dec_apr.admissions + TY_OCT_NOV_ADM[segment], // add organic Oct+Nov adm
      spend:       dec_apr.spend,       // Oct/Nov had ₹0 ad spend
    };
  }, [segment]);

  /* LY Oct–Apr totals (LAST_YEAR indices 0–6: Oct 24 → Apr 25) */
  const lyOctAprTotals = useMemo(() => {
    const slice = LAST_YEAR.slice(0, 7); // Oct 24 → Apr 25
    if (segment === "combined") return slice.reduce((a, r) => ({
      spend:      a.spend      + r.ris.spend      + r.rps.spend,
      leads:      a.leads      + r.ris.leads      + r.rps.leads,
      walkins:    a.walkins    + r.ris.walkins    + r.rps.walkins,
      admissions: a.admissions + r.ris.admissions + r.rps.admissions,
    }), { spend: 0, leads: 0, walkins: 0, admissions: 0 });
    return slice.reduce((a, r) => {
      const v = r[segment as "ris" | "rps"];
      return { spend: a.spend + v.spend, leads: a.leads + v.leads, walkins: a.walkins + v.walkins, admissions: a.admissions + v.admissions };
    }, { spend: 0, leads: 0, walkins: 0, admissions: 0 });
  }, [segment]);

  /* Full-AY totals (reconciled with sheet's TOTAL TILL DATE) */
  const organic = ORGANIC_PRE_SPEND[segment];
  const ytdAdmissionsFull = totals.admissions + organic.admissions;
  const ytdLeadsFull = totals.leads + organic.leads;
  /* All efficiency metrics use the full-AY admissions denominator (160 combined) */
  const admForCosts = ytdAdmissionsFull;

  /* Conversion funnel rates */
  const funnelData = [
    { name: "Leads", value: totals.leads, fill: NAVY },
    { name: "Bookings", value: totals.bookings, fill: PURPLE },
    { name: "Walk-ins", value: totals.walkins, fill: CYAN },
    { name: "Admissions", value: totals.admissions, fill: GREEN },
  ];
  const leadToWalk = ytdLeadsFull ? (totals.walkins / ytdLeadsFull) * 100 : 0;
  const walkToAdm = totals.walkins ? (ytdAdmissionsFull / totals.walkins) * 100 : 0;
  const bookToAdm = totals.bookings ? (ytdAdmissionsFull / totals.bookings) * 100 : 0;

  /* YTD totals using full-AY admissions (matches sheet's CPA ₹6,960 / True CPA ₹14,772) */
  const ytdRevenue = admForCosts * MIN_REVENUE_PER_ADM;
  const ytdMarketingCpa = cpa(totals.spend, admForCosts);
  const ytdTrueCpa = trueCpa(totals.spend, admForCosts, monthlyFixed, totalMonths);
  const ytdMarketingRoi = roi(ytdRevenue, totals.spend);
  const ytdTrueRoi = roi(ytdRevenue, totals.spend + monthlyFixed * totalMonths);

  /* April Forecast */
  const fcMul = DAYS_IN_APRIL / TODAY_DATE;
  const forecast = {
    leads: Math.round(current.leads * fcMul), walkins: Math.round(current.walkins * fcMul),
    admissions: Math.round(current.admissions * fcMul), spend: Math.round(current.spend * fcMul),
    bookings: Math.round(current.bookings * fcMul),
  };
  const fcMarketingCpa = cpa(forecast.spend, forecast.admissions);
  const fcTrueCpa = trueCpa(forecast.spend, forecast.admissions, monthlyFixed, 1);
  const fcRevenue = forecast.admissions * MIN_REVENUE_PER_ADM;
  const fcTrueRoi = roi(fcRevenue, forecast.spend + monthlyFixed);
  const fcConfidence = TODAY_DATE < 10 ? "Low" : TODAY_DATE < 22 ? "Medium" : "High";
  const trendDirection = current.cpa < previous.spend / Math.max(previous.admissions, 1)
    ? "Improving" : "Declining";
  void trendDirection; // suppress unused

  /* Per-row CPA helpers for charts */
  const monthlyForCharts = useMemo(() => segmentRows.map(r => ({
    month: r.month,
    leads: r.leads, walkins: r.walkins, admissions: r.admissions, bookings: r.bookings,
    spend: r.spend, meta: r.meta, google: r.google,
    cpl: cpl(r.spend, r.leads),
    cpw: cpw(r.spend, r.walkins),
    cpa: cpa(r.spend, r.admissions),
    trueCpa: trueCpa(r.spend, r.admissions, monthlyFixed, 1),
    roi: roi(r.admissions * MIN_REVENUE_PER_ADM, r.spend),
    trueRoi: roi(r.admissions * MIN_REVENUE_PER_ADM, r.spend + monthlyFixed),
  })), [segmentRows, monthlyFixed]);

  /* What-If Calculator */
  const calcMonthData = monthlyForCharts.find(m => m.month === calcMonth) || monthlyForCharts[4];
  const calcResults = useMemo(() => {
    if (!calcSpend || calcSpend <= 0) return { leads: 0, walkins: 0, admissions: 0, bookings: 0, revenue: 0, marketingRoi: 0, trueRoi: 0, marketingCpa: 0, trueCpa: 0 };
    const leads = calcSpend / calcMonthData.cpl;
    const walkins = calcSpend / calcMonthData.cpw;
    const admissions = calcSpend / calcMonthData.cpa;
    const bookings = leads * (calcMonthData.bookings / Math.max(calcMonthData.leads, 1));
    const revenue = admissions * MIN_REVENUE_PER_ADM;
    const fixedCostThisMonth = includeSalary ? monthlyFixed : 0;
    return {
      leads, walkins, admissions, bookings, revenue,
      marketingRoi: roi(revenue, calcSpend),
      trueRoi: roi(revenue, calcSpend + fixedCostThisMonth),
      marketingCpa: cpa(calcSpend, admissions),
      trueCpa: admissions > 0 ? (calcSpend + fixedCostThisMonth) / admissions : 0,
    };
  }, [calcSpend, calcMonthData, monthlyFixed, includeSalary]);

  /* MoM deltas helper */
  const mom = (curr: number, prev: number) => deltaArrow(curr, prev);

  /* Dynamic Insights */
  const insights = useMemo(() => {
    const arr: { severity: "critical" | "warning" | "opportunity"; title: string; body: string }[] = [];

    /* True vs Marketing CPA gap */
    const cpaGap = ytdMarketingCpa > 0 ? ((ytdTrueCpa - ytdMarketingCpa) / ytdMarketingCpa) * 100 : 0;
    if (cpaGap > 30) {
      arr.push({ severity: "critical", title: "True CPA is significantly higher than Marketing CPA",
        body: `True CPA (${inr(ytdTrueCpa)}) is ${cpaGap.toFixed(0)}% higher than Marketing CPA (${inr(ytdMarketingCpa)}). Hidden operational costs are eroding ROI. Audit team productivity and overhead allocation.` });
    } else if (cpaGap > 0) {
      arr.push({ severity: "opportunity", title: "True CPA close to Marketing CPA",
        body: `Healthy gap: True CPA is only ${cpaGap.toFixed(0)}% above Marketing CPA. Operational efficiency is good — focus on scaling spend.` });
    }

    /* Best vs worst month */
    const bestRoi = monthlyForCharts.reduce((a, b) => b.roi > a.roi ? b : a);
    arr.push({ severity: "opportunity", title: `${bestRoi.month} delivered best ROI`,
      body: `${bestRoi.month} achieved ${bestRoi.roi.toFixed(0)}% ROI with ${bestRoi.admissions} admissions on ${inr(bestRoi.spend)} spend. Lowest CPA: ${inr(bestRoi.cpa)}. Replicate this campaign mix.` });

    const worstCpa = monthlyForCharts.reduce((a, b) => b.cpa > a.cpa ? b : a);
    arr.push({ severity: "critical", title: `${worstCpa.month} had worst cost efficiency`,
      body: `${worstCpa.month} CPA spiked to ${inr(worstCpa.cpa)} (${worstCpa.admissions} admissions on ${inr(worstCpa.spend)}). Audit creative quality and targeting.` });

    /* Channel inefficiency */
    const totalMeta = totals.meta, totalGoogle = totals.google;
    const metaShare = totals.spend > 0 ? (totalMeta / totals.spend) * 100 : 0;
    if (totalGoogle > totalMeta * 1.3) {
      arr.push({ severity: "warning", title: "Google dominates spend — Meta under-invested",
        body: `Google = ${(100 - metaShare).toFixed(0)}% of YTD ad budget vs Meta ${metaShare.toFixed(0)}%. Meta historically delivers lower CPL — consider rebalancing 50/50.` });
    }

    /* Conversion funnel drop-offs */
    if (leadToWalk < 30) {
      arr.push({ severity: "warning", title: "Low Lead → Walk-in conversion",
        body: `Only ${leadToWalk.toFixed(1)}% of leads converted to walk-ins. CRM/calling team needs to improve follow-up cadence. Industry benchmark: 30-40%.` });
    }
    if (walkToAdm < 25) {
      arr.push({ severity: "warning", title: "Walk-in → Admission gap",
        body: `Only ${walkToAdm.toFixed(1)}% of walk-ins converted to admissions. Tour script, fee discussion, or campus experience may need refinement.` });
    } else {
      arr.push({ severity: "opportunity", title: "Strong on-campus conversion",
        body: `${walkToAdm.toFixed(1)}% of walk-ins convert to admissions — above industry standard. Focus on driving more walk-ins to multiply admissions.` });
    }

    /* April pace — only show when month is still running */
    if (TODAY_DATE < DAYS_IN_APRIL && forecast.leads < previous.leads * 0.95) {
      arr.push({ severity: "warning", title: "April tracking below March",
        body: `Forecasted April leads (${num(forecast.leads)}) projected below March (${num(previous.leads)}). Boost spend or refresh creatives in remaining ${DAYS_IN_APRIL - TODAY_DATE} days.` });
    }

    /* YoY growth */
    if (totalsLastYearSegment.admissions > 0) {
      const yoyGrowth = ((totals.admissions - totalsLastYearSegment.admissions / 9 * 5) / (totalsLastYearSegment.admissions / 9 * 5)) * 100;
      arr.push({ severity: yoyGrowth > 0 ? "opportunity" : "warning",
        title: `YoY admissions ${yoyGrowth > 0 ? "growth" : "decline"}: ${Math.abs(yoyGrowth).toFixed(0)}%`,
        body: `This year (${segment.toUpperCase()}) admissions per month avg: ${(totals.admissions / 5).toFixed(1)} vs last year ${(totalsLastYearSegment.admissions / 9).toFixed(1)}. Marketing efficiency is ${yoyGrowth > 0 ? "improving" : "regressing"}.` });
    }

    /* RIS vs RPS specific */
    if (segment === "combined") {
      const aprilRis = APRIL_RIS_BASE, aprilRps = APRIL_RPS_BASE;
      const risConv = (aprilRis.admissions / aprilRis.leads) * 100;
      const rpsConv = (aprilRps.admissions / aprilRps.leads) * 100;
      if (Math.abs(risConv - rpsConv) > 1) {
        const winner = risConv > rpsConv ? "RIS" : "RPS";
        arr.push({ severity: "opportunity", title: `${winner} converting better in April`,
          body: `RIS conversion: ${risConv.toFixed(1)}% vs RPS: ${rpsConv.toFixed(1)}%. Study ${winner} tour/calling process and replicate for the other branch.` });
      }
    }

    return arr;
  }, [monthlyForCharts, totals, ytdMarketingCpa, ytdTrueCpa, leadToWalk, walkToAdm, forecast, previous, totalsLastYearSegment, segment]);

  const segmentLabel = segment === "ris" ? "RIS only" : segment === "rps" ? "RPS only" : "Combined RIS + RPS";
  const segmentColor = segment === "ris" ? NAVY : segment === "rps" ? CYAN : NAVY;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* ─── Top Bar ─── */}
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-sm">RIS</div>
          <div>
            <div className="font-black text-lg leading-tight tracking-tight">Marketing Performance Dashboard</div>
            <div className="text-xs text-blue-200">Rainbow International School &amp; Preschool — Internal Use Only</div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <div className="text-right"><div className="text-blue-200 uppercase tracking-wider">Academic Year</div><div className="font-black text-sm">2026 – 27</div></div>
          <div className="text-right"><div className="text-blue-200 uppercase tracking-wider">Last Updated</div><div className="font-black text-sm">{LAST_UPDATED}</div></div>
          <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">Confidential</span>
        </div>
      </div>

      {/* ─── Sticky Segment Toggle ─── */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-[#091a4f]/95 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">View:</span>
          <SegmentToggle value={segment} onChange={setSegment} />
          <span className="text-xs text-blue-200">Showing: <strong className="text-white">{segmentLabel}</strong></span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-blue-200">
          <span>True CPA includes salaries + CRM + overhead ({inr(monthlyFixed)}/mo)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ───────── 1. PRIMARY KPI ROW ───────── */}
        <section>
          <SectionTitle title={`Year-to-Date Performance (${segmentLabel})`} sub="Full AY 2025–26 (Jun 2025 – Apr 30, 2026)" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Total Leads" value={num(ytdLeadsFull)} sub={`${(ytdLeadsFull / 11).toFixed(0)} avg/month`} color={NAVY} />
            <KpiCard label="Total Bookings" value={num(totals.bookings)} sub={`${pct((totals.bookings / Math.max(totals.leads, 1)) * 100)} of leads`} color={PURPLE} />
            <KpiCard label="Total Walk-ins" value={num(totals.walkins)} sub={`${pct(leadToWalk)} of leads`} color={CYAN} />
            <KpiCard label="Total Admissions" value={num(ytdAdmissionsFull)} sub={`${pct(walkToAdm)} of walk-ins`} color={GREEN} />
            <KpiCard label="Marketing Spend" value={inr(totals.spend)} sub="Meta + Google" color={RED} />
            <KpiCard label="Min. ROI (Mktg)" value={`${ytdMarketingRoi.toFixed(0)}%`} sub={`True ROI: ${ytdTrueRoi.toFixed(0)}%`} color={GREEN} />
          </div>
        </section>

        {/* ───────── 2. CPA DUAL METRIC + EFFICIENCY ───────── */}
        <section>
          <SectionTitle title="Cost Efficiency Metrics — Year-to-Date" sub={`Full AY 2025–26 totals · Marketing CPA = ad spend ÷ ${num(admForCosts)} admissions · True CPA also includes salaries`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="CPA (Marketing)" value={inr(ytdMarketingCpa)} sub={`${inr(totals.spend)} ÷ ${num(admForCosts)} adm`} color={NAVY} tooltip="Total Meta + Google ad spend ÷ total admissions" />
            <KpiCard label="CPA (True)" value={inr(ytdTrueCpa)} sub={`+${(((ytdTrueCpa / Math.max(ytdMarketingCpa, 1)) - 1) * 100).toFixed(0)}% over marketing CPA`} color={RED} tooltip="(Ad spend + salaries × months) ÷ admissions" />
            <KpiCard label="Cost per Lead" value={inr(cpl(totals.spend, totals.leads))} sub="ad spend / leads" color={PURPLE} />
            <KpiCard label="Cost per Booking" value={inr(cpb(totals.spend, totals.bookings))} sub="ad spend / bookings" color={AMBER} />
            <KpiCard label="Cost per Walk-in" value={inr(cpw(totals.spend, totals.walkins))} sub="ad spend / walk-ins" color={CYAN} />
            <KpiCard label="Walk-in → Adm" value={pct(walkToAdm)} sub={`${num(admForCosts)} of ${num(totals.walkins)} walk-ins`} color={GREEN} />
          </div>
        </section>

        {/* ───────── 3. MoM Comparison ───────── */}
        <section>
          <SectionTitle title="Month-over-Month Comparison" sub="April 2026 (final) vs March 2026 (final)" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Leads", curr: current.leads, prev: previous.leads, format: num, color: NAVY },
              { label: "Walk-ins", curr: current.walkins, prev: previous.walkins, format: num, color: CYAN },
              { label: "Admissions", curr: current.admissions, prev: previous.admissions, format: num, color: GREEN },
              { label: "Marketing Spend", curr: current.spend, prev: previous.spend, format: inr, color: RED, invert: true },
              { label: "Marketing CPA", curr: cpa(current.spend, current.admissions), prev: cpa(previous.spend, previous.admissions), format: inr, color: PURPLE, invert: true },
              { label: "Cost per Lead (CPL)", curr: cpl(current.spend, current.leads), prev: cpl(previous.spend, previous.leads), format: inr, color: BLUE, invert: true },
              { label: "Cost per Booking (CPB)", curr: cpb(current.spend, current.bookings), prev: cpb(previous.spend, previous.bookings), format: inr, color: CYAN, invert: true },
              { label: "Cost per Walk-in (CPW)", curr: cpw(current.spend, current.walkins), prev: cpw(previous.spend, previous.walkins), format: inr, color: SLATE, invert: true },
              { label: "Lead → Booking %", curr: (current.bookings / Math.max(current.leads, 1)) * 100, prev: (previous.bookings / Math.max(previous.leads, 1)) * 100, format: pct, color: PURPLE },
              { label: "Booking → Walk-in %", curr: (current.walkins / Math.max(current.bookings, 1)) * 100, prev: (previous.walkins / Math.max(previous.bookings, 1)) * 100, format: pct, color: CYAN },
              { label: "Walk-in → Admission %", curr: (current.admissions / Math.max(current.walkins, 1)) * 100, prev: (previous.admissions / Math.max(previous.walkins, 1)) * 100, format: pct, color: GREEN },
              { label: "Revenue (Min.)", curr: current.admissions * MIN_REVENUE_PER_ADM, prev: previous.admissions * MIN_REVENUE_PER_ADM, format: inr, color: GREEN },
              { label: "Min. ROI %", curr: roi(current.admissions * MIN_REVENUE_PER_ADM, current.spend), prev: roi(previous.admissions * MIN_REVENUE_PER_ADM, previous.spend), format: (n: number) => `${Math.round(n)}%`, color: GREEN },
            ].map((k, i) => {
              const d = mom(k.curr, k.prev);
              const goodDirection = (k as any).invert ? !d.positive : d.positive;
              return (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <div className="text-xl font-black text-gray-900">{k.format(k.curr)}</div>
                    <span className={`text-[11px] font-bold ${goodDirection ? "text-green-600" : "text-red-500"}`}>{d.sign} {d.val}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">vs Mar: {k.format(k.prev)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[12px] text-gray-500 italic">
            April is complete ({TODAY_DATE} of {DAYS_IN_APRIL} days). Final month totals shown.
          </div>
        </section>

        {/* ───────── 3b. Year-over-Year Comparison ───────── */}
        <section>
          <SectionTitle title="Year-over-Year Comparison" sub="April 2026 vs April 2025 — same month, same window" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Leads",              curr: current.leads,       prev: aprilLastYear.leads,       format: num },
              { label: "Walk-ins",           curr: current.walkins,     prev: aprilLastYear.walkins,     format: num },
              { label: "Admissions",         curr: current.admissions,  prev: aprilLastYear.admissions,  format: num },
              { label: "Marketing Spend",    curr: current.spend,                        prev: aprilLastYear.spend,                        format: inr, invert: true },
              { label: "Total Spend (incl. Salary)", curr: current.spend + monthlyFixed,  prev: aprilLastYear.spend + monthlyFixed,  format: inr, invert: true },
              { label: "Marketing CPA",      curr: cpa(current.spend, current.admissions),                          prev: cpa(aprilLastYear.spend, aprilLastYear.admissions),                          format: inr, invert: true },
              { label: "True CPA",           curr: trueCpa(current.spend, current.admissions, monthlyFixed, 1),     prev: trueCpa(aprilLastYear.spend, aprilLastYear.admissions, monthlyFixed, 1),     format: inr, invert: true },
              { label: "Revenue (Min.)",     curr: current.admissions * MIN_REVENUE_PER_ADM,                        prev: aprilLastYear.admissions * MIN_REVENUE_PER_ADM,                              format: inr },
              { label: "Walk-in → Adm %",   curr: (current.admissions / Math.max(current.walkins, 1)) * 100,       prev: (aprilLastYear.admissions / Math.max(aprilLastYear.walkins, 1)) * 100,       format: pct },
              { label: "Min. ROI %",         curr: roi(current.admissions * MIN_REVENUE_PER_ADM, current.spend),   prev: roi(aprilLastYear.admissions * MIN_REVENUE_PER_ADM, aprilLastYear.spend),   format: (n: number) => `${Math.round(n)}%` },
            ].map((k, i) => {
              const d = mom(k.curr, k.prev);
              const goodDirection = (k as any).invert ? !d.positive : d.positive;
              return (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <div className="text-xl font-black text-gray-900">{k.format(k.curr)}</div>
                    <span className={`text-[11px] font-bold ${goodDirection ? "text-green-600" : "text-red-500"}`}>{d.sign} {d.val}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">vs Apr 25: {k.format(k.prev)}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────── 4. April Forecast (with True CPA) ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle
            title={TODAY_DATE >= DAYS_IN_APRIL ? "April 2026 — Final Actuals" : "April 2026 Forecast (Projected Month-End)"}
            sub={TODAY_DATE >= DAYS_IN_APRIL ? `Month complete · All 30 days captured · ${LAST_UPDATED}` : `Linear pace projection: ${TODAY_DATE} days elapsed × ${fcMul.toFixed(2)}× multiplier`}
            badge={`Confidence: ${fcConfidence}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: TODAY_DATE >= DAYS_IN_APRIL ? "Final Leads" : "Forecasted Leads", curr: current.leads, fc: forecast.leads, color: NAVY },
              { label: TODAY_DATE >= DAYS_IN_APRIL ? "Final Walk-ins" : "Forecasted Walk-ins", curr: current.walkins, fc: forecast.walkins, color: CYAN },
              { label: TODAY_DATE >= DAYS_IN_APRIL ? "Final Admissions" : "Forecasted Admissions", curr: current.admissions, fc: forecast.admissions, color: GREEN },
              { label: TODAY_DATE >= DAYS_IN_APRIL ? "Final Spend" : "Forecasted Spend", curr: current.spend, fc: forecast.spend, color: RED, isMoney: true },
            ].map((k, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="text-2xl font-black mt-1" style={{ color: k.color }}>{k.isMoney ? inr(k.fc) : num(k.fc)}</div>
                <div className="text-[11px] text-gray-500 mt-1">Now: {k.isMoney ? inr(k.curr) : num(k.curr)} · Pending: {k.isMoney ? inr(k.fc - k.curr) : num(k.fc - k.curr)}</div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(k.curr / Math.max(k.fc, 1)) * 100}%`, background: k.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg p-3 border-l-4 border-blue-400 bg-blue-50">
              <div className="font-bold text-blue-700 mb-1">Forecast CPA (Marketing)</div>
              <div className="text-lg font-black text-[#091a4f]">{inr(fcMarketingCpa)}</div>
            </div>
            <div className="rounded-lg p-3 border-l-4 border-red-400 bg-red-50">
              <div className="font-bold text-red-700 mb-1">Forecast CPA (True)</div>
              <div className="text-lg font-black text-[#091a4f]">{inr(fcTrueCpa)}</div>
            </div>
            <div className="rounded-lg p-3 border-l-4 border-amber-400 bg-amber-50">
              <div className="font-bold text-amber-700 mb-1">Projected EOM Revenue</div>
              <div className="text-lg font-black text-[#091a4f]">{inr(fcRevenue)}</div>
            </div>
            <div className="rounded-lg p-3 border-l-4 border-green-400 bg-green-50">
              <div className="font-bold text-green-700 mb-1">Projected True ROI</div>
              <div className="text-lg font-black text-[#091a4f]">{fcTrueRoi.toFixed(0)}%</div>
            </div>
          </div>
        </section>

        {/* ───────── 5. WHAT-IF CALCULATOR (with True ROI) ───────── */}
        <section className="bg-gradient-to-br from-[#091a4f] to-[#0d3b86] rounded-2xl p-6 text-white shadow-lg">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">What-If Spend Calculator</h2>
              <p className="text-xs text-blue-200 mt-1">Enter a budget, pick a reference month, and toggle salary inclusion to see Marketing ROI vs True ROI side-by-side.</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input type="checkbox" checked={includeSalary} onChange={e => setIncludeSalary(e.target.checked)} className="w-4 h-4 accent-amber-400" data-testid="toggle-include-salary" />
              <span>Include Salaries & Overhead in Projection</span>
            </label>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-blue-200 mb-2">Marketing Budget (₹)</label>
              <input type="number" value={calcSpend} onChange={(e) => setCalcSpend(Number(e.target.value))} min={0} step={5000}
                className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-amber-400" data-testid="input-calc-spend" />
              <div className="text-[11px] text-blue-200 mt-1">{calcSpend > 0 ? `= ${inr(calcSpend)}` : "Enter amount above"}</div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-blue-200 mb-2">Reference Month (trend basis)</label>
              <select value={calcMonth} onChange={(e) => setCalcMonth(e.target.value)}
                className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-amber-400" data-testid="select-calc-month">
                {monthlyForCharts.map(m => (<option key={m.month} value={m.month} className="text-[#091a4f]">{m.month} — CPL {inr(m.cpl)}</option>))}
              </select>
              <div className="text-[11px] text-blue-200 mt-1">CPL: {inr(calcMonthData.cpl)} · CPW: {inr(calcMonthData.cpw)} · CPA: {inr(calcMonthData.cpa)}</div>
            </div>
            <div className="rounded-lg bg-amber-400/10 border border-amber-400/30 p-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">Quick Presets</div>
              <div className="flex flex-wrap gap-2">
                {[50000, 100000, 200000, 500000, 1000000].map(v => (
                  <button key={v} onClick={() => setCalcSpend(v)} className={`px-3 py-1 rounded-md text-xs font-bold transition ${calcSpend === v ? "bg-amber-400 text-[#091a4f]" : "bg-white/10 text-white hover:bg-white/20"}`}>{inr(v)}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Editable cost inputs */}
          <div className="grid sm:grid-cols-4 gap-3 mb-5 rounded-xl bg-black/20 p-4 border border-white/10">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">Salary Cost / month</label>
              <input type="number" value={salaryCost} onChange={e => setSalaryCost(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-amber-400" data-testid="input-salary" />
              <div className="text-[10px] text-blue-200 mt-1">{inr(salaryCost)}</div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">CRM / Tools / month</label>
              <input type="number" value={crmCost} onChange={e => setCrmCost(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-amber-400" data-testid="input-crm" />
              <div className="text-[10px] text-blue-200 mt-1">{inr(crmCost)}</div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">Fixed Overhead / month</label>
              <input type="number" value={overheadCost} onChange={e => setOverheadCost(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-amber-400" data-testid="input-overhead" />
              <div className="text-[10px] text-blue-200 mt-1">{inr(overheadCost)}</div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">Team Size</label>
              <input type="number" value={teamSize} onChange={e => setTeamSize(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-md px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-amber-400" data-testid="input-team-size" />
              <div className="text-[10px] text-blue-200 mt-1">{teamSize} members · {inr(salaryCost / Math.max(teamSize, 1))}/person</div>
            </div>
          </div>

          {/* Outputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl p-4 bg-white/15"><div className="text-[10px] uppercase tracking-wider font-bold opacity-70">Expected Leads</div><div className="text-3xl font-black mt-1">{num(calcResults.leads)}</div></div>
            <div className="rounded-xl p-4 bg-white/15"><div className="text-[10px] uppercase tracking-wider font-bold opacity-70">Expected Bookings</div><div className="text-3xl font-black mt-1">{num(calcResults.bookings)}</div></div>
            <div className="rounded-xl p-4 bg-white/15"><div className="text-[10px] uppercase tracking-wider font-bold opacity-70">Expected Walk-ins</div><div className="text-3xl font-black mt-1">{num(calcResults.walkins)}</div></div>
            <div className="rounded-xl p-4 bg-amber-400 text-[#091a4f]"><div className="text-[10px] uppercase tracking-wider font-bold opacity-70">Expected Admissions</div><div className="text-3xl font-black mt-1">{num(calcResults.admissions)}</div></div>
          </div>

          {/* ROI Comparison */}
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg bg-white/10 p-4 border-l-4 border-blue-400">
              <div className="text-[11px] uppercase tracking-wider font-bold text-blue-200">Marketing ROI (ad spend only)</div>
              <div className="text-3xl font-black mt-1" style={{ color: "#fbbf24" }}>{calcResults.marketingRoi > 0 ? `${calcResults.marketingRoi.toFixed(0)}%` : "—"}</div>
              <div className="text-[11px] text-blue-200 mt-1">CPA: {inr(calcResults.marketingCpa)} · Revenue: {inr(calcResults.revenue)}</div>
            </div>
            <div className="rounded-lg bg-white/10 p-4 border-l-4 border-amber-400">
              <div className="text-[11px] uppercase tracking-wider font-bold text-amber-300">True ROI (after salaries & overhead)</div>
              <div className="text-3xl font-black mt-1" style={{ color: calcResults.trueRoi > 200 ? "#34d399" : "#f87171" }}>
                {calcResults.trueRoi > 0 || calcResults.admissions > 0 ? `${calcResults.trueRoi.toFixed(0)}%` : "—"}
              </div>
              <div className="text-[11px] text-amber-200 mt-1">True CPA: {inr(calcResults.trueCpa)} · Net: {inr(calcResults.revenue - calcSpend - (includeSalary ? monthlyFixed : 0))}</div>
            </div>
          </div>

          <div className="rounded-md bg-amber-500/10 border border-amber-400/30 p-3 text-[12px] text-amber-100">
            <strong>Reality check:</strong> You think you're at {calcResults.marketingRoi.toFixed(0)}% ROI →
            <strong> Actual ROI after costs: {calcResults.trueRoi.toFixed(0)}%</strong> ·
            Difference: {(calcResults.marketingRoi - calcResults.trueRoi).toFixed(0)} percentage points lost to operational overhead.
          </div>

          <div className="mt-3 text-[11px] text-blue-200 italic">
            Logic: Leads = Spend ÷ {inr(calcMonthData.cpl)} CPL · Walk-ins = Spend ÷ {inr(calcMonthData.cpw)} CPW · Admissions = Spend ÷ {inr(calcMonthData.cpa)} CPA.
            Bookings derived from {calcMonth} booking-to-lead ratio.
            True ROI = (Revenue − Spend − {inr(monthlyFixed)} fixed cost) ÷ (Spend + Fixed) × 100.
          </div>
        </section>

        {/* ───────── 6. CRM PERFORMANCE SNAPSHOT ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="CRM Performance Snapshot" sub="Funnel efficiency, drop-offs, and per-team metrics" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div className="rounded-xl p-4 bg-blue-50 border-l-4 border-blue-400">
              <div className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Walk-ins per 100 leads</div>
              <div className="text-3xl font-black text-[#091a4f] mt-1">{(leadToWalk).toFixed(1)}</div>
              <div className="text-[11px] text-gray-500 mt-1">Industry benchmark: 30-40</div>
            </div>
            <div className="rounded-xl p-4 bg-green-50 border-l-4 border-green-400">
              <div className="text-[10px] uppercase tracking-wider font-bold text-green-700">Admissions per 100 walk-ins</div>
              <div className="text-3xl font-black text-[#091a4f] mt-1">{(walkToAdm).toFixed(1)}</div>
              <div className="text-[11px] text-gray-500 mt-1">Industry benchmark: 20-30</div>
            </div>
            <div className="rounded-xl p-4 bg-purple-50 border-l-4 border-purple-400">
              <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700">Bookings per 100 leads</div>
              <div className="text-3xl font-black text-[#091a4f] mt-1">{((totals.bookings / Math.max(totals.leads, 1)) * 100).toFixed(1)}</div>
              <div className="text-[11px] text-gray-500 mt-1">Lead engagement rate</div>
            </div>
          </div>

          {/* Drop-off bars */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-600 mb-1">Funnel Drop-off Analysis</div>
            {[
              { label: "Leads → Bookings", from: totals.leads, to: totals.bookings, color: PURPLE },
              { label: "Bookings → Walk-ins", from: totals.bookings, to: totals.walkins, color: CYAN },
              { label: "Walk-ins → Admissions", from: totals.walkins, to: ytdAdmissionsFull, color: GREEN },
            ].map(s => {
              const conv = (s.to / Math.max(s.from, 1)) * 100;
              const dropoff = 100 - conv;
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{s.label}: <strong className="text-[#091a4f]">{num(s.from)} → {num(s.to)}</strong></span>
                    <span className="font-bold" style={{ color: s.color }}>{conv.toFixed(1)}% converted · {dropoff.toFixed(1)}% drop-off</span>
                  </div>
                  <div className="flex h-5 rounded-full overflow-hidden bg-red-100">
                    <div className="h-full" style={{ width: `${conv}%`, background: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────── 7. April Branch Comparison + Channel ───────── */}
        {segment === "combined" && (
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle title="April 2026 — Branch Comparison" sub="RIS vs RPS performance side-by-side" />
              <div className="space-y-3">
                {[
                  { label: "Total Leads", ris: APRIL_RIS_BASE.leads, rps: APRIL_RPS_BASE.leads, max: 130 },
                  { label: "Bookings", ris: APRIL_RIS_BASE.bookings, rps: APRIL_RPS_BASE.bookings, max: 60 },
                  { label: "Walk-ins", ris: APRIL_RIS_BASE.walkins, rps: APRIL_RPS_BASE.walkins, max: 40 },
                  { label: "Admissions", ris: APRIL_RIS_BASE.admissions, rps: APRIL_RPS_BASE.admissions, max: 15 },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span className="font-medium">{row.label}</span>
                      <span className="flex gap-4">
                        <span className="font-bold" style={{ color: NAVY }}>RIS: {row.ris}</span>
                        <span className="font-bold" style={{ color: CYAN }}>RPS: {row.rps}</span>
                      </span>
                    </div>
                    <div className="flex gap-1 h-5">
                      <div className="rounded-l-full" style={{ width: `${(row.ris / row.max) * 48}%`, background: NAVY, minWidth: 2 }} />
                      <div className="rounded-r-full" style={{ width: `${(row.rps / row.max) * 48}%`, background: CYAN, minWidth: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-[#091a4f]/5 p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">RIS Conversion</div>
                  <div className="text-2xl font-black" style={{ color: NAVY }}>{pct((APRIL_RIS_BASE.admissions / APRIL_RIS_BASE.leads) * 100)}</div>
                  <div className="text-[11px] text-gray-400">{APRIL_RIS_BASE.admissions} / {APRIL_RIS_BASE.leads}</div>
                </div>
                <div className="rounded-xl bg-cyan-50 p-3 text-center">
                  <div className="text-xs text-gray-500 font-medium mb-1">RPS Conversion</div>
                  <div className="text-2xl font-black" style={{ color: CYAN }}>{pct((APRIL_RPS_BASE.admissions / APRIL_RPS_BASE.leads) * 100)}</div>
                  <div className="text-[11px] text-gray-400">{APRIL_RPS_BASE.admissions} / {APRIL_RPS_BASE.leads}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle title="April 2026 — Channel Spend" sub="Meta vs Google ad investment" />
              <div className="space-y-3">
                <div className="rounded-xl p-4 text-white" style={{ background: "#1877f2" }}>
                  <div className="flex justify-between items-baseline">
                    <div><div className="text-xs font-bold opacity-80 uppercase tracking-wider">Meta</div><div className="text-3xl font-black mt-1">{inr(current.meta)}</div></div>
                    <div className="text-right text-xs opacity-90">CPL: {inr(cpl(current.meta, Math.round(current.leads * (current.meta / current.spend))))}</div>
                  </div>
                </div>
                <div className="rounded-xl p-4 text-white" style={{ background: "#ea4335" }}>
                  <div className="flex justify-between items-baseline">
                    <div><div className="text-xs font-bold opacity-80 uppercase tracking-wider">Google</div><div className="text-3xl font-black mt-1">{inr(current.google)}</div></div>
                    <div className="text-right text-xs opacity-90">CPL: {inr(cpl(current.google, Math.round(current.leads * (current.google / current.spend))))}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center bg-gray-50 rounded-lg py-3"><div className="text-xs text-gray-500">Meta Share</div><div className="text-xl font-black" style={{ color: "#1877f2" }}>{pct((current.meta / current.spend) * 100)}</div></div>
                  <div className="text-center bg-gray-50 rounded-lg py-3"><div className="text-xs text-gray-500">Google Share</div><div className="text-xl font-black" style={{ color: "#ea4335" }}>{pct((current.google / current.spend) * 100)}</div></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ───────── 7b. CRM Branch Performance (RPS centre-wise) ───────── */}
        {(segment === "combined" || segment === "rps") && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle
              title="CRM Branch Performance — RPS Centres"
              sub="Centre-wise lead distribution, conversion & admissions (Jan – Apr 2026). RIS operates a single Brahmand centre."
              badge="LIVE FROM CRM"
            />
            {(() => {
              /* Aggregate across the 4 months for centre rankings */
              const centres = ["Aggarwal","Anand Nagar","Kasarvadavali","Hariniwas","Dhokali","Kalwa","Unassigned"];
              const totals: Record<string, CrmRow> = Object.fromEntries(
                centres.map(c => [c, { centre: c, leads: 0, bookings: 0, walkins: 0, admissions: 0 }])
              );
              CRM_RPS.forEach(m => m.rows.forEach(r => {
                totals[r.centre].leads += r.leads;
                totals[r.centre].bookings += r.bookings;
                totals[r.centre].walkins += r.walkins;
                totals[r.centre].admissions += r.admissions;
              }));
              const rows = centres.map(c => totals[c]);
              const grandTotal = rows.reduce((a, r) => ({
                centre: "Total", leads: a.leads + r.leads, bookings: a.bookings + r.bookings,
                walkins: a.walkins + r.walkins, admissions: a.admissions + r.admissions,
              }), { centre: "Total", leads: 0, bookings: 0, walkins: 0, admissions: 0 });
              const maxLeads = Math.max(...rows.map(r => r.leads));
              const maxAdm = Math.max(...rows.map(r => r.admissions));
              const top = [...rows].filter(r => r.centre !== "Unassigned" && r.admissions > 0)
                .sort((a, b) => (b.admissions / Math.max(b.leads, 1)) - (a.admissions / Math.max(a.leads, 1)))[0];
              return (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" data-testid="table-crm-branches">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="py-2 pr-3 font-bold">Centre</th>
                          <th className="py-2 px-2 font-bold text-right">Leads</th>
                          <th className="py-2 px-2 font-bold text-right">Bookings</th>
                          <th className="py-2 px-2 font-bold text-right">Walk-ins</th>
                          <th className="py-2 px-2 font-bold text-right">Admissions</th>
                          <th className="py-2 px-2 font-bold text-right">L→W %</th>
                          <th className="py-2 px-2 font-bold text-right">L→Adm %</th>
                          <th className="py-2 pl-2 font-bold text-right">W→Adm %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(r => {
                          const lw = r.leads ? (r.walkins / r.leads) * 100 : 0;
                          const la = r.leads ? (r.admissions / r.leads) * 100 : 0;
                          const wa = r.walkins ? (r.admissions / r.walkins) * 100 : 0;
                          const isTop = top && r.centre === top.centre;
                          const isUnassigned = r.centre === "Unassigned";
                          return (
                            <tr key={r.centre} className={`border-b ${isTop ? "bg-amber-50" : isUnassigned ? "bg-red-50/40" : ""}`} data-testid={`row-crm-${r.centre.toLowerCase().replace(/\s+/g,"-")}`}>
                              <td className="py-2 pr-3 font-bold" style={{ color: NAVY }}>
                                {r.centre}
                                {isTop && <span className="ml-2 text-[9px] font-bold uppercase bg-amber-400 text-[#091a4f] px-1.5 py-0.5 rounded">Top</span>}
                                {isUnassigned && <span className="ml-2 text-[9px] font-bold uppercase bg-red-200 text-red-700 px-1.5 py-0.5 rounded">Unassigned</span>}
                              </td>
                              <td className="py-2 px-2 text-right font-semibold">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-12 h-1.5 bg-gray-100 rounded">
                                    <div className="h-full rounded" style={{ width: `${(r.leads / maxLeads) * 100}%`, background: NAVY }} />
                                  </div>
                                  {num(r.leads)}
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right">{num(r.bookings)}</td>
                              <td className="py-2 px-2 text-right">{num(r.walkins)}</td>
                              <td className="py-2 px-2 text-right font-bold" style={{ color: GREEN }}>
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-12 h-1.5 bg-gray-100 rounded">
                                    <div className="h-full rounded" style={{ width: `${(r.admissions / Math.max(maxAdm,1)) * 100}%`, background: GREEN }} />
                                  </div>
                                  {num(r.admissions)}
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right text-gray-600">{pct(lw)}</td>
                              <td className="py-2 px-2 text-right font-bold" style={{ color: la >= 5 ? GREEN : la >= 2 ? AMBER : RED }}>{pct(la)}</td>
                              <td className="py-2 pl-2 text-right text-gray-600">{pct(wa)}</td>
                            </tr>
                          );
                        })}
                        <tr className="font-black border-t-2" style={{ color: NAVY }}>
                          <td className="py-2 pr-3">Total (Jan–Apr)</td>
                          <td className="py-2 px-2 text-right">{num(grandTotal.leads)}</td>
                          <td className="py-2 px-2 text-right">{num(grandTotal.bookings)}</td>
                          <td className="py-2 px-2 text-right">{num(grandTotal.walkins)}</td>
                          <td className="py-2 px-2 text-right" style={{ color: GREEN }}>{num(grandTotal.admissions)}</td>
                          <td className="py-2 px-2 text-right">{pct(grandTotal.leads ? (grandTotal.walkins/grandTotal.leads)*100 : 0)}</td>
                          <td className="py-2 px-2 text-right">{pct(grandTotal.leads ? (grandTotal.admissions/grandTotal.leads)*100 : 0)}</td>
                          <td className="py-2 pl-2 text-right">{pct(grandTotal.walkins ? (grandTotal.admissions/grandTotal.walkins)*100 : 0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Monthly trend per centre — admissions */}
                  <div className="mt-5">
                    <div className="text-xs font-bold text-gray-600 mb-2">Admissions by Centre — Monthly</div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500 border-b">
                            <th className="py-2 pr-3 font-bold">Centre</th>
                            {CRM_RPS.map(m => <th key={m.month} className="py-2 px-2 font-bold text-right">{m.month}</th>)}
                            <th className="py-2 pl-2 font-bold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {centres.filter(c => c !== "Unassigned").map(c => {
                            const cells = CRM_RPS.map(m => m.rows.find(r => r.centre === c)?.admissions ?? 0);
                            const tot = cells.reduce((a, n) => a + n, 0);
                            return (
                              <tr key={c} className="border-b">
                                <td className="py-2 pr-3 font-semibold" style={{ color: NAVY }}>{c}</td>
                                {cells.map((n, i) => <td key={i} className="py-2 px-2 text-right">{n}</td>)}
                                <td className="py-2 pl-2 text-right font-bold" style={{ color: GREEN }}>{tot}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {top && (
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs">
                      <span className="font-black text-amber-900">★ Top performing centre: </span>
                      <span className="text-amber-900">
                        <strong>{top.centre}</strong> — {top.admissions} admissions on {top.leads} leads
                        ({pct((top.admissions/top.leads)*100)} lead→admission rate).
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {/* ───────── 8. Monthly Trend Charts (with True CPA + Funnel) ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <SectionTitle title={`Monthly Trends — ${segmentLabel}`} />
            <div className="flex flex-wrap rounded-lg overflow-hidden border border-gray-200 text-xs">
              {([
                { k: "leads", label: "Leads & Adm" },
                { k: "spend", label: "Ad Spend" },
                { k: "roi", label: "ROI %" },
                { k: "truecpa", label: "True CPA" },
                { k: "funnel", label: "Funnel" },
              ] as const).map(t => (
                <button key={t.k} onClick={() => setChartTab(t.k)}
                  className={`px-4 py-2 font-bold ${chartTab === t.k ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={chartTab === t.k ? { background: NAVY } : {}}>{t.label}</button>
              ))}
            </div>
          </div>

          {chartTab === "leads" && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyForCharts} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} /><YAxis tick={TICK} /><Tooltip /><Legend />
                <Bar dataKey="leads" name="Leads" fill={NAVY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="walkins" name="Walk-ins" fill={CYAN} radius={[4, 4, 0, 0]} />
                <Bar dataKey="admissions" name="Admissions" fill={GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartTab === "spend" && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyForCharts} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} /><YAxis tick={TICK} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => inr(v)} /><Legend />
                <Bar dataKey="meta" name="Meta Spend" fill="#1877f2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="google" name="Google Spend" fill="#ea4335" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartTab === "roi" && (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyForCharts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis yAxisId="left" tick={TICK} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" tick={TICK} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip /><Legend />
                <Area yAxisId="right" type="monotone" dataKey="spend" name="Ad Spend (₹)" fill={RED} stroke={RED} fillOpacity={0.15} />
                <Line yAxisId="left" type="monotone" dataKey="roi" name="Marketing ROI %" stroke={GREEN} strokeWidth={3} dot={{ r: 5, fill: GREEN }} />
                <Line yAxisId="left" type="monotone" dataKey="trueRoi" name="True ROI %" stroke={AMBER} strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: AMBER }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
          {chartTab === "truecpa" && (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthlyForCharts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis tick={TICK} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => inr(v)} /><Legend />
                <Bar dataKey="cpa" name="Marketing CPA" fill={NAVY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="trueCpa" name="True CPA (with salaries)" fill={RED} radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
          {chartTab === "funnel" && (
            <div>
              <div className="text-xs text-gray-500 mb-3">YTD Conversion Funnel ({segmentLabel}) — width = relative count</div>
              <div className="space-y-2">
                {funnelData.map((s, i) => {
                  const widthPct = (s.value / Math.max(funnelData[0].value, 1)) * 100;
                  return (
                    <div key={s.name} className="flex items-center gap-3">
                      <div className="w-24 text-xs font-bold text-gray-700">{s.name}</div>
                      <div className="flex-1 h-12 rounded-md flex items-center justify-end px-3 text-white font-black" style={{ width: `${widthPct}%`, background: s.fill, minWidth: 60 }}>
                        {num(s.value)}
                      </div>
                      {i > 0 && (
                        <div className="text-xs font-bold text-gray-500 w-32">
                          {((s.value / Math.max(funnelData[i - 1].value, 1)) * 100).toFixed(1)}% from prev
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* ───────── 9. YoY Comparison ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title={`Year-over-Year — ${segmentLabel}`} sub="AY 2024-25 vs AY 2025-26 (same Dec–Apr period)" />
          <div className="grid sm:grid-cols-4 gap-3 mb-5">
            {(() => {
              const lyAvgPerMonth = totalsLastYearSegment.admissions / 9;
              const lyEquivalent = lyAvgPerMonth * 5;
              return [
                { label: "Leads YoY", curr: totals.leads, prev: Math.round(totalsLastYearSegment.leads / 9 * 5) },
                { label: "Admissions YoY", curr: totals.admissions, prev: Math.round(lyEquivalent) },
                { label: "Spend YoY", curr: totals.spend, prev: Math.round(totalsLastYearSegment.spend / 9 * 5), money: true },
                { label: "Walk-ins YoY", curr: totals.walkins, prev: Math.round(totalsLastYearSegment.walkins / 9 * 5) },
              ];
            })().map((k, i) => {
              const d = mom(k.curr, k.prev);
              return (
                <div key={i} className="rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                  <div className="text-2xl font-black mt-1" style={{ color: NAVY }}>{(k as any).money ? inr(k.curr) : num(k.curr)}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${d.positive ? "text-green-600" : "text-red-500"}`}>{d.sign} {d.val}</span>
                    <span className="text-[11px] text-gray-500">vs {(k as any).money ? inr(k.prev) : num(k.prev)} LY (5-mo equiv)</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg p-3 bg-blue-50 border-l-4 border-blue-400">
              <div className="font-bold text-blue-700 mb-1">Last Year FY Total ({segment === "combined" ? "RIS + RPS" : segment.toUpperCase()}, Oct 24 – Jun 25)</div>
              <div className="text-gray-700">Spend: <strong>{inr(totalsLastYearSegment.spend)}</strong> · Leads: <strong>{num(totalsLastYearSegment.leads)}</strong> · Admissions: <strong>{totalsLastYearSegment.admissions}</strong></div>
            </div>
            <div className="rounded-lg p-3 bg-green-50 border-l-4 border-green-400">
              <div className="font-bold text-green-700 mb-1">This Year Pace ({segment === "combined" ? "RIS + RPS" : segment.toUpperCase()}, Dec 25 – Apr 26)</div>
              <div className="text-gray-700">Spend: <strong>{inr(totals.spend)}</strong> · Leads: <strong>{num(totals.leads)}</strong> · Admissions: <strong>{totals.admissions}</strong></div>
            </div>
          </div>
        </section>

        {/* ───────── 10. April Weekly ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <SectionTitle title="April 2026 — Weekly Breakdown" sub="Week-by-week leads, walk-ins, bookings, admissions" />
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              {(["combined", "ris", "rps"] as const).map(t => (
                <button key={t} onClick={() => setWeeklyTab(t)}
                  className={`px-4 py-2 font-bold uppercase ${weeklyTab === t ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={weeklyTab === t ? { background: t === "rps" ? CYAN : NAVY } : {}}>{t}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-semibold">Week</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold">Leads</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold">Bookings</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold">Walk-ins</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold">Admissions</th>
                <th className="text-center py-2 px-3 text-gray-500 font-semibold">Conversion</th>
              </tr></thead>
              <tbody>
                {APRIL_WEEKLY.map((w, i) => {
                  const leads = weeklyTab === "ris" ? w.risLeads : weeklyTab === "rps" ? w.rpsLeads : w.risLeads + w.rpsLeads;
                  const walk = weeklyTab === "ris" ? w.risWalk : weeklyTab === "rps" ? w.rpsWalk : w.risWalk + w.rpsWalk;
                  const adm = weeklyTab === "ris" ? w.risAdm : weeklyTab === "rps" ? w.rpsAdm : w.risAdm + w.rpsAdm;
                  const book = weeklyTab === "ris" ? w.risBook : weeklyTab === "rps" ? w.rpsBook : w.risBook + w.rpsBook;
                  const conv = leads > 0 ? ((adm / leads) * 100).toFixed(1) : "—";
                  return (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-3 px-3 font-semibold text-gray-700">{w.week}</td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: NAVY }}>{leads}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600">{book}</td>
                      <td className="py-3 px-3 text-center font-bold text-cyan-700">{walk}</td>
                      <td className="py-3 px-3 text-center font-bold text-green-700">{adm}</td>
                      <td className="py-3 px-3 text-center"><span className={`px-2 py-0.5 rounded-md text-xs font-bold ${parseFloat(conv) > 5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{conv}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ───────── 11. Social Media ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title={`Social Media Performance — ${segmentLabel}`} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { platform: "Instagram", val: num(social.instaFollowers), label: "Followers", color: "#e1306c" },
              { platform: "Facebook", val: num(social.fbFollowers), label: "Followers", color: "#1877f2" },
              { platform: "YouTube", val: num(social.ytViews), label: "Views (Apr 2026)", color: "#ff0000" },
              { platform: "Website (GSC)", val: num(social.websiteClicks), label: "Apr Week 3 Clicks", color: GREEN },
            ].map(s => (
              <div key={s.platform} className="rounded-xl border border-gray-100 p-4">
                <div className="font-bold text-sm text-gray-800">{s.platform}</div>
                <div className="text-[11px] text-gray-400 mb-3">{s.label}</div>
                <div className="text-3xl font-black" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── 12. Monthly Summary Table (with True CPA) ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title={`Full Monthly Summary — AY 2025-26 (${segmentLabel})`} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ background: NAVY }} className="text-white">
                {["Month", "Leads", "Bookings", "Walk-ins", "Adm", "Spend", "CPL", "CPB", "CPW", "CPA (Mktg)", "True CPA", "ROI", "True ROI"].map(h => (
                  <th key={h} className="py-3 px-2 text-left font-semibold text-[11px] whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {monthlyForCharts.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-2 px-2 font-bold text-[#091a4f]">{r.month}</td>
                    <td className="py-2 px-2">{num(r.leads)}</td>
                    <td className="py-2 px-2">{num(r.bookings)}</td>
                    <td className="py-2 px-2">{num(r.walkins)}</td>
                    <td className="py-2 px-2 font-bold text-green-700">{r.admissions}</td>
                    <td className="py-2 px-2">{inr(r.spend)}</td>
                    <td className="py-2 px-2">{inr(r.cpl)}</td>
                    <td className="py-2 px-2">{inr(cpb(r.spend, r.bookings))}</td>
                    <td className="py-2 px-2">{inr(r.cpw)}</td>
                    <td className="py-2 px-2 font-bold text-blue-700">{inr(r.cpa)}</td>
                    <td className="py-2 px-2 font-bold text-red-600">{inr(r.trueCpa)}</td>
                    <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${r.roi >= 1000 ? "bg-green-100 text-green-700" : r.roi >= 500 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>{r.roi.toFixed(0)}%</span></td>
                    <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${r.trueRoi >= 500 ? "bg-green-100 text-green-700" : r.trueRoi >= 100 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>{r.trueRoi.toFixed(0)}%</span></td>
                  </tr>
                ))}
                <tr className="font-black border-t-2 border-gray-300" style={{ background: `${NAVY}10` }}>
                  <td className="py-3 px-2" style={{ color: NAVY }}>TOTAL</td>
                  <td className="py-3 px-2">{num(totals.leads)}</td>
                  <td className="py-3 px-2">{num(totals.bookings)}</td>
                  <td className="py-3 px-2">{num(totals.walkins)}</td>
                  <td className="py-3 px-2 text-green-700">{totals.admissions}</td>
                  <td className="py-3 px-2">{inr(totals.spend)}</td>
                  <td className="py-3 px-2">{inr(cpl(totals.spend, totals.leads))}</td>
                  <td className="py-3 px-2">{inr(cpb(totals.spend, totals.bookings))}</td>
                  <td className="py-3 px-2">{inr(cpw(totals.spend, totals.walkins))}</td>
                  <td className="py-3 px-2 text-blue-700">{inr(ytdMarketingCpa)}</td>
                  <td className="py-3 px-2 text-red-600">{inr(ytdTrueCpa)}</td>
                  <td className="py-3 px-2 text-green-700">{ytdMarketingRoi.toFixed(0)}%</td>
                  <td className="py-3 px-2 text-amber-700">{ytdTrueRoi.toFixed(0)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ───────── 13. Last Year Summary Table ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Last Year Summary — AY 2024-25" sub="RIS + RPS as on 13 June 2025 closing snapshot (always shows both branches)" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: SLATE }} className="text-white">
                  <th className="py-3 px-3 text-left font-semibold text-xs">Month</th>
                  <th className="py-3 px-3 text-center font-semibold text-xs" colSpan={4}>RIS</th>
                  <th className="py-3 px-3 text-center font-semibold text-xs" colSpan={4}>RPS</th>
                  <th className="py-3 px-3 text-center font-semibold text-xs">Combined Adm</th>
                </tr>
                <tr style={{ background: SLATE }} className="text-white text-[11px]">
                  <th></th><th className="py-2 px-3 text-center">Spend</th><th className="py-2 px-3 text-center">Leads</th><th className="py-2 px-3 text-center">Walk</th><th className="py-2 px-3 text-center">Adm</th>
                  <th className="py-2 px-3 text-center">Spend</th><th className="py-2 px-3 text-center">Leads</th><th className="py-2 px-3 text-center">Walk</th><th className="py-2 px-3 text-center">Adm</th><th></th>
                </tr>
              </thead>
              <tbody>
                {LAST_YEAR.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-2 px-3 font-bold text-[#091a4f]">{r.month}</td>
                    <td className="py-2 px-3 text-center">{inr(r.ris.spend)}</td>
                    <td className="py-2 px-3 text-center">{r.ris.leads}</td>
                    <td className="py-2 px-3 text-center">{r.ris.walkins}</td>
                    <td className="py-2 px-3 text-center font-bold text-green-700">{r.ris.admissions}</td>
                    <td className="py-2 px-3 text-center">{inr(r.rps.spend)}</td>
                    <td className="py-2 px-3 text-center">{r.rps.leads}</td>
                    <td className="py-2 px-3 text-center">{r.rps.walkins}</td>
                    <td className="py-2 px-3 text-center font-bold text-green-700">{r.rps.admissions}</td>
                    <td className="py-2 px-3 text-center font-black text-[#091a4f]">{r.ris.admissions + r.rps.admissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ───────── 13b. YEAR-ON-YEAR MONTH COMPARISON (Dec-Apr) ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle
            title={`YoY Month-by-Month Comparison — Oct to Apr (${segmentLabel})`}
            sub={
              segment === "combined"
                ? `LY True Cost = Ad Spend + ₹2,50,000 salaries + ₹85,000 agency fee/mo · TY True Cost = Ad Spend + ${inr(monthlyFixed)} salaries/mo (no agency)`
                : `Salary & agency split equally per branch · LY True Cost = Ad Spend + ₹1,25,000 salary + ₹42,500 agency fee/mo · TY True Cost = Ad Spend + ${inr(monthlyFixed)} salary/mo (no agency)`
            }
          />
          {(() => {
            /* Segment-aware LY/TY fixed costs.
               LY: ₹3.35L combined (₹2.5L salary + ₹85k agency) → split 50/50 per branch.
               TY: monthlyFixed driven by salary slider, halved for single-branch view. */
            const LY_FIXED = segment === "combined" ? 335000 : 167500;
            // monthlyFixed is already segment-aware (₹2.5L combined / ₹1.25L per branch via DEFAULT_FIXED)
            const TY_FIXED = monthlyFixed;
            /* Oct/Nov 2025 = pre-DM-team organic months: no marketing manager, no agency, no ad spend.
               Department incurred ₹0 marketing dept cost. */
            const PRE_FIXED = 0;
            /* Per-branch organic admissions for Oct/Nov 2025 */
            const TY_PRE: Record<typeof segment, { oct: number; nov: number }> = {
              combined: { oct: 6, nov: 15 },   // 4+2, 8+7
              ris:      { oct: 4, nov: 8 },
              rps:      { oct: 2, nov: 7 },
            };
            const tyPre = TY_PRE[segment];
            const TY_OCT = { month: "Oct 25", spend: 0, leads: 0, walkins: 0, admissions: tyPre.oct, bookings: 0 };
            const TY_NOV = { month: "Nov 25", spend: 0, leads: 0, walkins: 0, admissions: tyPre.nov, bookings: 0 };
            /* LY pickers honour segment toggle */
            const lyPick = (i: number) =>
              segment === "ris" ? LAST_YEAR[i].ris
              : segment === "rps" ? LAST_YEAR[i].rps
              : { spend: LAST_YEAR[i].ris.spend + LAST_YEAR[i].rps.spend,
                  leads: LAST_YEAR[i].ris.leads + LAST_YEAR[i].rps.leads,
                  walkins: LAST_YEAR[i].ris.walkins + LAST_YEAR[i].rps.walkins,
                  admissions: LAST_YEAR[i].ris.admissions + LAST_YEAR[i].rps.admissions };
            const monthsYoY = [
              { label: "Oct", ly: lyPick(0), ty: TY_OCT, tyFixedOverride: PRE_FIXED },
              { label: "Nov", ly: lyPick(1), ty: TY_NOV, tyFixedOverride: PRE_FIXED },
              { label: "Dec", ly: lyPick(2), ty: segmentRows[0] },
              { label: "Jan", ly: lyPick(3), ty: segmentRows[1] },
              { label: "Feb", ly: lyPick(4), ty: segmentRows[2] },
              { label: "Mar", ly: lyPick(5), ty: segmentRows[3] },
              { label: "Apr", ly: lyPick(6), ty: segmentRows[4] },
            ] as Array<{ label: string; ly: { spend: number; leads: number; walkins: number; admissions: number }; ty: { spend: number; leads: number; walkins: number; admissions: number; bookings: number; month?: string }; tyFixedOverride?: number }>;
            type Row = {
              label: string;
              lySpend: number; tySpend: number;
              lyDept: number; tyDept: number;
              lyAdm: number; tyAdm: number;
              lyTrueCpa: number; tyTrueCpa: number;
              lyTrueRoi: number; tyTrueRoi: number;
            };
            const rows: Row[] = monthsYoY.map(m => {
              const lySpend = m.ly.spend;
              const tySpend = m.ty.spend;
              const lyAdm = m.ly.admissions;
              const tyAdm = m.ty.admissions;
              const lyDept = lySpend + LY_FIXED;
              const tyDept = tySpend + (m.tyFixedOverride ?? TY_FIXED);
              const lyRev = lyAdm * MIN_REVENUE_PER_ADM;
              const tyRev = tyAdm * MIN_REVENUE_PER_ADM;
              return {
                label: m.label,
                lySpend, tySpend,
                lyDept, tyDept,
                lyAdm, tyAdm,
                lyTrueCpa: lyAdm > 0 ? lyDept / lyAdm : 0,
                tyTrueCpa: tyAdm > 0 ? tyDept / tyAdm : 0,
                lyTrueRoi: lyDept > 0 ? ((lyRev - lyDept) / lyDept) * 100 : 0,
                tyTrueRoi: tyDept > 0 ? ((tyRev - tyDept) / tyDept) * 100 : 0,
              };
            });
            const tot: Row = rows.reduce((a, r) => ({
              label: "TOTAL",
              lySpend: a.lySpend + r.lySpend, tySpend: a.tySpend + r.tySpend,
              lyDept: a.lyDept + r.lyDept, tyDept: a.tyDept + r.tyDept,
              lyAdm: a.lyAdm + r.lyAdm, tyAdm: a.tyAdm + r.tyAdm,
              lyTrueCpa: 0, tyTrueCpa: 0, lyTrueRoi: 0, tyTrueRoi: 0,
            }), { label: "TOTAL", lySpend: 0, tySpend: 0, lyDept: 0, tyDept: 0, lyAdm: 0, tyAdm: 0, lyTrueCpa: 0, tyTrueCpa: 0, lyTrueRoi: 0, tyTrueRoi: 0 });
            tot.lyTrueCpa = tot.lyAdm > 0 ? tot.lyDept / tot.lyAdm : 0;
            tot.tyTrueCpa = tot.tyAdm > 0 ? tot.tyDept / tot.tyAdm : 0;
            tot.lyTrueRoi = tot.lyDept > 0 ? ((tot.lyAdm * MIN_REVENUE_PER_ADM - tot.lyDept) / tot.lyDept) * 100 : 0;
            tot.tyTrueRoi = tot.tyDept > 0 ? ((tot.tyAdm * MIN_REVENUE_PER_ADM - tot.tyDept) / tot.tyDept) * 100 : 0;

            const deltaPct = (ly: number, ty: number) => ly === 0 ? 0 : ((ty - ly) / ly) * 100;
            // For cost-style metrics lower is better → green when delta < 0
            const DeltaCell = ({ ly, ty, lowerBetter = false, isPP = false }: { ly: number; ty: number; lowerBetter?: boolean; isPP?: boolean }) => {
              const d = isPP ? (ty - ly) : deltaPct(ly, ty);
              const positive = d > 0;
              const good = lowerBetter ? !positive : positive;
              if (Math.abs(d) < 0.05) return <span className="text-gray-400">—</span>;
              const cls = good ? "text-green-700" : "text-red-600";
              const txt = isPP ? `${positive ? "+" : ""}${d.toFixed(0)} pp` : `${positive ? "+" : ""}${d.toFixed(1)}%`;
              return <span className={`font-semibold ${cls}`}>{txt}</span>;
            };

            // Top KPI summary
            const totalSavings = (tot.lyDept - tot.tyDept);
            const admDelta = deltaPct(tot.lyAdm, tot.tyAdm);
            const cpaDelta = deltaPct(tot.lyTrueCpa, tot.tyTrueCpa);

            return (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  <div className="rounded-xl p-4 bg-blue-50 border-l-4 border-blue-400">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-blue-700">LY Total Ad Spend</div>
                    <div className="text-2xl font-black text-[#091a4f] mt-1">{inr(tot.lySpend)}</div>
                    <div className="text-[11px] text-gray-500 mt-1">TY: {inr(tot.tySpend)} · <DeltaCell ly={tot.lySpend} ty={tot.tySpend} lowerBetter /></div>
                  </div>
                  <div className="rounded-xl p-4 bg-amber-50 border-l-4 border-amber-400">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-amber-700">LY Total Dept Cost</div>
                    <div className="text-2xl font-black text-[#091a4f] mt-1">{inr(tot.lyDept)}</div>
                    <div className="text-[11px] text-gray-500 mt-1">TY: {inr(tot.tyDept)} · {totalSavings >= 0 ? <span className="text-green-700 font-semibold">saved {inr(totalSavings)}</span> : <span className="text-red-600 font-semibold">+{inr(-totalSavings)}</span>}</div>
                  </div>
                  <div className="rounded-xl p-4 bg-green-50 border-l-4 border-green-400">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-green-700">Admissions YoY</div>
                    <div className="text-2xl font-black text-[#091a4f] mt-1">{tot.lyAdm} → {tot.tyAdm}</div>
                    <div className="text-[11px] text-gray-500 mt-1"><DeltaCell ly={tot.lyAdm} ty={tot.tyAdm} /></div>
                  </div>
                  <div className="rounded-xl p-4 bg-purple-50 border-l-4 border-purple-400">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-purple-700">True CPA YoY</div>
                    <div className="text-2xl font-black text-[#091a4f] mt-1">{inr(tot.lyTrueCpa)} → {inr(tot.tyTrueCpa)}</div>
                    <div className="text-[11px] text-gray-500 mt-1"><DeltaCell ly={tot.lyTrueCpa} ty={tot.tyTrueCpa} lowerBetter /> {cpaDelta < 0 ? "(more efficient)" : "(less efficient)"}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: SLATE }} className="text-white">
                        <th rowSpan={2} className="py-2 px-2 text-left font-semibold">Month</th>
                        <th colSpan={3} className="py-2 px-2 text-center font-semibold border-l border-white/20">Ad Spend</th>
                        <th colSpan={3} className="py-2 px-2 text-center font-semibold border-l border-white/20">Dept Cost (Ad + Fixed)</th>
                        <th colSpan={3} className="py-2 px-2 text-center font-semibold border-l border-white/20">Admissions</th>
                        <th colSpan={3} className="py-2 px-2 text-center font-semibold border-l border-white/20">True CPA</th>
                        <th colSpan={3} className="py-2 px-2 text-center font-semibold border-l border-white/20">True ROI</th>
                      </tr>
                      <tr style={{ background: SLATE }} className="text-white text-[10px]">
                        <th className="py-1 px-2 text-center border-l border-white/20">LY 24-25</th><th className="py-1 px-2 text-center">TY 25-26</th><th className="py-1 px-2 text-center">Δ</th>
                        <th className="py-1 px-2 text-center border-l border-white/20">LY</th><th className="py-1 px-2 text-center">TY</th><th className="py-1 px-2 text-center">Δ</th>
                        <th className="py-1 px-2 text-center border-l border-white/20">LY</th><th className="py-1 px-2 text-center">TY</th><th className="py-1 px-2 text-center">Δ</th>
                        <th className="py-1 px-2 text-center border-l border-white/20">LY</th><th className="py-1 px-2 text-center">TY</th><th className="py-1 px-2 text-center">Δ</th>
                        <th className="py-1 px-2 text-center border-l border-white/20">LY</th><th className="py-1 px-2 text-center">TY</th><th className="py-1 px-2 text-center">Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, i) => (
                        <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                          <td className="py-2 px-2 font-bold text-[#091a4f]">{r.label}</td>
                          <td className="py-2 px-2 text-center border-l border-gray-100">{inr(r.lySpend)}</td>
                          <td className="py-2 px-2 text-center">{inr(r.tySpend)}</td>
                          <td className="py-2 px-2 text-center"><DeltaCell ly={r.lySpend} ty={r.tySpend} lowerBetter /></td>
                          <td className="py-2 px-2 text-center border-l border-gray-100">{inr(r.lyDept)}</td>
                          <td className="py-2 px-2 text-center">{inr(r.tyDept)}</td>
                          <td className="py-2 px-2 text-center"><DeltaCell ly={r.lyDept} ty={r.tyDept} lowerBetter /></td>
                          <td className="py-2 px-2 text-center border-l border-gray-100 font-bold text-green-700">{r.lyAdm}</td>
                          <td className="py-2 px-2 text-center font-bold text-green-700">{r.tyAdm}</td>
                          <td className="py-2 px-2 text-center"><DeltaCell ly={r.lyAdm} ty={r.tyAdm} /></td>
                          <td className="py-2 px-2 text-center border-l border-gray-100">{inr(r.lyTrueCpa)}</td>
                          <td className="py-2 px-2 text-center">{inr(r.tyTrueCpa)}</td>
                          <td className="py-2 px-2 text-center"><DeltaCell ly={r.lyTrueCpa} ty={r.tyTrueCpa} lowerBetter /></td>
                          <td className="py-2 px-2 text-center border-l border-gray-100">{r.lyTrueRoi.toFixed(0)}%</td>
                          <td className="py-2 px-2 text-center">{r.tyTrueRoi.toFixed(0)}%</td>
                          <td className="py-2 px-2 text-center"><DeltaCell ly={r.lyTrueRoi} ty={r.tyTrueRoi} isPP /></td>
                        </tr>
                      ))}
                      <tr className="bg-[#091a4f]/5 border-t-2 border-[#091a4f]">
                        <td className="py-2 px-2 font-black text-[#091a4f]">TOTAL</td>
                        <td className="py-2 px-2 text-center font-bold border-l border-gray-200">{inr(tot.lySpend)}</td>
                        <td className="py-2 px-2 text-center font-bold">{inr(tot.tySpend)}</td>
                        <td className="py-2 px-2 text-center"><DeltaCell ly={tot.lySpend} ty={tot.tySpend} lowerBetter /></td>
                        <td className="py-2 px-2 text-center font-bold border-l border-gray-200">{inr(tot.lyDept)}</td>
                        <td className="py-2 px-2 text-center font-bold">{inr(tot.tyDept)}</td>
                        <td className="py-2 px-2 text-center"><DeltaCell ly={tot.lyDept} ty={tot.tyDept} lowerBetter /></td>
                        <td className="py-2 px-2 text-center font-black text-green-700 border-l border-gray-200">{tot.lyAdm}</td>
                        <td className="py-2 px-2 text-center font-black text-green-700">{tot.tyAdm}</td>
                        <td className="py-2 px-2 text-center"><DeltaCell ly={tot.lyAdm} ty={tot.tyAdm} /></td>
                        <td className="py-2 px-2 text-center font-bold border-l border-gray-200">{inr(tot.lyTrueCpa)}</td>
                        <td className="py-2 px-2 text-center font-bold">{inr(tot.tyTrueCpa)}</td>
                        <td className="py-2 px-2 text-center"><DeltaCell ly={tot.lyTrueCpa} ty={tot.tyTrueCpa} lowerBetter /></td>
                        <td className="py-2 px-2 text-center font-bold border-l border-gray-200">{tot.lyTrueRoi.toFixed(0)}%</td>
                        <td className="py-2 px-2 text-center font-bold">{tot.tyTrueRoi.toFixed(0)}%</td>
                        <td className="py-2 px-2 text-center"><DeltaCell ly={tot.lyTrueRoi} ty={tot.tyTrueRoi} isPP /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-[11px] text-gray-500 leading-relaxed">
                  <strong>Method:</strong> LY Dept Cost adds ₹3,35,000/mo (₹2,50,000 salary + ₹85,000 agency retainer). TY Dept Cost adds {inr(monthlyFixed)}/mo (in-house — no agency fee). True CPA = Dept Cost ÷ Admissions. True ROI = (Revenue − Dept Cost) ÷ Dept Cost, where revenue = admissions × ₹90,000 minimum. Green Δ = better outcome (lower cost / higher admissions / higher ROI).
                </div>
              </>
            );
          })()}
        </section>

        {/* ───────── BROCHURE DOWNLOAD REQUESTS ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100" data-testid="section-brochure-requests">
          <SectionTitle
            title="Brochure Requests"
            sub="Latest privilege card numbers submitted via the Brand Partners brochure modal"
            badge={`${brochureReqs.length} TOTAL`}
          />
          {brochureLoading ? (
            <div className="text-xs text-gray-500" data-testid="text-brochure-loading">Loading…</div>
          ) : brochureReqs.length === 0 ? (
            <div className="text-xs text-gray-500" data-testid="text-brochure-empty">
              No brochure requests captured yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs" data-testid="table-brochure-requests">
                <thead>
                  <tr style={{ background: SLATE }} className="text-white">
                    <th className="py-2 px-3 text-left font-semibold">Requested</th>
                    <th className="py-2 px-3 text-left font-semibold">Privilege Card</th>
                  </tr>
                </thead>
                <tbody>
                  {brochureReqs.slice(0, 10).map((req, i) => (
                    <tr
                      key={req.id}
                      className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}
                      data-testid={`row-brochure-${req.id}`}
                    >
                      <td className="py-2 px-3 text-gray-600 whitespace-nowrap" data-testid={`text-brochure-time-${req.id}`}>
                        {new Date(req.requestedAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 px-3 font-bold text-[#091a4f]" data-testid={`text-brochure-card-${req.id}`}>
                        {req.cardNumber}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-[11px] text-gray-500">
                {brochureReqs.length > 10
                  ? `Showing 10 most recent of ${brochureReqs.length} total requests. `
                  : ""}
                Optional contact details (name, phone, email) are stored privately and not shown here.
              </div>
            </div>
          )}
        </section>

        {/* ───────── 14. DYNAMIC INSIGHTS ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Opportunities & Suggestions" sub={`Auto-generated from ${segmentLabel} data — recomputed on every segment / cost change`} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.filter(ins => ins.severity === "opportunity").map((ins, i) => {
              const tag = ins.severity === "critical" ? { emoji: "🔴", label: "CRITICAL", bg: "bg-red-50", border: "border-red-400", text: "text-red-700" }
                : ins.severity === "warning" ? { emoji: "🟡", label: "WARNING", bg: "bg-amber-50", border: "border-amber-400", text: "text-amber-700" }
                : { emoji: "🟢", label: "OPPORTUNITY", bg: "bg-green-50", border: "border-green-400", text: "text-green-700" };
              return (
                <div key={i} className={`rounded-xl p-4 border-l-4 ${tag.bg} ${tag.border}`}>
                  <div className={`text-[10px] font-black uppercase tracking-wider mb-2 ${tag.text} flex items-center gap-1`}>
                    <span>{tag.emoji}</span><span>{tag.label}</span>
                  </div>
                  <div className="font-bold text-sm text-gray-800 mb-2">{ins.title}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{ins.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6 pt-2 border-t border-gray-200">
          <div>This dashboard is strictly confidential — for internal management use only.</div>
          <div className="mt-1">Data sourced from DM Performance Tracker (Nabeel sub-sheet) and DM Target-Wise Report (June 2025).</div>
          <div className="mt-1">Last updated: {LAST_UPDATED} · Notes: prior-month RIS/RPS splits use April-derived ratios where source split was unavailable. True CPA uses editable salary defaults.</div>
        </div>
      </div>
    </div>
  );
}
