import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area,
} from "recharts";
import {
  LAST_UPDATED,
  TODAY_DATE as TODAY_DATE_STATIC,
  DAYS_IN_MAY,
  DAYS_IN_CURRENT_MONTH,
  MIN_REVENUE_PER_ADM,
  MAY_IDX,
  CURRENT_IDX,
  MONTHLY as MONTHLY_STATIC,
  ORGANIC_PRE_SPEND,
  LAST_YEAR,
  MAY_WEEKLY,
  SOCIAL,
  DEFAULT_FIXED,
  type SegmentKey,
  type MetricSet,
  type MonthRow,
} from "@shared/marketingData";

/* ── Live data types ── */
type LiveCrmEntry = { leads: number; bookings: number; walkins: number; admissions: number; closed: number };
type LiveBranch = { centre: string } & LiveCrmEntry;
type LiveGroup  = { group: string  } & LiveCrmEntry;
type LiveRpsMonth = { month: string; branches: LiveBranch[]; total: LiveCrmEntry; closedReasons: Array<{reason:string;count:number}> };
type LiveRisMonth = { month: string; groups: LiveGroup[];    total: LiveCrmEntry; closedReasons: Array<{reason:string;count:number}> };
type LiveSpendEntry = { month: string; salaries: number; meta: number; google: number; adSpend: number };
type LiveData = {
  generatedAt: string;
  currentDayOfMonth: number;
  monthlyTotals: Array<{ month: string; leads: number; bookings: number; walkins: number; admissions: number; meta: number; google: number; spend: number }>;
  mayWeeklyCombined: Array<{ week: string; leads: number; bookings: number; walkins: number; admissions: number; spend: number }>;
  risWeekly: Array<{ week: string; leads: number; bookings: number; walkins: number; admissions: number }>;
  rpsWeekly: Array<{ week: string; leads: number; bookings: number; walkins: number; admissions: number }>;
  rpsCrm: { byMonth: LiveRpsMonth[]; closedReasons: Array<{ reason: string; count: number }>; statusSummary: Record<string,number>; bySource: Record<string,number> };
  risCrm: { byMonth: LiveRisMonth[]; closedReasons: Array<{ reason: string; count: number }>; statusSummary: Record<string,number>; bySource: Record<string,number> };
  rpsSchoolMonthly: Array<{ month: string; walkins: number; admissions: number }>;
  risSchoolMonthly: Array<{ month: string; walkins: number; admissions: number }>;
  risSpend: LiveSpendEntry[];
  rpsSpend: LiveSpendEntry[];
};

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", CYAN = "#0891b2", PURPLE = "#7c3aed", SLATE = "#475569";

const MAY_RIS_BASE = MONTHLY_STATIC[MAY_IDX].ris;
const MAY_RPS_BASE = MONTHLY_STATIC[MAY_IDX].rps;

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const inr = (n: number) => Number.isFinite(n) ? `₹${Math.round(n).toLocaleString("en-IN")}` : "—";
const num = (n: number) => Number.isFinite(n) ? Math.round(n).toLocaleString("en-IN") : "—";
const pct = (n: number) => Number.isFinite(n) ? `${n.toFixed(1)}%` : "—";

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
const cpa = (spend: number, adm: number) => adm > 0 ? spend / adm : Infinity;
const trueCpa = (spend: number, adm: number, monthlyFixed: number, months: number) =>
  adm > 0 ? (spend + monthlyFixed * months) / adm : Infinity;
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

const MARKETING_PASSCODE = "8888";
const MARKETING_AUTH_KEY = "ris_marketing_auth";

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Marketing Dashboard | Rainbow International School";
    inputRef.current?.focus();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === MARKETING_PASSCODE) {
      try { sessionStorage.setItem(MARKETING_AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else {
      setError(true);
      setCode("");
      setTimeout(() => setError(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#091a4f" }} data-testid="passcode-gate">
      <form
        onSubmit={submit}
        className={`w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400 ${error ? "animate-shake" : ""}`}
        style={{ animation: error ? "shake 0.4s" : undefined }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-base">RIS</div>
          <div>
            <div className="font-black text-lg leading-tight text-[#091a4f]">Marketing Dashboard</div>
            <div className="text-xs text-slate-500">Internal · Passcode required</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.5em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          placeholder="••••"
          data-testid="input-passcode"
        />
        {error && <div className="mt-2 text-sm text-red-600 text-center" data-testid="text-passcode-error">Incorrect passcode</div>}
        <button
          type="submit"
          className="mt-5 w-full py-3 rounded-lg bg-[#091a4f] text-white font-bold hover:bg-[#0b2168] transition"
          data-testid="button-unlock"
        >
          Unlock
        </button>
      </form>
      <style>{`@keyframes shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

export default function Marketing() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(MARKETING_AUTH_KEY) === "1"; } catch { return false; }
  });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <MarketingDashboard />;
}

function MarketingDashboard() {
  const [segment, setSegment] = useState<SegmentKey>("combined");
  const [chartTab, setChartTab] = useState<"leads" | "spend" | "roi" | "truecpa" | "funnel">("leads");
  const [weeklyTab, setWeeklyTab] = useState<SegmentKey>("combined");
  const [weeklyMonth, setWeeklyMonth] = useState<string>("Jun 26");
  const [calcSpend, setCalcSpend] = useState<number>(100000);
  const [calcMonth, setCalcMonth] = useState<string>("Jun 26");
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

  /* Live data from Google Sheets */
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [liveLoading, setLiveLoading] = useState<boolean>(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [rpsCrmMonth, setRpsCrmMonth] = useState<string>("");
  const [risCrmMonth, setRisCrmMonth] = useState<string>("");
  const [branchCompareMonth, setBranchCompareMonth] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview"|"whatif"|"crm"|"trends"|"summary">("overview");

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

  /* Live Google Sheets fetch — auto-refresh every 5 minutes, also manual */
  const cancelledRef = useRef(false);
  const fetchLive = useCallback(() => {
    setLiveLoading(true);
    fetch("/api/marketing/live")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((data: LiveData) => { if (!cancelledRef.current) { setLiveData(data); setLiveError(null); } })
      .catch(err => { if (!cancelledRef.current) setLiveError(String(err)); })
      .finally(() => { if (!cancelledRef.current) setLiveLoading(false); });
  }, []);
  useEffect(() => {
    cancelledRef.current = false;
    fetchLive();
    const iv = setInterval(fetchLive, 5 * 60 * 1000);
    return () => { cancelledRef.current = true; clearInterval(iv); };
  }, [fetchLive]);

  /* Reset cost inputs when segment changes */
  useEffect(() => {
    const def = DEFAULT_FIXED[segment];
    setSalaryCost(def.salary); setCrmCost(def.crm); setOverheadCost(def.overhead);
  }, [segment]);

  const monthlyFixed = salaryCost + crmCost + overheadCost;

  /* ── Live MONTHLY override (only current month affected; spend kept from static for RIS/RPS) ── */
  const TODAY_DATE = liveData?.currentDayOfMonth ?? TODAY_DATE_STATIC;
  const DASH_TO_CRM: Record<string, string> = {
    "Jun 25":"Jun-25","Jul 25":"Jul-25","Aug 25":"Aug-25","Sep 25":"Sep-25",
    "Oct 25":"Oct-25","Nov 25":"Nov-25","Dec 25":"Dec-25","Jan 26":"Jan-26",
    "Feb 26":"Feb-26","Mar 26":"Mar-26","Apr 26":"Apr-26","May 26":"May-26",
    "Jun 26":"Jun-26",
  };
  const MONTHLY_LIVE = useMemo<MonthRow[]>(() => {
    if (!liveData?.monthlyTotals?.length) return MONTHLY_STATIC;
    return MONTHLY_STATIC.map(row => {
      const live = liveData.monthlyTotals.find(m => m.month === row.month);
      const crmKey = DASH_TO_CRM[row.month] ?? "";
      const risMon = liveData.risCrm.byMonth.find(m => m.month === crmKey);
      const rpsMon = liveData.rpsCrm.byMonth.find(m => m.month === crmKey);
      // Per-school master sheet is source of truth for walkins/admissions (CRM lags current month)
      const rpsSchool = liveData.rpsSchoolMonthly?.find(s => s.month === crmKey);
      const risSchool = liveData.risSchoolMonthly?.find(s => s.month === crmKey);
      // Live Meta/Google spend from the "Digital Marketing Spend Analysis" table in each school tab
      const risSpendLive = liveData.risSpend?.find(s => s.month === row.month);
      const rpsSpendLive = liveData.rpsSpend?.find(s => s.month === row.month);

      // If DM Overall has no entry AND no CRM/school/spend data, keep static row as-is
      if (!live && !risMon && !rpsMon && !rpsSchool && !risSchool && !risSpendLive && !rpsSpendLive) return row;

      const risBase: MetricSet = risMon
        ? { ...row.ris, leads: risMon.total.leads, bookings: risMon.total.bookings,
            walkins: risSchool ? risSchool.walkins : risMon.total.walkins,
            admissions: risSchool ? risSchool.admissions : risMon.total.admissions }
        : row.ris;
      const rpsBase: MetricSet = rpsMon
        ? { ...row.rps, leads: rpsMon.total.leads, bookings: rpsMon.total.bookings,
            walkins: rpsSchool ? rpsSchool.walkins : rpsMon.total.walkins,
            admissions: rpsSchool ? rpsSchool.admissions : rpsMon.total.admissions }
        : row.rps;

      // For combined: use DM Overall if available; otherwise derive from per-school data
      const risOut: MetricSet = risSpendLive && risSpendLive.adSpend > 0
        ? { ...risBase, meta: risSpendLive.meta, google: risSpendLive.google, spend: risSpendLive.adSpend }
        : risBase;
      const rpsOut: MetricSet = rpsSpendLive && rpsSpendLive.adSpend > 0
        ? { ...rpsBase, meta: rpsSpendLive.meta, google: rpsSpendLive.google, spend: rpsSpendLive.adSpend }
        : rpsBase;
      // Leads & bookings always come from CRM (RIS+RPS sum); DM Overall only captures
      // digitally-tracked leads and undercounts both fields vs the full CRM record.
      const crmLeads    = risOut.leads    + rpsOut.leads;
      const crmBookings = risOut.bookings + rpsOut.bookings;
      const combinedOut: MetricSet = live
        ? { leads: crmLeads, bookings: crmBookings, walkins: live.walkins, admissions: live.admissions, spend: live.spend, meta: live.meta, google: live.google }
        : { leads: crmLeads, bookings: crmBookings,
            walkins: risOut.walkins + rpsOut.walkins, admissions: risOut.admissions + rpsOut.admissions,
            spend: risOut.spend + rpsOut.spend, meta: risOut.meta + rpsOut.meta, google: risOut.google + rpsOut.google };

      return { month: row.month, combined: combinedOut, ris: risOut, rps: rpsOut };
    });
  }, [liveData]);

  /* ── Memoized derived datasets ── */
  const segmentRows = useMemo(() => MONTHLY_LIVE.map(m => ({ month: m.month, ...getSegment(m, segment) })), [segment, MONTHLY_LIVE]);
  const totals = useMemo(() => totalsFor(MONTHLY_LIVE, segment), [segment, MONTHLY_LIVE]);
  const totalMonths = MONTHLY_LIVE.length;

  type WeekRow = { week: string; leads: number; bookings: number; walkins: number; admissions: number };
  const weeklyTableRows = useMemo((): WeekRow[] => {
    const isMay = weeklyMonth === "May 26";
    const monthMark = isMay ? "/05" : "/06";
    if (weeklyTab === "ris") {
      if (!isMay && liveData?.risWeekly?.length) return liveData.risWeekly;
      return MAY_WEEKLY.map(w => ({ week: w.week, leads: w.risLeads, bookings: w.risBook, walkins: w.risWalk, admissions: w.risAdm }));
    }
    if (weeklyTab === "rps") {
      if (!isMay && liveData?.rpsWeekly?.length) return liveData.rpsWeekly;
      return MAY_WEEKLY.map(w => ({ week: w.week, leads: w.rpsLeads, bookings: w.rpsBook, walkins: w.rpsWalk, admissions: w.rpsAdm }));
    }
    // combined — use live mayWeeklyCombined filtered by month
    const live = liveData?.mayWeeklyCombined.filter(w => w.week.includes(monthMark)) ?? [];
    if (live.length) return live;
    return MAY_WEEKLY.map(w => ({ week: w.week, leads: w.risLeads + w.rpsLeads, bookings: w.risBook + w.rpsBook, walkins: w.risWalk + w.rpsWalk, admissions: w.risAdm + w.rpsAdm }));
  }, [liveData, weeklyMonth, weeklyTab]);

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

  const current = segmentRows[CURRENT_IDX]; // Jun 26 (in progress)
  const previous = segmentRows[MAY_IDX];    // May 26 (final)

  /* June last year (index 8 = "Jun 25" in LAST_YEAR) */
  const mayLastYear = useMemo(() => {
    const ly = LAST_YEAR[8]; // Jun 25
    if (segment === "combined") return { spend: ly.ris.spend + ly.rps.spend, leads: ly.ris.leads + ly.rps.leads, walkins: ly.ris.walkins + ly.rps.walkins, admissions: ly.ris.admissions + ly.rps.admissions, bookings: 0 };
    return { ...ly[segment as "ris" | "rps"], bookings: 0 };
  }, [segment]);

  /* TY Oct–May totals: Oct/Nov 25 had ₹0 spend & 0 tracked digital leads; admissions from ORGANIC_PRE_SPEND oct+nov */
  const TY_OCT_NOV_ADM = { combined: 21, ris: 12, rps: 9 }; // oct+nov 25 organic adm per segment
  const tyOctMayTotals = useMemo(() => {
    const dec_may = totalsFor(MONTHLY_LIVE, segment); // Dec 25 – May 26 (all 6 rows)
    return {
      leads:       dec_may.leads,       // Oct/Nov digital leads untracked; Dec-May only
      walkins:     dec_may.walkins,     // same
      admissions:  dec_may.admissions + TY_OCT_NOV_ADM[segment], // add organic Oct+Nov adm
      spend:       dec_may.spend,       // Oct/Nov had ₹0 ad spend
    };
  }, [segment]);

  /* LY Oct–Jun totals (LAST_YEAR indices 0–8: Oct 24 → Jun 25) */
  const lyOctMayTotals = useMemo(() => {
    const slice = LAST_YEAR.slice(0, 9); // Oct 24 → Jun 25
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

  /* Full-AY totals — Jun 2025 through Jun 2026 YTD (reconciled with sheet's TOTAL TILL DATE) */
  const organic = ORGANIC_PRE_SPEND[segment];
  const ytdAdmissionsFull = totals.admissions + organic.admissions;
  const ytdLeadsFull     = totals.leads     + organic.leads;
  const ytdBookingsFull  = totals.bookings  + organic.bookings;
  const ytdWalkinsFull   = totals.walkins   + organic.walkins;
  /* All efficiency metrics use the full-AY admissions denominator */
  const admForCosts = ytdAdmissionsFull;

  /* Conversion funnel rates — full-AY basis */
  const funnelData = [
    { name: "Leads",      value: ytdLeadsFull,     fill: NAVY   },
    { name: "Bookings",   value: ytdBookingsFull,   fill: PURPLE },
    { name: "Walk-ins",   value: ytdWalkinsFull,    fill: CYAN   },
    { name: "Admissions", value: ytdAdmissionsFull, fill: GREEN  },
  ];
  const leadToWalk = ytdLeadsFull    ? (ytdWalkinsFull   / ytdLeadsFull)    * 100 : 0;
  const walkToAdm  = ytdWalkinsFull  ? (ytdAdmissionsFull / ytdWalkinsFull)  * 100 : 0;
  const bookToAdm  = ytdBookingsFull ? (ytdAdmissionsFull / ytdBookingsFull) * 100 : 0;

  /* YTD totals using full-AY admissions (matches sheet's CPA ₹6,960 / True CPA ₹14,772) */
  const ytdRevenue = admForCosts * MIN_REVENUE_PER_ADM;
  const ytdMarketingCpa = cpa(totals.spend, admForCosts);
  const ytdTrueCpa = trueCpa(totals.spend, admForCosts, monthlyFixed, totalMonths);
  const ytdMarketingRoi = roi(ytdRevenue, totals.spend);
  const ytdTrueRoi = roi(ytdRevenue, totals.spend + monthlyFixed * totalMonths);

  /* June Forecast (linear pace projection) */
  const fcMul = DAYS_IN_CURRENT_MONTH / TODAY_DATE;
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
  const trendDirection = cpa(current.spend, current.admissions) < cpa(previous.spend, previous.admissions)
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

    /* June pace — only show when month is still running */
    if (TODAY_DATE < DAYS_IN_CURRENT_MONTH && forecast.leads < previous.leads * 0.95) {
      arr.push({ severity: "warning", title: "June tracking below May",
        body: `Forecasted June leads (${num(forecast.leads)}) projected below May (${num(previous.leads)}). Boost spend or refresh creatives in remaining ${DAYS_IN_CURRENT_MONTH - TODAY_DATE} days.` });
    }

    /* YoY growth */
    if (totalsLastYearSegment.admissions > 0) {
      const lyNormalized = (totalsLastYearSegment.admissions / 9) * totalMonths;
      const yoyGrowth = ((totals.admissions - lyNormalized) / lyNormalized) * 100;
      arr.push({ severity: yoyGrowth > 0 ? "opportunity" : "warning",
        title: `YoY admissions ${yoyGrowth > 0 ? "growth" : "decline"}: ${Math.abs(yoyGrowth).toFixed(0)}%`,
        body: `This year (${segment.toUpperCase()}) admissions per month avg: ${(totals.admissions / totalMonths).toFixed(1)} vs last year ${(totalsLastYearSegment.admissions / 9).toFixed(1)}. Marketing efficiency is ${yoyGrowth > 0 ? "improving" : "regressing"}.` });
    }

    /* RIS vs RPS specific */
    if (segment === "combined") {
      const aprRis = MONTHLY_LIVE[4].ris, aprRps = MONTHLY_LIVE[4].rps;
      const risConv = (aprRis.admissions / aprRis.leads) * 100;
      const rpsConv = (aprRps.admissions / aprRps.leads) * 100;
      if (Math.abs(risConv - rpsConv) > 1) {
        const winner = risConv > rpsConv ? "RIS" : "RPS";
        arr.push({ severity: "opportunity", title: `${winner} converted better in April`,
          body: `April RIS conversion: ${risConv.toFixed(1)}% vs RPS: ${rpsConv.toFixed(1)}%. Study ${winner} tour/calling process and replicate for the other branch.` });
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
          <button
            onClick={fetchLive}
            disabled={liveLoading}
            data-testid="button-refresh-live"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400 text-[#091a4f] font-bold text-[11px] uppercase tracking-wide hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className={`w-3 h-3 ${liveLoading ? "animate-spin" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {liveLoading ? "Syncing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* ─── Tab bar ─── */}
      <div className="sticky top-[53px] z-30 border-b border-white/10 shadow-md" style={{ background: NAVY }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {([
            ["overview", "Overview"],
            ["whatif",   "What-If"],
            ["crm",      "CRM"],
            ["trends",   "Trends"],
            ["summary",  "Summary"],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2"
              style={{
                color: activeTab === id ? AMBER : "rgba(255,255,255,0.65)",
                borderBottomColor: activeTab === id ? AMBER : "transparent",
                background: "transparent",
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ══ OVERVIEW ══════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && <>

        {/* ───────── 1. PRIMARY KPI ROW ───────── */}
        <section>
          <SectionTitle title={`Year-to-Date Performance (${segmentLabel})`} sub={`Full AY 2025–26 (Jun 2025 – ${LAST_UPDATED})`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Total Leads" value={num(ytdLeadsFull)} sub={`${(ytdLeadsFull / 12).toFixed(0)} avg/month`} color={NAVY} />
            <KpiCard label="Total Bookings" value={num(ytdBookingsFull)} sub={`${pct((ytdBookingsFull / Math.max(ytdLeadsFull, 1)) * 100)} of leads`} color={PURPLE} />
            <KpiCard label="Total Walk-ins" value={num(ytdWalkinsFull)} sub={`${pct(leadToWalk)} of leads`} color={CYAN} />
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
            <KpiCard label="Walk-in → Adm" value={pct(walkToAdm)} sub={`${num(admForCosts)} of ${num(ytdWalkinsFull)} walk-ins`} color={GREEN} />
          </div>
        </section>

        {/* ───────── 3. MoM Comparison ───────── */}
        <section>
          <SectionTitle title="Month-over-Month Comparison" sub={`June 2026 (in progress, ${TODAY_DATE} days) vs May 2026 (final)`} />
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
                  <div className="text-[11px] text-gray-500 mt-1">vs May: {k.format(k.prev)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[12px] text-gray-500 italic">
            June 2026 is in progress ({TODAY_DATE} days captured: June 1–{TODAY_DATE}). Compares partial-June to final May — see Forecast section for projected month-end values.
          </div>
        </section>

        {/* ───────── 3b. Year-over-Year Comparison ───────── */}
        <section>
          <SectionTitle title="Year-over-Year Comparison" sub={`June 2026 (partial, ${TODAY_DATE} days) vs June 2025 (full month)`} />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Leads",              curr: current.leads,       prev: mayLastYear.leads,       format: num },
              { label: "Walk-ins",           curr: current.walkins,     prev: mayLastYear.walkins,     format: num },
              { label: "Admissions",         curr: current.admissions,  prev: mayLastYear.admissions,  format: num },
              { label: "Marketing Spend",    curr: current.spend,                        prev: mayLastYear.spend,                        format: inr, invert: true },
              { label: "Total Spend (incl. Salary)", curr: current.spend + monthlyFixed,  prev: mayLastYear.spend + monthlyFixed,  format: inr, invert: true },
              { label: "Marketing CPA",      curr: cpa(current.spend, current.admissions),                          prev: cpa(mayLastYear.spend, mayLastYear.admissions),                          format: inr, invert: true },
              { label: "True CPA",           curr: trueCpa(current.spend, current.admissions, monthlyFixed, 1),     prev: trueCpa(mayLastYear.spend, mayLastYear.admissions, monthlyFixed, 1),     format: inr, invert: true },
              { label: "Revenue (Min.)",     curr: current.admissions * MIN_REVENUE_PER_ADM,                        prev: mayLastYear.admissions * MIN_REVENUE_PER_ADM,                              format: inr },
              { label: "Walk-in → Adm %",   curr: (current.admissions / Math.max(current.walkins, 1)) * 100,       prev: (mayLastYear.admissions / Math.max(mayLastYear.walkins, 1)) * 100,       format: pct },
              { label: "Min. ROI %",         curr: roi(current.admissions * MIN_REVENUE_PER_ADM, current.spend),   prev: roi(mayLastYear.admissions * MIN_REVENUE_PER_ADM, mayLastYear.spend),   format: (n: number) => `${Math.round(n)}%` },
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
                  <div className="text-[11px] text-gray-500 mt-1">vs Jun 25: {k.format(k.prev)}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ───────── 4. June Forecast (with True CPA) ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle
            title={TODAY_DATE >= DAYS_IN_CURRENT_MONTH ? "June 2026 — Final Actuals" : "June 2026 Forecast (Projected Month-End)"}
            sub={TODAY_DATE >= DAYS_IN_CURRENT_MONTH ? `Month complete · All ${DAYS_IN_CURRENT_MONTH} days captured · ${LAST_UPDATED}` : `Linear pace projection: ${TODAY_DATE} days elapsed × ${fcMul.toFixed(2)}× multiplier`}
            badge={`Confidence: ${fcConfidence}`}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: TODAY_DATE >= DAYS_IN_CURRENT_MONTH ? "Final Leads" : "Forecasted Leads", curr: current.leads, fc: forecast.leads, color: NAVY },
              { label: TODAY_DATE >= DAYS_IN_CURRENT_MONTH ? "Final Walk-ins" : "Forecasted Walk-ins", curr: current.walkins, fc: forecast.walkins, color: CYAN },
              { label: TODAY_DATE >= DAYS_IN_CURRENT_MONTH ? "Final Admissions" : "Forecasted Admissions", curr: current.admissions, fc: forecast.admissions, color: GREEN },
              { label: TODAY_DATE >= DAYS_IN_CURRENT_MONTH ? "Final Spend" : "Forecasted Spend", curr: current.spend, fc: forecast.spend, color: RED, isMoney: true },
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

        </> /* end OVERVIEW */}

        {/* ══ WHAT-IF ═══════════════════════════════════════════════════════════ */}
        {activeTab === "whatif" && <>

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

        </> /* end WHAT-IF */}

        {/* ══ CRM ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "crm" && <>

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
              <div className="text-3xl font-black text-[#091a4f] mt-1">{((ytdBookingsFull / Math.max(ytdLeadsFull, 1)) * 100).toFixed(1)}</div>
              <div className="text-[11px] text-gray-500 mt-1">Lead engagement rate</div>
            </div>
          </div>

          {/* Drop-off bars */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-gray-600 mb-1">Funnel Drop-off Analysis</div>
            {[
              { label: "Leads → Bookings", from: ytdLeadsFull, to: ytdBookingsFull, color: PURPLE },
              { label: "Bookings → Walk-ins", from: ytdBookingsFull, to: ytdWalkinsFull, color: CYAN },
              { label: "Walk-ins → Admissions", from: ytdWalkinsFull, to: ytdAdmissionsFull, color: GREEN },
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

        {/* ───────── 7. June Branch Comparison + Channel ───────── */}
        {segment === "combined" && (
          <section className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              {(() => {
                const rpsMonths = liveData?.rpsCrm.byMonth.map(m => m.month) ?? [];
                const risMonths = liveData?.risCrm.byMonth.map(m => m.month) ?? [];
                const MONTH_ORDER_UI = ["Apr-25","May-25","Jun-25","Jul-25","Aug-25","Sep-25","Oct-25","Nov-25","Dec-25","Jan-26","Feb-26","Mar-26","Apr-26","May-26","Jun-26"];
                const allMonths = Array.from(new Set([...rpsMonths, ...risMonths])).sort((a,b) => {
                  const ai = MONTH_ORDER_UI.indexOf(a), bi = MONTH_ORDER_UI.indexOf(b);
                  return (ai<0?99:ai)-(bi<0?99:bi);
                });
                const allTabs = [...allMonths, "YTD"];
                const selTab = branchCompareMonth || allMonths[allMonths.length - 1] || "YTD";
                const isYtd = selTab === "YTD";

                const getRisTotals = (tab: string): LiveCrmEntry => {
                  if (!liveData) return { leads: MAY_RIS_BASE.leads, bookings: MAY_RIS_BASE.bookings, walkins: MAY_RIS_BASE.walkins, admissions: MAY_RIS_BASE.admissions, closed: 0 };
                  if (tab === "YTD") return liveData.risCrm.byMonth.reduce((a,m) => ({ leads:a.leads+m.total.leads, bookings:a.bookings+m.total.bookings, walkins:a.walkins+m.total.walkins, admissions:a.admissions+m.total.admissions, closed:a.closed+m.total.closed }), { leads:0,bookings:0,walkins:0,admissions:0,closed:0 });
                  return liveData.risCrm.byMonth.find(m => m.month === tab)?.total ?? { leads:0,bookings:0,walkins:0,admissions:0,closed:0 };
                };
                const getRpsTotals = (tab: string): LiveCrmEntry => {
                  if (!liveData) return { leads: MAY_RPS_BASE.leads, bookings: MAY_RPS_BASE.bookings, walkins: MAY_RPS_BASE.walkins, admissions: MAY_RPS_BASE.admissions, closed: 0 };
                  if (tab === "YTD") return liveData.rpsCrm.byMonth.reduce((a,m) => ({ leads:a.leads+m.total.leads, bookings:a.bookings+m.total.bookings, walkins:a.walkins+m.total.walkins, admissions:a.admissions+m.total.admissions, closed:a.closed+m.total.closed }), { leads:0,bookings:0,walkins:0,admissions:0,closed:0 });
                  return liveData.rpsCrm.byMonth.find(m => m.month === tab)?.total ?? { leads:0,bookings:0,walkins:0,admissions:0,closed:0 };
                };

                const ris = getRisTotals(selTab);
                const rps = getRpsTotals(selTab);
                const maxLeads = Math.max(ris.leads, rps.leads, 1);
                const inProgress = !isYtd && selTab === (allMonths[allMonths.length - 1] ?? "");

                return (
                  <>
                    <SectionTitle
                      title={`${selTab} — Branch Comparison`}
                      sub={`RIS vs RPS performance side-by-side${inProgress ? ` (in progress, ${liveData?.currentDayOfMonth ?? "?"} days)` : ""}`}
                    />
                    {liveData && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {allTabs.map(tab => (
                          <button key={tab} onClick={() => setBranchCompareMonth(tab)}
                            data-testid={`button-branch-compare-${tab}`}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${selTab===tab ? "bg-[#091a4f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {tab}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="space-y-3">
                      {[
                        { label: "Total Leads", risV: ris.leads, rpsV: rps.leads },
                        { label: "Bookings", risV: ris.bookings, rpsV: rps.bookings },
                        { label: "Walk-ins", risV: ris.walkins, rpsV: rps.walkins },
                        { label: "Admissions", risV: ris.admissions, rpsV: rps.admissions },
                      ].map(row => (
                        <div key={row.label}>
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span className="font-medium">{row.label}</span>
                            <span className="flex gap-4">
                              <span className="font-bold" style={{ color: NAVY }}>RIS: {row.risV}</span>
                              <span className="font-bold" style={{ color: CYAN }}>RPS: {row.rpsV}</span>
                            </span>
                          </div>
                          <div className="flex gap-1 h-5">
                            <div className="rounded-l-full" style={{ width: `${(row.risV / maxLeads) * 48}%`, background: NAVY, minWidth: row.risV > 0 ? 4 : 0 }} />
                            <div className="rounded-r-full" style={{ width: `${(row.rpsV / maxLeads) * 48}%`, background: CYAN, minWidth: row.rpsV > 0 ? 4 : 0 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="rounded-xl bg-[#091a4f]/5 p-3 text-center">
                        <div className="text-xs text-gray-500 font-medium mb-1">RIS Conversion</div>
                        <div className="text-2xl font-black" style={{ color: NAVY }}>{pct((ris.admissions / Math.max(ris.leads, 1)) * 100)}</div>
                        <div className="text-[11px] text-gray-400">{ris.admissions} / {ris.leads}</div>
                      </div>
                      <div className="rounded-xl bg-cyan-50 p-3 text-center">
                        <div className="text-xs text-gray-500 font-medium mb-1">RPS Conversion</div>
                        <div className="text-2xl font-black" style={{ color: CYAN }}>{pct((rps.admissions / Math.max(rps.leads, 1)) * 100)}</div>
                        <div className="text-[11px] text-gray-400">{rps.admissions} / {rps.leads}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <SectionTitle title="June 2026 — Channel Spend" sub="Meta vs Google ad investment (partial month)" />
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

        {/* ───────── 7b. Live CRM — RPS Centre-wise ───────── */}
        {(segment === "combined" || segment === "rps") && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle
              title="Live CRM Report — RPS Centre Performance"
              sub={liveData
                ? `Live from Google Sheets · synced ${new Date(liveData.generatedAt).toLocaleString("en-IN", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}`
                : "Loading live data from Google Sheets…"}
              badge="LIVE"
            />
            {liveLoading && !liveData && (
              <div className="text-xs text-gray-400 py-6 text-center">Syncing with Google Sheets…</div>
            )}
            {liveError && !liveData && (
              <div className="text-xs text-red-500 py-4">Could not load live data — {liveError}</div>
            )}
            {liveData && (() => {
              const rpsMonths = liveData.rpsCrm.byMonth.map(m => m.month);
              const allTabs = [...rpsMonths, "YTD"];
              const selTab = rpsCrmMonth || rpsMonths[rpsMonths.length - 1] || "YTD";
              const isYtd = selTab === "YTD";

              let displayBranches: LiveBranch[];
              if (isYtd) {
                const agg: Record<string, LiveCrmEntry> = {};
                liveData.rpsCrm.byMonth.forEach(m => m.branches.forEach(b => {
                  if (!agg[b.centre]) agg[b.centre] = { leads:0, bookings:0, walkins:0, admissions:0, closed:0 };
                  agg[b.centre].leads += b.leads; agg[b.centre].bookings += b.bookings;
                  agg[b.centre].walkins += b.walkins; agg[b.centre].admissions += b.admissions; agg[b.centre].closed += b.closed;
                }));
                displayBranches = Object.entries(agg).map(([centre, d]) => ({ centre, ...d })).sort((a,b) => b.leads - a.leads);
              } else {
                displayBranches = liveData.rpsCrm.byMonth.find(m => m.month === selTab)?.branches ?? [];
              }

              const grandTotal = displayBranches.reduce((a,b) => ({ leads:a.leads+b.leads, bookings:a.bookings+b.bookings, walkins:a.walkins+b.walkins, admissions:a.admissions+b.admissions, closed:a.closed+b.closed }), { leads:0,bookings:0,walkins:0,admissions:0,closed:0 });
              const maxLeads = Math.max(...displayBranches.map(b => b.leads), 1);
              const maxAdm   = Math.max(...displayBranches.map(b => b.admissions), 1);
              const top = [...displayBranches].filter(b => b.admissions > 0).sort((a,b) => (b.admissions/Math.max(b.leads,1)) - (a.admissions/Math.max(a.leads,1)))[0];
              const totalClosed = liveData.rpsCrm.closedReasons.reduce((a,x) => a+x.count, 0);

              return (
                <>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {allTabs.map(tab => (
                      <button key={tab} onClick={() => setRpsCrmMonth(tab)}
                        data-testid={`button-rps-month-${tab}`}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${selTab===tab ? "bg-[#091a4f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" data-testid="table-crm-branches">
                      <thead>
                        <tr className="text-left text-gray-500 border-b-2 border-gray-100">
                          <th className="py-2 pr-3 font-bold">Centre</th>
                          <th className="py-2 px-2 font-bold text-right">Leads</th>
                          <th className="py-2 px-2 font-bold text-right">Bookings</th>
                          <th className="py-2 px-2 font-bold text-right">Walk-ins</th>
                          <th className="py-2 px-2 font-bold text-right">Admissions</th>
                          <th className="py-2 px-2 font-bold text-right">Closed</th>
                          <th className="py-2 px-2 font-bold text-right">L→Adm%</th>
                          <th className="py-2 pl-2 font-bold text-right">W→Adm%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayBranches.map((b, i) => {
                          const la = b.leads ? (b.admissions/b.leads)*100 : 0;
                          const wa = b.walkins ? (b.admissions/b.walkins)*100 : 0;
                          const isTop = top?.centre === b.centre;
                          return (
                            <tr key={b.centre} className={`border-b ${isTop ? "bg-amber-50" : i%2===0 ? "bg-gray-50/40" : ""}`}
                              data-testid={`row-crm-${b.centre.toLowerCase().replace(/\s+/g,"-")}`}>
                              <td className="py-2 pr-3 font-bold" style={{ color: NAVY }}>
                                {b.centre}
                                {isTop && <span className="ml-2 text-[9px] font-bold uppercase bg-amber-400 text-[#091a4f] px-1.5 py-0.5 rounded">Top</span>}
                              </td>
                              <td className="py-2 px-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-10 h-1.5 bg-gray-100 rounded"><div className="h-full rounded" style={{ width:`${(b.leads/maxLeads)*100}%`, background:NAVY }} /></div>
                                  <span className="font-semibold">{b.leads}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right">{b.bookings}</td>
                              <td className="py-2 px-2 text-right">{b.walkins}</td>
                              <td className="py-2 px-2 text-right font-bold" style={{ color: GREEN }}>
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-10 h-1.5 bg-gray-100 rounded"><div className="h-full rounded" style={{ width:`${(b.admissions/maxAdm)*100}%`, background:GREEN }} /></div>
                                  {b.admissions}
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right text-red-500">{b.closed}</td>
                              <td className="py-2 px-2 text-right font-bold" style={{ color: la>=5?GREEN:la>=2?AMBER:RED }}>{pct(la)}</td>
                              <td className="py-2 pl-2 text-right text-gray-600">{pct(wa)}</td>
                            </tr>
                          );
                        })}
                        <tr className="font-black border-t-2 border-gray-200 bg-gray-50/60">
                          <td className="py-2 pr-3" style={{ color: NAVY }}>Total {isYtd ? "(YTD)" : selTab}</td>
                          <td className="py-2 px-2 text-right">{grandTotal.leads}</td>
                          <td className="py-2 px-2 text-right">{grandTotal.bookings}</td>
                          <td className="py-2 px-2 text-right">{grandTotal.walkins}</td>
                          <td className="py-2 px-2 text-right font-bold" style={{ color: GREEN }}>{grandTotal.admissions}</td>
                          <td className="py-2 px-2 text-right text-red-500">{grandTotal.closed}</td>
                          <td className="py-2 px-2 text-right">{pct(grandTotal.leads?(grandTotal.admissions/grandTotal.leads)*100:0)}</td>
                          <td className="py-2 pl-2 text-right">{pct(grandTotal.walkins?(grandTotal.admissions/grandTotal.walkins)*100:0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {top && (
                    <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs">
                      <span className="font-black text-amber-900">★ Top centre: </span>
                      <span className="text-amber-900"><strong>{top.centre}</strong> — {top.admissions} admissions on {top.leads} leads ({pct((top.admissions/Math.max(top.leads,1))*100)} lead→adm rate).</span>
                    </div>
                  )}

                  {/* Month-wise closed leads by centre */}
                  {(() => {
                    const months = liveData.rpsCrm.byMonth.map(m => m.month);
                    // Collect all unique centres across all months
                    const centreSet = new Set<string>();
                    liveData.rpsCrm.byMonth.forEach(m => m.branches.forEach(b => centreSet.add(b.centre)));
                    const centres = Array.from(centreSet).sort();
                    if (!months.length || !centres.length) return null;
                    // Build matrix: centre → month → closed
                    const matrix: Record<string, Record<string, number>> = {};
                    centres.forEach(c => { matrix[c] = {}; });
                    liveData.rpsCrm.byMonth.forEach(m => {
                      m.branches.forEach(b => { matrix[b.centre][m.month] = b.closed; });
                    });
                    const rowTotals = (c: string) => months.reduce((s, mo) => s + (matrix[c][mo] || 0), 0);
                    const colTotals = (mo: string) => centres.reduce((s, c) => s + (matrix[c][mo] || 0), 0);
                    const grandClosedTotal = centres.reduce((s, c) => s + rowTotals(c), 0);
                    return (
                      <div className="mt-5">
                        <div className="text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">Closed Leads by Centre — Monthly</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-500 border-b">
                                <th className="py-1.5 pr-3 font-bold">Centre</th>
                                {months.map(mo => <th key={mo} className="py-1.5 px-2 font-bold text-right whitespace-nowrap">{mo}</th>)}
                                <th className="py-1.5 pl-2 font-bold text-right text-red-600">YTD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {centres.map((c, i) => {
                                const tot = rowTotals(c);
                                return (
                                  <tr key={c} className={`border-b ${i%2===0?"bg-gray-50/30":""}`}>
                                    <td className="py-1.5 pr-3 font-semibold" style={{ color: NAVY }}>{c}</td>
                                    {months.map(mo => {
                                      const v = matrix[c][mo] || 0;
                                      return <td key={mo} className={`py-1.5 px-2 text-right ${v>0?"text-red-600 font-semibold":"text-gray-300"}`}>{v || "—"}</td>;
                                    })}
                                    <td className="py-1.5 pl-2 text-right font-black text-red-600">{tot}</td>
                                  </tr>
                                );
                              })}
                              <tr className="font-black border-t-2 border-gray-200 bg-red-50/40">
                                <td className="py-1.5 pr-3 text-red-700">Total</td>
                                {months.map(mo => <td key={mo} className="py-1.5 px-2 text-right text-red-700">{colTotals(mo)||"—"}</td>)}
                                <td className="py-1.5 pl-2 text-right text-red-700">{grandClosedTotal}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const reasons = isYtd
                      ? liveData.rpsCrm.closedReasons
                      : (liveData.rpsCrm.byMonth.find(m => m.month === selTab)?.closedReasons ?? []);
                    const reasonsTotal = reasons.reduce((a,x) => a+x.count, 0);
                    if (!reasons.length) return null;
                    return (
                      <div className="mt-5">
                        <div className="text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">
                          Closed Lead Reasons — RPS ({isYtd ? "YTD" : selTab}, {reasonsTotal} closed)
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead><tr className="text-left text-gray-500 border-b">
                              <th className="py-1.5 pr-2 font-bold w-6">#</th>
                              <th className="py-1.5 pr-3 font-bold">Reason</th>
                              <th className="py-1.5 px-2 font-bold text-right">Count</th>
                              <th className="py-1.5 pl-2 font-bold text-right">% closed</th>
                            </tr></thead>
                            <tbody>
                              {reasons.map((r, i) => (
                                <tr key={r.reason} className={`border-b ${i%2===0?"bg-gray-50/40":""}`}>
                                  <td className="py-1.5 pr-2 text-gray-400">{i+1}</td>
                                  <td className="py-1.5 pr-3 text-gray-700">{r.reason}</td>
                                  <td className="py-1.5 px-2 text-right font-bold">{r.count}</td>
                                  <td className="py-1.5 pl-2 text-right text-gray-500">{pct((r.count/Math.max(reasonsTotal,1))*100)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </section>
        )}

        {/* ───────── 7c. Live CRM — RIS Education Level ───────── */}
        {(segment === "combined" || segment === "ris") && (
          <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle
              title="Live CRM Report — RIS (by Education Level)"
              sub={liveData
                ? `Live from Google Sheets · synced ${new Date(liveData.generatedAt).toLocaleString("en-IN", {day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}`
                : "Loading live data from Google Sheets…"}
              badge="LIVE"
            />
            {liveLoading && !liveData && (
              <div className="text-xs text-gray-400 py-6 text-center">Syncing with Google Sheets…</div>
            )}
            {liveData && (() => {
              const risMonths = liveData.risCrm.byMonth.map(m => m.month);
              const allTabs = [...risMonths, "YTD"];
              const selTab = risCrmMonth || risMonths[risMonths.length - 1] || "YTD";
              const isYtd = selTab === "YTD";
              const GROUP_ORDER_UI = ["Pre-Primary","Primary","Middle","Secondary","Senior Secondary"];
              const GROUP_COLORS: Record<string,string> = {
                "Pre-Primary": "#7c3aed", "Primary": "#2563eb", "Middle": "#0891b2",
                "Secondary": "#059669", "Senior Secondary": "#d97706",
              };

              let displayGroups: LiveGroup[];
              if (isYtd) {
                const agg: Record<string, LiveCrmEntry> = {};
                liveData.risCrm.byMonth.forEach(m => m.groups.forEach(g => {
                  if (!agg[g.group]) agg[g.group] = { leads:0,bookings:0,walkins:0,admissions:0,closed:0 };
                  agg[g.group].leads += g.leads; agg[g.group].bookings += g.bookings;
                  agg[g.group].walkins += g.walkins; agg[g.group].admissions += g.admissions; agg[g.group].closed += g.closed;
                }));
                displayGroups = GROUP_ORDER_UI.filter(g => agg[g]).map(g => ({ group:g, ...agg[g] }));
              } else {
                displayGroups = liveData.risCrm.byMonth.find(m => m.month === selTab)?.groups ?? [];
              }

              const grandTotal = displayGroups.reduce((a,g) => ({ leads:a.leads+g.leads, bookings:a.bookings+g.bookings, walkins:a.walkins+g.walkins, admissions:a.admissions+g.admissions, closed:a.closed+g.closed }), { leads:0,bookings:0,walkins:0,admissions:0,closed:0 });
              const maxLeads = Math.max(...displayGroups.map(g => g.leads), 1);
              const totalClosed = liveData.risCrm.closedReasons.reduce((a,x) => a+x.count, 0);

              return (
                <>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {allTabs.map(tab => (
                      <button key={tab} onClick={() => setRisCrmMonth(tab)}
                        data-testid={`button-ris-month-${tab}`}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors ${selTab===tab ? "bg-[#091a4f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs" data-testid="table-ris-crm-live">
                      <thead>
                        <tr className="text-left text-gray-500 border-b-2 border-gray-100">
                          <th className="py-2 pr-3 font-bold">Level</th>
                          <th className="py-2 px-2 font-bold text-right">Leads</th>
                          <th className="py-2 px-2 font-bold text-right">Bookings</th>
                          <th className="py-2 px-2 font-bold text-right">Walk-ins</th>
                          <th className="py-2 px-2 font-bold text-right">Admissions</th>
                          <th className="py-2 px-2 font-bold text-right">Closed</th>
                          <th className="py-2 px-2 font-bold text-right">L→Adm%</th>
                          <th className="py-2 pl-2 font-bold text-right">W→Adm%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayGroups.map((g, i) => {
                          const la = g.leads ? (g.admissions/g.leads)*100 : 0;
                          const wa = g.walkins ? (g.admissions/g.walkins)*100 : 0;
                          const color = GROUP_COLORS[g.group] || NAVY;
                          return (
                            <tr key={g.group} className={`border-b ${i%2===0?"bg-gray-50/40":""}`}
                              data-testid={`row-ris-crm-${g.group.toLowerCase().replace(/\s+/g,"-")}`}>
                              <td className="py-2 pr-3 font-bold" style={{ color }}>{g.group}</td>
                              <td className="py-2 px-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-10 h-1.5 bg-gray-100 rounded"><div className="h-full rounded" style={{ width:`${(g.leads/maxLeads)*100}%`, background:color }} /></div>
                                  <span className="font-semibold">{g.leads}</span>
                                </div>
                              </td>
                              <td className="py-2 px-2 text-right">{g.bookings}</td>
                              <td className="py-2 px-2 text-right">{g.walkins}</td>
                              <td className="py-2 px-2 text-right font-bold text-green-700">{g.admissions}</td>
                              <td className="py-2 px-2 text-right text-red-500">{g.closed}</td>
                              <td className="py-2 px-2 text-right font-bold" style={{ color: la>=5?GREEN:la>=2?AMBER:RED }}>{pct(la)}</td>
                              <td className="py-2 pl-2 text-right text-gray-600">{pct(wa)}</td>
                            </tr>
                          );
                        })}
                        <tr className="font-black border-t-2 border-gray-200 bg-gray-50/60">
                          <td className="py-2 pr-3" style={{ color: NAVY }}>Total {isYtd ? "(YTD)" : selTab}</td>
                          <td className="py-2 px-2 text-right">{grandTotal.leads}</td>
                          <td className="py-2 px-2 text-right">{grandTotal.bookings}</td>
                          <td className="py-2 px-2 text-right">{grandTotal.walkins}</td>
                          <td className="py-2 px-2 text-right font-bold text-green-700">{grandTotal.admissions}</td>
                          <td className="py-2 px-2 text-right text-red-500">{grandTotal.closed}</td>
                          <td className="py-2 px-2 text-right">{pct(grandTotal.leads?(grandTotal.admissions/grandTotal.leads)*100:0)}</td>
                          <td className="py-2 pl-2 text-right">{pct(grandTotal.walkins?(grandTotal.admissions/grandTotal.walkins)*100:0)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Month-wise closed leads by education level */}
                  {(() => {
                    const months = liveData.risCrm.byMonth.map(m => m.month);
                    const GROUP_ORDER_UI2 = ["Pre-Primary","Primary","Middle","Secondary","Senior Secondary"];
                    const allGroups = GROUP_ORDER_UI2.filter(g =>
                      liveData.risCrm.byMonth.some(m => m.groups.some(gr => gr.group === g))
                    );
                    if (!months.length || !allGroups.length) return null;
                    const matrix: Record<string, Record<string, number>> = {};
                    allGroups.forEach(g => { matrix[g] = {}; });
                    liveData.risCrm.byMonth.forEach(m => {
                      m.groups.forEach(gr => { matrix[gr.group][m.month] = gr.closed; });
                    });
                    const rowTotals = (g: string) => months.reduce((s, mo) => s + (matrix[g][mo] || 0), 0);
                    const colTotals = (mo: string) => allGroups.reduce((s, g) => s + (matrix[g][mo] || 0), 0);
                    const grandClosedTotal = allGroups.reduce((s, g) => s + rowTotals(g), 0);
                    const GROUP_COLORS2: Record<string,string> = {
                      "Pre-Primary":"#7c3aed","Primary":"#2563eb","Middle":"#0891b2",
                      "Secondary":"#059669","Senior Secondary":"#d97706",
                    };
                    return (
                      <div className="mt-5">
                        <div className="text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">Closed Leads by Education Level — Monthly</div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-500 border-b">
                                <th className="py-1.5 pr-3 font-bold">Level</th>
                                {months.map(mo => <th key={mo} className="py-1.5 px-2 font-bold text-right whitespace-nowrap">{mo}</th>)}
                                <th className="py-1.5 pl-2 font-bold text-right text-red-600">YTD</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allGroups.map((g, i) => {
                                const tot = rowTotals(g);
                                return (
                                  <tr key={g} className={`border-b ${i%2===0?"bg-gray-50/30":""}`}>
                                    <td className="py-1.5 pr-3 font-semibold" style={{ color: GROUP_COLORS2[g] || NAVY }}>{g}</td>
                                    {months.map(mo => {
                                      const v = matrix[g][mo] || 0;
                                      return <td key={mo} className={`py-1.5 px-2 text-right ${v>0?"text-red-600 font-semibold":"text-gray-300"}`}>{v || "—"}</td>;
                                    })}
                                    <td className="py-1.5 pl-2 text-right font-black text-red-600">{tot}</td>
                                  </tr>
                                );
                              })}
                              <tr className="font-black border-t-2 border-gray-200 bg-red-50/40">
                                <td className="py-1.5 pr-3 text-red-700">Total</td>
                                {months.map(mo => <td key={mo} className="py-1.5 px-2 text-right text-red-700">{colTotals(mo)||"—"}</td>)}
                                <td className="py-1.5 pl-2 text-right text-red-700">{grandClosedTotal}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const reasons = isYtd
                      ? liveData.risCrm.closedReasons
                      : (liveData.risCrm.byMonth.find(m => m.month === selTab)?.closedReasons ?? []);
                    const reasonsTotal = reasons.reduce((a,x) => a+x.count, 0);
                    if (!reasons.length) return null;
                    return (
                      <div className="mt-5">
                        <div className="text-xs font-black text-gray-500 mb-2 uppercase tracking-wider">
                          Closed Lead Reasons — RIS ({isYtd ? "YTD" : selTab}, {reasonsTotal} closed)
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead><tr className="text-left text-gray-500 border-b">
                              <th className="py-1.5 pr-2 font-bold w-6">#</th>
                              <th className="py-1.5 pr-3 font-bold">Reason</th>
                              <th className="py-1.5 px-2 font-bold text-right">Count</th>
                              <th className="py-1.5 pl-2 font-bold text-right">% closed</th>
                            </tr></thead>
                            <tbody>
                              {reasons.map((r, i) => (
                                <tr key={r.reason} className={`border-b ${i%2===0?"bg-gray-50/40":""}`}>
                                  <td className="py-1.5 pr-2 text-gray-400">{i+1}</td>
                                  <td className="py-1.5 pr-3 text-gray-700">{r.reason}</td>
                                  <td className="py-1.5 px-2 text-right font-bold">{r.count}</td>
                                  <td className="py-1.5 pl-2 text-right text-gray-500">{pct((r.count/Math.max(reasonsTotal,1))*100)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </section>
        )}

        </> /* end CRM */}

        {/* ══ TRENDS ════════════════════════════════════════════════════════════ */}
        {activeTab === "trends" && <>

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
              <div className="font-bold text-green-700 mb-1">This Year Pace ({segment === "combined" ? "RIS + RPS" : segment.toUpperCase()}, Dec 25 – Jun 26)</div>
              <div className="text-gray-700">Spend: <strong>{inr(totals.spend)}</strong> · Leads: <strong>{num(totals.leads)}</strong> · Admissions: <strong>{totals.admissions}</strong></div>
            </div>
          </div>
        </section>

        {/* ───────── 10. Weekly Breakdown ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <SectionTitle
              title={`${weeklyMonth} — Weekly Breakdown`}
              sub={`Week-by-week leads, walk-ins, bookings, admissions (through ${LAST_UPDATED})`}
            />
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              {(["combined", "ris", "rps"] as const).map(t => (
                <button key={t} onClick={() => setWeeklyTab(t)}
                  className={`px-4 py-2 font-bold uppercase ${weeklyTab === t ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={weeklyTab === t ? { background: t === "rps" ? CYAN : NAVY } : {}}>{t}</button>
              ))}
            </div>
          </div>
          {/* Month filter */}
          <div className="flex gap-2 mb-4">
            {(["May 26", "Jun 26"] as const).map(m => (
              <button key={m} onClick={() => setWeeklyMonth(m)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${weeklyMonth === m ? "text-white border-transparent" : "text-gray-500 border-gray-200 hover:border-gray-400"}`}
                style={weeklyMonth === m ? { background: NAVY } : {}}>
                {m === "May 26" ? "May 2026" : "June 2026"}
              </button>
            ))}
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
                {weeklyTableRows.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No weekly data available</td></tr>
                ) : weeklyTableRows.map((w, i) => {
                  const conv = w.leads > 0 ? ((w.admissions / w.leads) * 100).toFixed(1) : "—";
                  return (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-3 px-3 font-semibold text-gray-700">{w.week}</td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: NAVY }}>{w.leads}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600">{w.bookings}</td>
                      <td className="py-3 px-3 text-center font-bold text-cyan-700">{w.walkins}</td>
                      <td className="py-3 px-3 text-center font-bold text-green-700">{w.admissions}</td>
                      <td className="py-3 px-3 text-center"><span className={`px-2 py-0.5 rounded-md text-xs font-bold ${parseFloat(conv) > 5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{conv === "—" ? "—%" : `${conv}%`}</span></td>
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
              { platform: "Website (GSC)", val: num(social.websiteClicks), label: "Clicks (27 Apr – 3 May)", color: GREEN },
            ].map(s => (
              <div key={s.platform} className="rounded-xl border border-gray-100 p-4">
                <div className="font-bold text-sm text-gray-800">{s.platform}</div>
                <div className="text-[11px] text-gray-400 mb-3">{s.label}</div>
                <div className="text-3xl font-black" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </section>

        </> /* end TRENDS */}

        {/* ══ SUMMARY ═══════════════════════════════════════════════════════════ */}
        {activeTab === "summary" && <>

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
            title={`YoY Month-by-Month Comparison — Oct to May (${segmentLabel})`}
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
              { label: "May", ly: lyPick(7), ty: segmentRows[MAY_IDX] },
              { label: "Jun", ly: lyPick(8), ty: segmentRows[CURRENT_IDX] },
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

        </> /* end SUMMARY */}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6 pt-2 border-t border-gray-200">
          <div>This dashboard is strictly confidential — for internal management use only.</div>
          <div className="mt-1">
            Monthly performance data sourced live from the DM Overall master Google Sheet · CRM data sourced live from RPS CRM &amp; RIS CRM Google Sheets · auto-refreshes every 5 minutes.
          </div>
          <div className="mt-1">
            Last updated: {liveData ? new Date(liveData.generatedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : LAST_UPDATED} · June 2026 reflects partial month ({TODAY_DATE} of {DAYS_IN_CURRENT_MONTH} days). Prior-month RIS/RPS splits use source-sheet derived ratios. True CPA uses editable salary defaults.
          </div>
        </div>
      </div>
    </div>
  );
}
