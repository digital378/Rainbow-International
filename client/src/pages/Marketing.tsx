import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from "recharts";

const LAST_UPDATED = "April 16, 2026";
const TODAY_DATE = 16;
const DAYS_IN_APRIL = 30;

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const pct = (n: number) => `${n.toFixed(1)}%`;

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#059669";
const RED = "#dc2626";
const BLUE = "#2563eb";
const CYAN = "#0891b2";
const PURPLE = "#7c3aed";
const SLATE = "#475569";

/* ─────────────── DATA: CURRENT YEAR (AY 2025-26) ─────────────── */

const MONTHLY_COMBINED = [
  { month: "Dec 25", leads: 455, admissions: 23, spend: 178604, meta: 100231, google: 78373, cpl: 393, cpa: 7765, cpw: 2516, roi: 1059, walkins: 71, bookings: 93 },
  { month: "Jan 26", leads: 895, admissions: 27, spend: 459906, meta: 248585, google: 211321, cpl: 514, cpa: 17034, cpw: 3679, roi: 428, walkins: 125, bookings: 171 },
  { month: "Feb 26", leads: 418, admissions: 24, spend: 179377, meta: 58885, google: 120492, cpl: 429, cpa: 7474, cpw: 1908, roi: 1104, walkins: 94, bookings: 115 },
  { month: "Mar 26", leads: 498, admissions: 47, spend: 194500, meta: 61121, google: 133379, cpl: 391, cpa: 4138, cpw: 1607, roi: 2075, walkins: 121, bookings: 196 },
  { month: "Apr 26*", leads: 213, admissions: 18, spend: 101168, meta: 30624, google: 70544, cpl: 475, cpa: 5620, cpw: 1744, roi: 1501, walkins: 58, bookings: 85 },
];

const TOTAL = {
  leads: 2451, admissions: 160, spend: 1113555, meta: 630269, google: 886599,
  cpl: 454, cpa: 6960, cpw: 2025, roi: 1193, walkins: 550, bookings: 658,
};

const APRIL_WEEKLY = [
  { week: "01–04 Apr", risLeads: 18, risAdm: 3, risWalk: 6, risBook: 7, rpsLeads: 36, rpsAdm: 3, rpsWalk: 12, rpsBook: 18 },
  { week: "05–11 Apr", risLeads: 37, risAdm: 3, risWalk: 11, risBook: 15, rpsLeads: 60, rpsAdm: 4, rpsWalk: 15, rpsBook: 32 },
  { week: "12–18 Apr", risLeads: 35, risAdm: 2, risWalk: 8, risBook: 10, rpsLeads: 27, rpsAdm: 3, rpsWalk: 6, rpsBook: 3 },
];

const APRIL_RIS = { leads: 90, closed: 32, bookings: 32, walkins: 25, admissions: 8, spend: 38845 };
const APRIL_RPS = { leads: 123, closed: 35, bookings: 53, walkins: 33, admissions: 10, spend: 62323 };

const SOCIAL_RIS = { instaFollowers: 9842, fbFollowers: 9862, ytViews: 145009, ytClicks: 3780, impressions: 481881, websiteClicks: 454 };
const SOCIAL_RPS = { instaFollowers: 12947, fbFollowers: 12964, ytViews: 138364, ytClicks: 1066, impressions: 307620, websiteClicks: 159 };

const PLATFORM_DATA = [
  { month: "Dec 25", metaLeads: 201, googleLeads: 60, metaSpend: 100231, googleSpend: 78373 },
  { month: "Jan 26", metaLeads: 340, googleLeads: 159, metaSpend: 248585, googleSpend: 211321 },
  { month: "Feb 26", metaLeads: 285, googleLeads: 133, metaSpend: 58885, googleSpend: 120492 },
  { month: "Mar 26", metaLeads: 327, googleLeads: 171, metaSpend: 61121, googleSpend: 133379 },
  { month: "Apr 26*", metaLeads: 145, googleLeads: 68, metaSpend: 30624, googleSpend: 70544 },
];

/* ─────────────── DATA: LAST YEAR (AY 2024-25) ─────────────── */

const LAST_YEAR_RIS = [
  { month: "Oct 24", spend: 13556, leads: 116, walkins: 40, admissions: 7 },
  { month: "Nov 24", spend: 15202, leads: 137, walkins: 49, admissions: 18 },
  { month: "Dec 24", spend: 19189, leads: 159, walkins: 54, admissions: 22 },
  { month: "Jan 25", spend: 56111, leads: 193, walkins: 73, admissions: 26 },
  { month: "Feb 25", spend: 15732, leads: 66, walkins: 40, admissions: 11 },
  { month: "Mar 25", spend: 200000, leads: 125, walkins: 36, admissions: 8 },
  { month: "Apr 25", spend: 150000, leads: 132, walkins: 35, admissions: 6 },
  { month: "May 25", spend: 56000, leads: 125, walkins: 53, admissions: 21 },
  { month: "Jun 25", spend: 5846, leads: 89, walkins: 31, admissions: 11 },
];
const LAST_YEAR_RIS_TOTAL = { spend: 531636, leads: 1142, walkins: 411, admissions: 130 };

const LAST_YEAR_RPS = [
  { month: "Oct 24", spend: 57147, leads: 78, walkins: 24, admissions: 12 },
  { month: "Nov 24", spend: 61853, leads: 96, walkins: 36, admissions: 13 },
  { month: "Dec 24", spend: 88738, leads: 158, walkins: 59, admissions: 20 },
  { month: "Jan 25", spend: 89510, leads: 160, walkins: 68, admissions: 25 },
  { month: "Feb 25", spend: 130200, leads: 62, walkins: 29, admissions: 12 },
  { month: "Mar 25", spend: 200000, leads: 122, walkins: 66, admissions: 14 },
  { month: "Apr 25", spend: 200000, leads: 147, walkins: 21, admissions: 14 },
  { month: "May 25", spend: 89050, leads: 83, walkins: 31, admissions: 16 },
  { month: "Jun 25", spend: 88595, leads: 114, walkins: 32, admissions: 14 },
];
const LAST_YEAR_RPS_TOTAL = { spend: 1005093, leads: 1020, walkins: 366, admissions: 140 };

const LAST_YEAR_TOTAL = {
  spend: LAST_YEAR_RIS_TOTAL.spend + LAST_YEAR_RPS_TOTAL.spend,
  leads: LAST_YEAR_RIS_TOTAL.leads + LAST_YEAR_RPS_TOTAL.leads,
  walkins: LAST_YEAR_RIS_TOTAL.walkins + LAST_YEAR_RPS_TOTAL.walkins,
  admissions: LAST_YEAR_RIS_TOTAL.admissions + LAST_YEAR_RPS_TOTAL.admissions,
};

const LAST_YEAR_COMBINED = LAST_YEAR_RIS.map((r, i) => ({
  month: r.month,
  spend: r.spend + LAST_YEAR_RPS[i].spend,
  leads: r.leads + LAST_YEAR_RPS[i].leads,
  walkins: r.walkins + LAST_YEAR_RPS[i].walkins,
  admissions: r.admissions + LAST_YEAR_RPS[i].admissions,
}));

/* ─────────────── HELPERS ─────────────── */

const TICK = { fontSize: 11, fill: "#6b7280" };

function deltaArrow(curr: number, prev: number): { sign: string; pctVal: string; positive: boolean } {
  if (prev === 0) return { sign: "▲", pctVal: "—", positive: true };
  const d = ((curr - prev) / prev) * 100;
  return { sign: d >= 0 ? "▲" : "▼", pctVal: `${Math.abs(d).toFixed(1)}%`, positive: d >= 0 };
}

/* ─────────────── COMPONENTS ─────────────── */

function KpiCard({ label, value, sub, color = NAVY, accent }: { label: string; value: string; sub?: string; color?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-1">
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</div>
      <div className="text-xl font-black mt-0.5" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] text-gray-500">{sub}</div>}
      {accent && <div className="text-[11px] font-semibold mt-0.5" style={{ color: accent }}>{accent}</div>}
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

function DeltaPill({ curr, prev, prefix = "" }: { curr: number; prev: number; prefix?: string }) {
  const d = deltaArrow(curr, prev);
  const cls = d.positive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${cls}`}>
      {d.sign} {d.pctVal}{prefix && ` ${prefix}`}
    </span>
  );
}

/* ─────────────── PAGE ─────────────── */

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<"combined" | "ris" | "rps">("combined");
  const [chartTab, setChartTab] = useState<"leads" | "spend" | "roi">("leads");
  const [calcSpend, setCalcSpend] = useState<number>(100000);
  const [calcMonth, setCalcMonth] = useState<string>("Apr 26*");

  useEffect(() => {
    document.title = "Marketing Dashboard | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow");
  }, []);

  const current = MONTHLY_COMBINED[4];
  const previous = MONTHLY_COMBINED[3];

  /* Forecast for April end of month */
  const forecastMultiplier = DAYS_IN_APRIL / TODAY_DATE;
  const forecast = {
    leads: Math.round(current.leads * forecastMultiplier),
    walkins: Math.round(current.walkins * forecastMultiplier),
    admissions: Math.round(current.admissions * forecastMultiplier),
    spend: Math.round(current.spend * forecastMultiplier),
    bookings: Math.round(current.bookings * forecastMultiplier),
  };

  /* What-If Calculator */
  const calcMonthData = MONTHLY_COMBINED.find(m => m.month === calcMonth) || current;
  const calcResults = useMemo(() => {
    if (!calcSpend || calcSpend <= 0) return { leads: 0, walkins: 0, admissions: 0, bookings: 0, revenue: 0, roi: 0 };
    const leads = calcSpend / calcMonthData.cpl;
    const walkins = calcSpend / calcMonthData.cpw;
    const admissions = calcSpend / calcMonthData.cpa;
    const bookingRate = calcMonthData.bookings / calcMonthData.leads;
    const bookings = leads * bookingRate;
    const revenue = admissions * 90000;
    const roi = ((revenue - calcSpend) / calcSpend) * 100;
    return { leads, walkins, admissions, bookings, revenue, roi };
  }, [calcSpend, calcMonth, calcMonthData]);

  /* YoY combined helper - Dec/Jan/Feb/Mar/Apr matched against last year */
  const yoyData = MONTHLY_COMBINED.map(curr => {
    const monthShort = curr.month.split(" ")[0];
    const lastYearMatch = LAST_YEAR_COMBINED.find(ly => ly.month.startsWith(monthShort));
    return {
      month: monthShort,
      currLeads: curr.leads,
      lastLeads: lastYearMatch?.leads || 0,
      currAdmissions: curr.admissions,
      lastAdmissions: lastYearMatch?.admissions || 0,
      currSpend: curr.spend,
      lastSpend: lastYearMatch?.spend || 0,
    };
  });

  const lastYearProgress = ((LAST_YEAR_RIS_TOTAL.admissions + LAST_YEAR_RPS_TOTAL.admissions) / 9).toFixed(1);
  const thisYearAvg = (TOTAL.admissions / 5).toFixed(1);

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* ── Top Bar ── */}
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-sm">RIS</div>
          <div>
            <div className="font-black text-lg leading-tight tracking-tight">Marketing Performance Dashboard</div>
            <div className="text-xs text-blue-200">Rainbow International School &amp; Preschool — Internal Use Only</div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-xs">
          <div className="text-right">
            <div className="text-blue-200 uppercase tracking-wider">Academic Year</div>
            <div className="font-black text-sm">2026 – 27</div>
          </div>
          <div className="text-right">
            <div className="text-blue-200 uppercase tracking-wider">Last Updated</div>
            <div className="font-black text-sm">{LAST_UPDATED}</div>
          </div>
          <span className="bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">Confidential</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ───────── 1. YTD KPIs ───────── */}
        <section>
          <SectionTitle title="Year-to-Date Performance Summary" sub="Combined RIS + RPS  |  Dec 2025 – Apr 16, 2026" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Total Leads" value={num(TOTAL.leads)} sub="across 5 months" />
            <KpiCard label="Total Admissions" value={num(TOTAL.admissions)} sub={`CPA: ${inr(TOTAL.cpa)}`} color={GREEN} />
            <KpiCard label="Total Walk-ins" value={num(TOTAL.walkins)} sub={`CPW: ${inr(TOTAL.cpw)}`} color={BLUE} />
            <KpiCard label="Total Marketing Spend" value={inr(TOTAL.spend)} sub={`Meta + Google`} color={RED} />
            <KpiCard label="Avg. Cost per Lead" value={inr(TOTAL.cpl)} sub="across all channels" color={PURPLE} />
            <KpiCard label="Min. ROI" value={`${TOTAL.roi}%`} sub="on minimum revenue basis" color={GREEN} />
          </div>
        </section>

        {/* ───────── 2. Month-over-Month Comparison ───────── */}
        <section>
          <SectionTitle title="Month-over-Month Comparison" sub="April 2026 (in progress) vs March 2026 (final)" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Total Leads", curr: current.leads, prev: previous.leads, format: num, color: NAVY },
              { label: "Walk-ins", curr: current.walkins, prev: previous.walkins, format: num, color: BLUE },
              { label: "Admissions", curr: current.admissions, prev: previous.admissions, format: num, color: GREEN },
              { label: "Marketing Spend", curr: current.spend, prev: previous.spend, format: inr, color: RED },
              { label: "Avg. CPL", curr: current.cpl, prev: previous.cpl, format: inr, color: PURPLE, invert: true },
            ].map((k, i) => {
              const d = deltaArrow(k.curr, k.prev);
              const goodDirection = (k as any).invert ? !d.positive : d.positive;
              return (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <div className="text-xl font-black" style={{ color: k.color }}>{k.format(k.curr)}</div>
                    <span className={`text-[11px] font-bold ${goodDirection ? "text-green-600" : "text-red-500"}`}>
                      {d.sign} {d.pctVal}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">vs Mar: {k.format(k.prev)}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[12px] text-gray-500 italic">
            Note: April figures reflect performance through April 16 only ({TODAY_DATE} of {DAYS_IN_APRIL} days = {Math.round((TODAY_DATE / DAYS_IN_APRIL) * 100)}% of month). See forecast section below for projected month-end.
          </div>
        </section>

        {/* ───────── 3. April Forecast ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle
            title="April 2026 Forecast (Projected Month-End)"
            sub={`Based on current pace: ${TODAY_DATE} days elapsed × ${forecastMultiplier.toFixed(2)}× projection multiplier`}
            badge="Live Forecast"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Forecasted Leads", curr: current.leads, fc: forecast.leads, color: NAVY },
              { label: "Forecasted Walk-ins", curr: current.walkins, fc: forecast.walkins, color: BLUE },
              { label: "Forecasted Admissions", curr: current.admissions, fc: forecast.admissions, color: GREEN },
              { label: "Forecasted Spend", curr: current.spend, fc: forecast.spend, color: RED, isMoney: true },
            ].map((k, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-2xl font-black" style={{ color: k.color }}>
                    {k.isMoney ? inr(k.fc) : num(k.fc)}
                  </div>
                </div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Now: {k.isMoney ? inr(k.curr) : num(k.curr)}  ·  Pending: {k.isMoney ? inr(k.fc - k.curr) : num(k.fc - k.curr)}
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(k.curr / k.fc) * 100}%`, background: k.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-lg p-3 border-l-4 border-amber-400 bg-amber-50">
              <div className="font-bold text-amber-700 mb-1">vs March (final)</div>
              <div className="text-gray-700">Forecasted leads ({num(forecast.leads)}) vs Mar ({num(previous.leads)}): {deltaArrow(forecast.leads, previous.leads).sign} {deltaArrow(forecast.leads, previous.leads).pctVal}</div>
            </div>
            <div className="rounded-lg p-3 border-l-4 border-blue-400 bg-blue-50">
              <div className="font-bold text-blue-700 mb-1">Forecast Confidence</div>
              <div className="text-gray-700">Linear daily-rate model. Accuracy improves as month progresses ({Math.round((TODAY_DATE / DAYS_IN_APRIL) * 100)}% data captured).</div>
            </div>
            <div className="rounded-lg p-3 border-l-4 border-green-400 bg-green-50">
              <div className="font-bold text-green-700 mb-1">Projected EOM Revenue</div>
              <div className="text-gray-700">{forecast.admissions} admissions × ₹90,000 min = {inr(forecast.admissions * 90000)} (min ROI basis)</div>
            </div>
          </div>
        </section>

        {/* ───────── 4. What-If Calculator ───────── */}
        <section className="bg-gradient-to-br from-[#091a4f] to-[#0d3b86] rounded-2xl p-6 text-white shadow-lg">
          <div className="mb-4">
            <h2 className="text-lg font-black">What-If Spend Calculator</h2>
            <p className="text-xs text-blue-200 mt-1">Enter a budget amount and select a reference month — projections adapt to that month's CPL/CPW/CPA trend.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-blue-200 mb-2">Marketing Budget (₹)</label>
              <input
                type="number"
                value={calcSpend}
                onChange={(e) => setCalcSpend(Number(e.target.value))}
                placeholder="100000"
                min={0}
                step={5000}
                className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-bold placeholder-white/40 focus:outline-none focus:border-amber-400"
                data-testid="input-calc-spend"
              />
              <div className="text-[11px] text-blue-200 mt-1">{calcSpend > 0 ? `= ${inr(calcSpend)}` : "Enter amount above"}</div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-blue-200 mb-2">Reference Month (trend basis)</label>
              <select
                value={calcMonth}
                onChange={(e) => setCalcMonth(e.target.value)}
                className="w-full bg-white/10 backdrop-blur border border-white/20 rounded-lg px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-amber-400"
                data-testid="select-calc-month"
              >
                {MONTHLY_COMBINED.map(m => (
                  <option key={m.month} value={m.month} className="text-[#091a4f]">{m.month} — CPL {inr(m.cpl)}</option>
                ))}
              </select>
              <div className="text-[11px] text-blue-200 mt-1">
                CPL: {inr(calcMonthData.cpl)} · CPW: {inr(calcMonthData.cpw)} · CPA: {inr(calcMonthData.cpa)}
              </div>
            </div>

            <div className="rounded-lg bg-amber-400/10 border border-amber-400/30 p-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-amber-300 mb-1">Quick Presets</div>
              <div className="flex flex-wrap gap-2">
                {[50000, 100000, 200000, 500000, 1000000].map(v => (
                  <button
                    key={v}
                    onClick={() => setCalcSpend(v)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${calcSpend === v ? "bg-amber-400 text-[#091a4f]" : "bg-white/10 text-white hover:bg-white/20"}`}
                  >
                    {inr(v)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Expected Leads", value: Math.round(calcResults.leads), color: "bg-white/15" },
              { label: "Expected Bookings", value: Math.round(calcResults.bookings), color: "bg-white/15" },
              { label: "Expected Walk-ins", value: Math.round(calcResults.walkins), color: "bg-white/15" },
              { label: "Expected Admissions", value: Math.round(calcResults.admissions), color: "bg-amber-400 text-[#091a4f]" },
            ].map((r, i) => (
              <div key={i} className={`rounded-xl p-4 ${r.color}`}>
                <div className="text-[10px] uppercase tracking-wider font-bold opacity-70">{r.label}</div>
                <div className="text-3xl font-black mt-1">{num(r.value)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-white/10 p-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-blue-200">Projected Revenue (min)</div>
              <div className="text-xl font-black mt-1">{inr(calcResults.revenue)}</div>
              <div className="text-[11px] text-blue-200 mt-0.5">@ ₹90,000 per admission</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-blue-200">Projected ROI</div>
              <div className="text-xl font-black mt-1" style={{ color: calcResults.roi > 500 ? "#34d399" : "#fbbf24" }}>
                {calcResults.roi > 0 ? `${Math.round(calcResults.roi)}%` : "—"}
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">((Revenue − Spend) / Spend) × 100</div>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <div className="text-[11px] uppercase tracking-wider font-bold text-blue-200">Net Revenue</div>
              <div className="text-xl font-black mt-1" style={{ color: calcResults.revenue - calcSpend > 0 ? "#34d399" : "#f87171" }}>
                {inr(calcResults.revenue - calcSpend)}
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">Revenue − Marketing Spend</div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-blue-200 italic">
            Calculation logic: Leads = Spend ÷ {inr(calcMonthData.cpl)} CPL. Walk-ins = Spend ÷ {inr(calcMonthData.cpw)} CPW. Admissions = Spend ÷ {inr(calcMonthData.cpa)} CPA. Bookings derived from {calcMonth} booking-to-lead ratio of {((calcMonthData.bookings / calcMonthData.leads) * 100).toFixed(0)}%.
          </div>
        </section>

        {/* ───────── 5. April Branch Comparison ───────── */}
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle title="April 2026 — Branch Comparison" sub="RIS vs RPS performance side-by-side" />
            <div className="space-y-3">
              {[
                { label: "Total Leads", ris: APRIL_RIS.leads, rps: APRIL_RPS.leads, max: 130 },
                { label: "Closed Leads", ris: APRIL_RIS.closed, rps: APRIL_RPS.closed, max: 70 },
                { label: "Bookings", ris: APRIL_RIS.bookings, rps: APRIL_RPS.bookings, max: 60 },
                { label: "Walk-ins", ris: APRIL_RIS.walkins, rps: APRIL_RPS.walkins, max: 40 },
                { label: "Admissions", ris: APRIL_RIS.admissions, rps: APRIL_RPS.admissions, max: 15 },
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
                <div className="text-xs text-gray-500 font-medium mb-1">RIS Conversion Rate</div>
                <div className="text-2xl font-black" style={{ color: NAVY }}>
                  {pct((APRIL_RIS.admissions / APRIL_RIS.leads) * 100)}
                </div>
                <div className="text-[11px] text-gray-400">{APRIL_RIS.admissions} adm of {APRIL_RIS.leads} leads</div>
              </div>
              <div className="rounded-xl bg-cyan-50 p-3 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">RPS Conversion Rate</div>
                <div className="text-2xl font-black" style={{ color: CYAN }}>
                  {pct((APRIL_RPS.admissions / APRIL_RPS.leads) * 100)}
                </div>
                <div className="text-[11px] text-gray-400">{APRIL_RPS.admissions} adm of {APRIL_RPS.leads} leads</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle title="April 2026 — Channel Spend Breakdown" sub="Meta vs Google ad investment" />
            <div className="space-y-3">
              <div className="rounded-xl p-4 text-white" style={{ background: "#1877f2" }}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="text-xs font-bold opacity-80 uppercase tracking-wider">Meta (Facebook + Instagram)</div>
                    <div className="text-3xl font-black mt-1">{inr(current.meta)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">{num(PLATFORM_DATA[4].metaLeads)} leads</div>
                    <div className="text-xs opacity-80">CPL: {inr(current.meta / PLATFORM_DATA[4].metaLeads)}</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-4 text-white" style={{ background: "#ea4335" }}>
                <div className="flex justify-between items-baseline">
                  <div>
                    <div className="text-xs font-bold opacity-80 uppercase tracking-wider">Google Ads</div>
                    <div className="text-3xl font-black mt-1">{inr(current.google)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">{num(PLATFORM_DATA[4].googleLeads)} leads</div>
                    <div className="text-xs opacity-80">CPL: {inr(current.google / PLATFORM_DATA[4].googleLeads)}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-center bg-gray-50 rounded-lg py-3">
                  <div className="text-xs text-gray-500">Meta Share</div>
                  <div className="text-xl font-black" style={{ color: "#1877f2" }}>
                    {pct((current.meta / current.spend) * 100)}
                  </div>
                </div>
                <div className="text-center bg-gray-50 rounded-lg py-3">
                  <div className="text-xs text-gray-500">Google Share</div>
                  <div className="text-xl font-black" style={{ color: "#ea4335" }}>
                    {pct((current.google / current.spend) * 100)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── 6. Monthly Trend Chart ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <SectionTitle title="Monthly Trend Analysis (AY 2025-26)" />
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              {(["leads", "spend", "roi"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartTab(t)}
                  className={`px-4 py-2 font-bold capitalize ${chartTab === t ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={chartTab === t ? { background: NAVY } : {}}
                >{t === "roi" ? "ROI %" : t === "spend" ? "Ad Spend" : "Leads & Admissions"}</button>
              ))}
            </div>
          </div>

          {chartTab === "leads" && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MONTHLY_COMBINED} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis tick={TICK} />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Total Leads" fill={NAVY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="walkins" name="Walk-ins" fill={CYAN} radius={[4, 4, 0, 0]} />
                <Bar dataKey="admissions" name="Admissions" fill={GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartTab === "spend" && (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={MONTHLY_COMBINED} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis tick={TICK} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => inr(v)} />
                <Legend />
                <Bar dataKey="meta" name="Meta Spend" fill="#1877f2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="google" name="Google Spend" fill="#ea4335" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartTab === "roi" && (
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={MONTHLY_COMBINED}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis yAxisId="left" tick={TICK} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" tick={TICK} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip />
                <Legend />
                <Area yAxisId="right" type="monotone" dataKey="spend" name="Ad Spend (₹)" fill={RED} stroke={RED} fillOpacity={0.15} />
                <Line yAxisId="left" type="monotone" dataKey="roi" name="ROI %" stroke={GREEN} strokeWidth={3} dot={{ r: 5, fill: GREEN }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* ───────── 7. Year-over-Year Comparison ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Year-over-Year Comparison" sub="AY 2024-25 (last year) vs AY 2025-26 (current) — same months only" />

          <div className="grid sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Leads YoY", curr: TOTAL.leads, prev: 752, sub: "Dec–Apr same period" },
              { label: "Admissions YoY", curr: TOTAL.admissions, prev: 84, sub: "Dec–Apr same period" },
              { label: "Spend YoY", curr: TOTAL.spend, prev: 974642, sub: "Dec–Apr same period", isMoney: true },
              { label: "Walk-ins YoY", curr: TOTAL.walkins, prev: 304, sub: "Dec–Apr same period" },
            ].map((k, i) => {
              const d = deltaArrow(k.curr, k.prev);
              return (
                <div key={i} className="rounded-xl border border-gray-100 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                  <div className="text-2xl font-black mt-1" style={{ color: NAVY }}>
                    {k.isMoney ? inr(k.curr) : num(k.curr)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${d.positive ? "text-green-600" : "text-red-500"}`}>{d.sign} {d.pctVal}</span>
                    <span className="text-[11px] text-gray-500">vs {k.isMoney ? inr(k.prev) : num(k.prev)} LY</span>
                  </div>
                </div>
              );
            })}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={yoyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={TICK} />
              <YAxis tick={TICK} />
              <Tooltip />
              <Legend />
              <Bar dataKey="lastLeads" name="Leads (Last Year)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="currLeads" name="Leads (This Year)" fill={NAVY} radius={[4, 4, 0, 0]} />
              <Bar dataKey="lastAdmissions" name="Adm (Last Year)" fill="#fcd34d" radius={[4, 4, 0, 0]} />
              <Bar dataKey="currAdmissions" name="Adm (This Year)" fill={GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg p-3 bg-blue-50 border-l-4 border-blue-400">
              <div className="font-bold text-blue-700 mb-1">Last Year FY Total (Oct 24 – Jun 25)</div>
              <div className="text-gray-700">Total Spend: <strong>{inr(LAST_YEAR_TOTAL.spend)}</strong> · Leads: <strong>{num(LAST_YEAR_TOTAL.leads)}</strong> · Admissions: <strong>{LAST_YEAR_TOTAL.admissions}</strong> · Avg admissions/month: <strong>{lastYearProgress}</strong></div>
            </div>
            <div className="rounded-lg p-3 bg-green-50 border-l-4 border-green-400">
              <div className="font-bold text-green-700 mb-1">This Year Pace (Dec 25 – Apr 26)</div>
              <div className="text-gray-700">Total Spend: <strong>{inr(TOTAL.spend)}</strong> · Leads: <strong>{num(TOTAL.leads)}</strong> · Admissions: <strong>{TOTAL.admissions}</strong> · Avg admissions/month: <strong>{thisYearAvg}</strong></div>
            </div>
          </div>
        </section>

        {/* ───────── 8. April Weekly Breakdown ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <SectionTitle title="April 2026 — Weekly Breakdown" sub="Week-by-week leads, walk-ins, bookings, admissions" />
            <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
              {(["combined", "ris", "rps"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 font-bold uppercase tracking-wider ${activeTab === t ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={activeTab === t ? { background: t === "rps" ? CYAN : NAVY } : {}}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-semibold">Week</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Leads</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Bookings</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Walk-ins</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Admissions</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {APRIL_WEEKLY.map((w, i) => {
                  const leads = activeTab === "ris" ? w.risLeads : activeTab === "rps" ? w.rpsLeads : w.risLeads + w.rpsLeads;
                  const walk = activeTab === "ris" ? w.risWalk : activeTab === "rps" ? w.rpsWalk : w.risWalk + w.rpsWalk;
                  const adm = activeTab === "ris" ? w.risAdm : activeTab === "rps" ? w.rpsAdm : w.risAdm + w.rpsAdm;
                  const book = activeTab === "ris" ? w.risBook : activeTab === "rps" ? w.rpsBook : w.risBook + w.rpsBook;
                  const conv = leads > 0 ? ((adm / leads) * 100).toFixed(1) : "—";
                  return (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-3 px-3 font-semibold text-gray-700">{w.week}</td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: NAVY }}>{leads}</td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600">{book}</td>
                      <td className="py-3 px-3 text-center font-bold text-cyan-700">{walk}</td>
                      <td className="py-3 px-3 text-center font-bold text-green-700">{adm}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${parseFloat(conv) > 5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{conv}%</span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="font-black border-t-2 border-gray-200" style={{ background: `${NAVY}08` }}>
                  <td className="py-3 px-3">April Total (so far)</td>
                  <td className="py-3 px-3 text-center" style={{ color: NAVY }}>
                    {activeTab === "ris" ? APRIL_RIS.leads : activeTab === "rps" ? APRIL_RPS.leads : APRIL_RIS.leads + APRIL_RPS.leads}
                  </td>
                  <td className="py-3 px-3 text-center text-amber-600">
                    {activeTab === "ris" ? APRIL_RIS.bookings : activeTab === "rps" ? APRIL_RPS.bookings : APRIL_RIS.bookings + APRIL_RPS.bookings}
                  </td>
                  <td className="py-3 px-3 text-center text-cyan-700">
                    {activeTab === "ris" ? APRIL_RIS.walkins : activeTab === "rps" ? APRIL_RPS.walkins : APRIL_RIS.walkins + APRIL_RPS.walkins}
                  </td>
                  <td className="py-3 px-3 text-center text-green-700">
                    {activeTab === "ris" ? APRIL_RIS.admissions : activeTab === "rps" ? APRIL_RPS.admissions : APRIL_RIS.admissions + APRIL_RPS.admissions}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {(() => {
                      const l = activeTab === "ris" ? APRIL_RIS.leads : activeTab === "rps" ? APRIL_RPS.leads : APRIL_RIS.leads + APRIL_RPS.leads;
                      const a = activeTab === "ris" ? APRIL_RIS.admissions : activeTab === "rps" ? APRIL_RPS.admissions : APRIL_RIS.admissions + APRIL_RPS.admissions;
                      return <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-green-100 text-green-700">{((a / l) * 100).toFixed(1)}%</span>;
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ───────── 9. Social Media ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Social Media Performance" sub="Latest follower counts and engagement — RIS vs RPS" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { platform: "Instagram", risVal: num(SOCIAL_RIS.instaFollowers), rpsVal: num(SOCIAL_RPS.instaFollowers), label: "Followers", color: "#e1306c" },
              { platform: "Facebook", risVal: num(SOCIAL_RIS.fbFollowers), rpsVal: num(SOCIAL_RPS.fbFollowers), label: "Followers", color: "#1877f2" },
              { platform: "YouTube", risVal: num(SOCIAL_RIS.ytViews), rpsVal: num(SOCIAL_RPS.ytViews), label: "Total Views (Jan)", color: "#ff0000" },
              { platform: "Website (GSC)", risVal: num(SOCIAL_RIS.websiteClicks), rpsVal: num(SOCIAL_RPS.websiteClicks), label: "Apr Week 2 Clicks", color: GREEN },
            ].map(s => (
              <div key={s.platform} className="rounded-xl border border-gray-100 p-4">
                <div className="font-bold text-sm text-gray-800">{s.platform}</div>
                <div className="text-[11px] text-gray-400 mb-3">{s.label}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white" style={{ background: NAVY }}>RIS</span>
                    <span className="font-black" style={{ color: s.color }}>{s.risVal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md text-white" style={{ background: CYAN }}>RPS</span>
                    <span className="font-black" style={{ color: s.color }}>{s.rpsVal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── 10. Full Monthly Summary Table ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Full Monthly Summary — AY 2025-26 (Current)" sub="Combined RIS + RPS" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: NAVY }} className="text-white">
                  {["Month", "Leads", "Bookings", "Walk-ins", "Admissions", "Meta Spend", "Google Spend", "Total Spend", "CPL", "CPW", "CPA", "ROI"].map(h => (
                    <th key={h} className="py-3 px-3 text-left font-semibold text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHLY_COMBINED.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-3 px-3 font-bold text-[#091a4f]">{r.month}</td>
                    <td className="py-3 px-3">{num(r.leads)}</td>
                    <td className="py-3 px-3">{num(r.bookings)}</td>
                    <td className="py-3 px-3">{num(r.walkins)}</td>
                    <td className="py-3 px-3 font-bold text-green-700">{r.admissions}</td>
                    <td className="py-3 px-3 text-blue-700">{inr(r.meta)}</td>
                    <td className="py-3 px-3 text-red-600">{inr(r.google)}</td>
                    <td className="py-3 px-3 font-bold">{inr(r.spend)}</td>
                    <td className="py-3 px-3">{inr(r.cpl)}</td>
                    <td className="py-3 px-3">{inr(r.cpw)}</td>
                    <td className="py-3 px-3">{inr(r.cpa)}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${r.roi >= 1000 ? "bg-green-100 text-green-700" : r.roi >= 500 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>{r.roi}%</span>
                    </td>
                  </tr>
                ))}
                <tr className="font-black border-t-2 border-gray-300" style={{ background: `${NAVY}10` }}>
                  <td className="py-3 px-3" style={{ color: NAVY }}>TOTAL</td>
                  <td className="py-3 px-3">{num(TOTAL.leads)}</td>
                  <td className="py-3 px-3">{num(TOTAL.bookings)}</td>
                  <td className="py-3 px-3">{num(TOTAL.walkins)}</td>
                  <td className="py-3 px-3 text-green-700">{TOTAL.admissions}</td>
                  <td className="py-3 px-3 text-blue-700">{inr(TOTAL.meta)}</td>
                  <td className="py-3 px-3 text-red-600">{inr(TOTAL.google)}</td>
                  <td className="py-3 px-3">{inr(TOTAL.spend)}</td>
                  <td className="py-3 px-3">{inr(TOTAL.cpl)}</td>
                  <td className="py-3 px-3">{inr(TOTAL.cpw)}</td>
                  <td className="py-3 px-3">{inr(TOTAL.cpa)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-green-100 text-green-700">{TOTAL.roi}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ───────── 11. Last Year Summary Table ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Last Year Summary — AY 2024-25" sub="RIS + RPS month-by-month, as on 13 June 2025 closing snapshot" />
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
                  <th className="py-2 px-3"></th>
                  <th className="py-2 px-3 text-center">Spend</th>
                  <th className="py-2 px-3 text-center">Leads</th>
                  <th className="py-2 px-3 text-center">Walk</th>
                  <th className="py-2 px-3 text-center">Adm</th>
                  <th className="py-2 px-3 text-center">Spend</th>
                  <th className="py-2 px-3 text-center">Leads</th>
                  <th className="py-2 px-3 text-center">Walk</th>
                  <th className="py-2 px-3 text-center">Adm</th>
                  <th className="py-2 px-3 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {LAST_YEAR_RIS.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-2 px-3 font-bold text-[#091a4f]">{r.month}</td>
                    <td className="py-2 px-3 text-center">{inr(r.spend)}</td>
                    <td className="py-2 px-3 text-center">{r.leads}</td>
                    <td className="py-2 px-3 text-center">{r.walkins}</td>
                    <td className="py-2 px-3 text-center font-bold text-green-700">{r.admissions}</td>
                    <td className="py-2 px-3 text-center">{inr(LAST_YEAR_RPS[i].spend)}</td>
                    <td className="py-2 px-3 text-center">{LAST_YEAR_RPS[i].leads}</td>
                    <td className="py-2 px-3 text-center">{LAST_YEAR_RPS[i].walkins}</td>
                    <td className="py-2 px-3 text-center font-bold text-green-700">{LAST_YEAR_RPS[i].admissions}</td>
                    <td className="py-2 px-3 text-center font-black text-[#091a4f]">{r.admissions + LAST_YEAR_RPS[i].admissions}</td>
                  </tr>
                ))}
                <tr className="font-black border-t-2 border-gray-300" style={{ background: `${SLATE}15` }}>
                  <td className="py-3 px-3">TOTAL</td>
                  <td className="py-3 px-3 text-center">{inr(LAST_YEAR_RIS_TOTAL.spend)}</td>
                  <td className="py-3 px-3 text-center">{LAST_YEAR_RIS_TOTAL.leads}</td>
                  <td className="py-3 px-3 text-center">{LAST_YEAR_RIS_TOTAL.walkins}</td>
                  <td className="py-3 px-3 text-center text-green-700">{LAST_YEAR_RIS_TOTAL.admissions}</td>
                  <td className="py-3 px-3 text-center">{inr(LAST_YEAR_RPS_TOTAL.spend)}</td>
                  <td className="py-3 px-3 text-center">{LAST_YEAR_RPS_TOTAL.leads}</td>
                  <td className="py-3 px-3 text-center">{LAST_YEAR_RPS_TOTAL.walkins}</td>
                  <td className="py-3 px-3 text-center text-green-700">{LAST_YEAR_RPS_TOTAL.admissions}</td>
                  <td className="py-3 px-3 text-center text-[#091a4f]">{LAST_YEAR_TOTAL.admissions}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ───────── 12. Insights & Recommendations ───────── */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Performance Insights & Recommendations" sub="Auto-generated from current data trends" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                color: "green", title: "March 2026 was the Best Month",
                body: "March achieved the highest ROI at 2,075% with 47 admissions on ₹1,94,500 spend. Lowest CPA of ₹4,138 across all months. Replicate March's campaign mix in May.",
              },
              {
                color: "red", title: "January Spend Inefficiency",
                body: "January saw 2.4× higher spend (₹4,59,906) but produced only 27 admissions — CPA spiked to ₹17,034. Audit Jan campaign targeting and creative quality.",
              },
              {
                color: "amber", title: "April Tracking Below March",
                body: `Forecasted April leads (${num(forecast.leads)}) are projected ${deltaArrow(forecast.leads, previous.leads).positive ? "above" : "below"} March's ${num(previous.leads)}. Forecasted admissions of ${forecast.admissions} vs March's ${previous.admissions}.`,
              },
              {
                color: "blue", title: "Google Dominates Spend",
                body: `Google = ${pct((TOTAL.google / (TOTAL.meta + TOTAL.google)) * 100)} of YTD ad budget vs Meta ${pct((TOTAL.meta / (TOTAL.meta + TOTAL.google)) * 100)}. Meta historically delivers lower CPL — consider rebalancing.`,
              },
              {
                color: "purple", title: "RPS Social Stronger than RIS",
                body: `RPS leads on Instagram (${num(SOCIAL_RPS.instaFollowers)} vs ${num(SOCIAL_RIS.instaFollowers)}) and Facebook. Replicate RPS content cadence and creative style for RIS social channels.`,
              },
              {
                color: "green", title: "YoY Growth on Track",
                body: `YTD admissions of ${TOTAL.admissions} this year vs ${84} same months last year (Dec–Apr) = ${deltaArrow(TOTAL.admissions, 84).pctVal} growth. Marketing efficiency is improving.`,
              },
            ].map((ins, i) => (
              <div key={i} className={`rounded-xl p-4 border-l-4 ${
                ins.color === "green" ? "border-green-400 bg-green-50" :
                ins.color === "amber" ? "border-amber-400 bg-amber-50" :
                ins.color === "red" ? "border-red-400 bg-red-50" :
                ins.color === "blue" ? "border-blue-400 bg-blue-50" :
                "border-purple-400 bg-purple-50"
              }`}>
                <div className="font-bold text-sm text-gray-800 mb-2">{ins.title}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{ins.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6 pt-2 border-t border-gray-200">
          <div>This dashboard is strictly confidential — for internal management use only.</div>
          <div className="mt-1">Data sourced from DM Performance Tracker (Nabeel sub-sheet) and DM Target-Wise Report (June 2025).</div>
          <div className="mt-1">Last updated: {LAST_UPDATED} · To refresh data, share a screenshot and the numbers will be updated.</div>
        </div>
      </div>
    </div>
  );
}
