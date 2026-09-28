import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";
import { unlockWalkinDashboard, useWalkinDashboardSession } from "@/lib/walkinDashboardAuth";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", PURPLE = "#7c3aed", SLATE = "#475569";
const PIE_COLORS = [NAVY, RED, AMBER, GREEN, BLUE, PURPLE, SLATE, "#0891b2", "#ea580c"];
const QUIET_BLUE = "#34547a";
const QUIET_BLUE_LIGHT = "#7994ae";
const QUIET_TEAL = "#668b8b";
const QUIET_WARM = "#c4936d";
const QUIET_ROSE = "#b77d78";
const QUIET_STATUS_COLORS = [QUIET_BLUE, QUIET_BLUE_LIGHT, QUIET_WARM, QUIET_TEAL, QUIET_ROSE, "#91a8bd", "#788896"];


type CounsellorStat = { leadOwner: string; leads: number; walkins: number; admissions: number; closed: number; open: number };
type Stats = {
  brand: string | null;
  academicYear: string;
  kpis: { totalLeads: number; bookings: number; walkins: number; admissions: number };
  monthly: Array<{ month: string; cnt: number }>;
  monthlyDetail: Array<{ month: string; leads: number; walkins: number; admissions: number; closed: number }>;
  bySource: Array<{ source: string; cnt: number }>;
  byBranch: Array<{ branchId: number | null; cnt: number }>;
  byOwner: Array<{ leadOwner: string | null; cnt: number }>;
  statusBreakdown: Array<{ status: string; cnt: number }>;
  byCounsellor: Array<CounsellorStat>;
  byProgram: Array<{ program: string; cnt: number }>;
  generatedAt: string;
  cachedAt?: string;
  dataSource?: "database" | "hybrid";
  stale?: true;
  sourceHealth?: {
    database: "available";
    supplementary: "available" | "unavailable";
    supplementaryFetchedAt: string | null;
    warning?: string;
  };
};

type BrandTab = "combined" | "RIS" | "RPS";
type InnerTab = "overview" | "trends" | "analytics" | "counsellors";
const INNER_TABS: { id: InnerTab; label: string }[] = [
  { id: "overview",    label: "Overview"    },
  { id: "trends",      label: "Trends"      },
  { id: "analytics",   label: "Analytics"   },
  { id: "counsellors", label: "Counsellors" },
];

const fmt = (n: number) => n.toLocaleString("en-IN");
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

function mergeStats(ris: Stats, rps: Stats): Stats {
  const kpis = {
    totalLeads: ris.kpis.totalLeads + rps.kpis.totalLeads,
    bookings:   ris.kpis.bookings   + rps.kpis.bookings,
    walkins:    ris.kpis.walkins    + rps.kpis.walkins,
    admissions: ris.kpis.admissions + rps.kpis.admissions,
  };
  const merge = <T extends { [k: string]: any }>(arrays: T[][], key: string): T[] => {
    const m = new Map<string, number>();
    for (const arr of arrays) for (const item of arr) m.set(item[key], (m.get(item[key]) ?? 0) + item.cnt);
    return Array.from(m, ([k, cnt]) => ({ [key]: k, cnt } as any)).sort((a: any, b: any) => b.cnt - a.cnt);
  };
  const monthMap = new Map<string, { leads: number; walkins: number; admissions: number; closed: number }>();
  for (const arr of [ris.monthlyDetail, rps.monthlyDetail]) {
    for (const m of arr) {
      const e = monthMap.get(m.month) ?? { leads: 0, walkins: 0, admissions: 0, closed: 0 };
      e.leads += m.leads; e.walkins += m.walkins; e.admissions += m.admissions; e.closed += m.closed;
      monthMap.set(m.month, e);
    }
  }
  const monthlyDetail = Array.from(monthMap, ([month, d]) => ({ month, ...d }));
  const counsellorMap = new Map<string, CounsellorStat>();
  for (const arr of [ris.byCounsellor, rps.byCounsellor]) {
    for (const c of arr) {
      const e = counsellorMap.get(c.leadOwner) ?? { leadOwner: c.leadOwner, leads: 0, walkins: 0, admissions: 0, closed: 0, open: 0 };
      e.leads += c.leads; e.walkins += c.walkins; e.admissions += c.admissions; e.closed += c.closed; e.open += c.open;
      counsellorMap.set(c.leadOwner, e);
    }
  }
  const byCounsellor = Array.from(counsellorMap.values()).sort((a, b) => b.admissions - a.admissions || b.leads - a.leads);
  const statusMap = new Map<string, number>();
  for (const arr of [ris.statusBreakdown, rps.statusBreakdown]) for (const s of arr) statusMap.set(s.status, (statusMap.get(s.status) ?? 0) + s.cnt);
  const statusBreakdown = Array.from(statusMap, ([status, cnt]) => ({ status, cnt })).sort((a, b) => b.cnt - a.cnt);
  return {
    brand: null, academicYear: "2027-28",
    kpis, monthlyDetail,
    monthly: monthlyDetail.map(m => ({ month: m.month, cnt: m.leads })),
    bySource: merge([ris.bySource, rps.bySource], "source"),
    byBranch: [],
    byOwner: merge([ris.byOwner, rps.byOwner], "leadOwner"),
    statusBreakdown, byCounsellor,
    byProgram: merge([ris.byProgram, rps.byProgram], "program"),
    generatedAt: ris.generatedAt,
    cachedAt: ris.cachedAt,
    dataSource: ris.dataSource === "hybrid" || rps.dataSource === "hybrid" ? "hybrid" : "database",
    stale: ris.stale || rps.stale ? true : undefined,
    sourceHealth: {
      database: "available",
      supplementary: ris.sourceHealth?.supplementary === "available" && rps.sourceHealth?.supplementary === "available" ? "available" : "unavailable",
      supplementaryFetchedAt: [ris.sourceHealth?.supplementaryFetchedAt, rps.sourceHealth?.supplementaryFetchedAt].filter(Boolean).sort().at(-1) ?? null,
      ...((ris.sourceHealth?.warning || rps.sourceHealth?.warning) ? { warning: [ris.sourceHealth?.warning, rps.sourceHealth?.warning].filter(Boolean).join("; ") } : {}),
    },
  };
}

/* ── Month Range Filter ────────────────────────── */
function MonthRangeFilter({
  months, from, to, onFrom, onTo, accent,
}: { months: string[]; from: string | null; to: string | null; onFrom: (v: string | null) => void; onTo: (v: string | null) => void; accent: string }) {
  if (months.length === 0) return null;
  const isFiltered = !!(from || to);
  return (
    <div className="bg-slate-50 border-b border-slate-200 py-2 px-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Month range</span>
        <select value={from ?? ""}
          onChange={e => onFrom(e.target.value || null)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">From: All</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <span className="text-slate-400 text-xs">—</span>
        <select value={to ?? ""}
          onChange={e => onTo(e.target.value || null)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
          <option value="">To: All</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {isFiltered && (
          <button onClick={() => { onFrom(null); onTo(null); }}
            className="text-xs underline text-slate-500 hover:text-slate-700">Clear</button>
        )}
        {isFiltered && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#fef3c7", color: accent }}>
            Filtered · KPIs reflect selected range
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Passcode Gate ─────────────────────────────── */
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { document.title = "Marketing · AY 2027-28"; ref.current?.focus(); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await unlockWalkinDashboard(code, "marketing", remember)) onSuccess();
    else { setError(true); setCode(""); setTimeout(() => setError(false), 600); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400"
        style={{ animation: error ? "shake 0.4s" : undefined }}>
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/rainbow-group-logo-2.jpg" alt="Rainbow Group" style={{ height: 48, width: "auto", borderRadius: 8, flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg text-[#091a4f]">Marketing · AY 2027-28</div>
            <div className="text-xs text-slate-500">Rainbow Group · Internal · Passcode required</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input ref={ref} type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.4em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          placeholder="••••" />
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
          Remember this device for 30 days
        </label>
        {error && <div className="mt-2 text-sm text-red-600 text-center">Incorrect passcode</div>}
        <button type="submit" className="mt-5 w-full py-3 rounded-lg font-bold text-white hover:bg-[#0b2168] transition"
          style={{ background: NAVY }}>Unlock</button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

/* ── Shared UI atoms ───────────────────────────── */
function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white px-5 py-4 shadow-[0_8px_24px_rgba(35,61,89,0.05)]"
      style={{ borderColor: "#dfe7ef" }}>
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: accent || QUIET_BLUE }} aria-hidden="true" />
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">{label}</div>
      <div className="mt-1.5 text-2xl font-black tabular-nums" style={{ color: accent || QUIET_BLUE }}>{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, height = 260, responsive = true }: { title: string; children: React.ReactNode; height?: number; responsive?: boolean }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-[0_10px_30px_rgba(35,61,89,0.055)]"
      style={{ borderColor: "#dfe7ef" }}>
      <div className="mb-1 text-sm font-bold tracking-tight" style={{ color: "#233d59" }}>{title}</div>
      <div className="mb-4 text-[11px] text-slate-400">
        {title === "Monthly Lead Volume" ? "New enquiries received by month" : title === "Status Breakdown" ? "Where each enquiry sits today" : null}
      </div>
      <div style={{ height }}>
        {responsive ? <ResponsiveContainer>{children as any}</ResponsiveContainer> : children}
      </div>
    </div>
  );
}

function BarPct({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const p = total > 0 ? Math.round(value / total * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="font-medium text-slate-700 truncate max-w-[160px]">{label}</span>
        <span className="font-bold tabular-nums" style={{ color: NAVY }}>{fmt(value)} <span className="text-slate-400 font-normal">({p}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
      </div>
    </div>
  );
}

function Empty({ msg = "No data yet" }: { msg?: string }) {
  return <div className="h-40 flex items-center justify-center text-slate-400 text-sm">{msg}</div>;
}

/* ── Dashboard content (inner tabs) ───────────── */
function DashboardContent({ stats, brandTab }: { stats: Stats; brandTab: BrandTab }) {
  const [tab, setTab] = useState<InnerTab>("overview");
  const [filterFrom, setFilterFrom] = useState<string | null>(null);
  const [filterTo,   setFilterTo]   = useState<string | null>(null);
  const primary = brandTab === "RPS" ? "#667f9d" : QUIET_BLUE;
  const filterAccent = brandTab === "RPS" ? RED : "#d97706";

  const { kpis, monthly, monthlyDetail = [], bySource, byOwner, statusBreakdown, byCounsellor = [], byProgram = [] } = stats;
  const openLeads   = statusBreakdown.filter(s => ["OPEN","FOLLOW-UP"].includes(s.status)).reduce((a,s) => a+s.cnt, 0);
  const closedLeads = statusBreakdown.find(s => s.status === "CLOSED")?.cnt ?? 0;
  const brandLabel  = brandTab === "combined" ? "Combined (RIS + RPS)" : brandTab;

  // Reset filter when switching inner tabs
  useEffect(() => { setFilterFrom(null); setFilterTo(null); }, [tab]);

  // Available months for the picker (in data order)
  const availableMonths = useMemo(() => monthlyDetail.map(m => m.month), [monthlyDetail]);

  // Filtered month detail slice
  const filteredDetail = useMemo(() => {
    if (!filterFrom && !filterTo) return monthlyDetail;
    const fromIdx = filterFrom ? availableMonths.indexOf(filterFrom) : 0;
    const toIdx   = filterTo   ? availableMonths.indexOf(filterTo)   : availableMonths.length - 1;
    const lo = Math.min(fromIdx < 0 ? 0 : fromIdx, toIdx < 0 ? availableMonths.length - 1 : toIdx);
    const hi = Math.max(fromIdx < 0 ? 0 : fromIdx, toIdx < 0 ? availableMonths.length - 1 : toIdx);
    return monthlyDetail.slice(lo, hi + 1);
  }, [monthlyDetail, availableMonths, filterFrom, filterTo]);

  const isFiltered = !!(filterFrom || filterTo);

  // KPIs recalculated for the filtered range
  const activeKpis = useMemo(() => {
    if (!isFiltered) return kpis;
    return {
      totalLeads: filteredDetail.reduce((a, m) => a + m.leads, 0),
      bookings:   kpis.bookings, // no per-month breakdown available
      walkins:    filteredDetail.reduce((a, m) => a + m.walkins, 0),
      admissions: filteredDetail.reduce((a, m) => a + m.admissions, 0),
    };
  }, [filteredDetail, kpis, isFiltered]);

  const filteredMonthly = useMemo(
    () => filteredDetail.map(m => ({ month: m.month, cnt: m.leads })),
    [filteredDetail],
  );
  const filteredClosed = useMemo(
    () => filteredDetail.reduce((a, m) => a + m.closed, 0),
    [filteredDetail],
  );

  const convPct   = activeKpis.totalLeads > 0 ? (activeKpis.admissions / activeKpis.totalLeads) * 100 : 0;
  const wiConvPct = activeKpis.walkins    > 0 ? (activeKpis.admissions / activeKpis.walkins)    * 100 : 0;

  return (
    <div className="space-y-8">
      <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-xs ${
        stats.stale || stats.sourceHealth?.supplementary === "unavailable"
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}>
        <span className="font-semibold">
          {stats.stale
            ? "Showing last available figures"
            : stats.dataSource === "hybrid"
              ? "Database and supplementary figures are up to date"
              : "Database figures are up to date; supplementary figures are temporarily unavailable"}
        </span>
        <span className="shrink-0 text-slate-500">
          Updated {new Date(stats.cachedAt || stats.generatedAt).toLocaleString("en-IN")}
        </span>
      </div>
      {/* Inner tab bar */}
      <div className="flex gap-1 flex-wrap">
        {INNER_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition"
            style={{ background: tab === t.id ? primary : "#f1f5f9", color: tab === t.id ? "#fff" : SLATE }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Month filter strip */}
      <MonthRangeFilter
        months={availableMonths}
        from={filterFrom} to={filterTo}
        onFrom={setFilterFrom} onTo={setFilterTo}
        accent={filterAccent}
      />

      {/* ════ OVERVIEW ════ */}
      {tab === "overview" && <>
        <div>
          <div className="text-base font-black mb-3" style={{ color: NAVY }}>
            Lead Funnel · {brandLabel} · AY 2027-28
            {isFiltered && <span className="ml-2 text-xs font-normal text-amber-600">· {filterFrom ?? "start"} → {filterTo ?? "end"}</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard label="Total Leads"     value={fmt(activeKpis.totalLeads)}  sub="All enquiries"    />
            <KpiCard label="Walk-in Booked"  value={fmt(activeKpis.bookings)}    sub={isFiltered ? "Full year" : "Scheduled"}  accent={PURPLE} />
            <KpiCard label="Walk-in Done"    value={fmt(activeKpis.walkins)}     sub="Visited school"   accent={BLUE}   />
            <KpiCard label="Admissions"      value={fmt(activeKpis.admissions)}  sub="Confirmed"        accent={GREEN}  />
            <KpiCard label="Lead → Adm %"    value={pct(convPct)}                sub="Conversion rate"  accent={AMBER}  />
            <KpiCard label="Walk-in → Adm %" value={pct(wiConvPct)}              sub="Visit conversion" accent={AMBER}  />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Open Pipeline" value={fmt(openLeads)}                                   sub={isFiltered ? "Full year" : "Open + Follow-up"} accent={BLUE} />
            <KpiCard label="Closed"        value={fmt(isFiltered ? filteredClosed : closedLeads)}   sub={isFiltered ? "Selected range" : "Not proceeding"} accent={RED}  />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredMonthly.length === 0
            ? <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"><Empty msg="No monthly data yet" /></div>
            : <ChartCard title="Monthly Lead Volume">
                <BarChart data={filteredMonthly.map(m => ({ name: m.month, Leads: m.cnt }))}>
                  <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="#e8edf2" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#7b8b9b" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#91a0af" }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "#f3f6f9" }} contentStyle={{ border: "1px solid #dfe7ef", borderRadius: 10, boxShadow: "0 8px 24px rgba(35,61,89,.08)" }} />
                  <Bar dataKey="Leads" fill={primary} radius={[6,6,2,2]} maxBarSize={46} />
                </BarChart>
              </ChartCard>
          }
          {statusBreakdown.length === 0
            ? <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"><Empty msg="No status data yet" /></div>
            : <ChartCard title="Status Breakdown" responsive={false}>
                <div className="flex h-full min-w-0 items-center gap-2 sm:gap-5">
                  <div className="h-full min-w-0 flex-1">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={statusBreakdown.map(s => ({ name: s.status, value: s.cnt }))}
                          dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={82}
                          paddingAngle={2} stroke="#ffffff" strokeWidth={2}>
                          {statusBreakdown.map((_, i) => <Cell key={i} fill={QUIET_STATUS_COLORS[i % QUIET_STATUS_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ border: "1px solid #dfe7ef", borderRadius: 10, boxShadow: "0 8px 24px rgba(35,61,89,.08)" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-[46%] max-w-[190px] space-y-3">
                    {statusBreakdown.map((item, i) => (
                      <div key={item.status} className="flex min-w-0 items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: QUIET_STATUS_COLORS[i % QUIET_STATUS_COLORS.length] }} />
                        <span className="min-w-0 flex-1 truncate text-slate-500" title={item.status}>
                          {item.status.replaceAll("-", " ")}
                        </span>
                        <span className="font-bold tabular-nums" style={{ color: "#233d59" }}>{fmt(item.cnt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
          }
        </div>
      </>}

      {/* ════ TRENDS ════ */}
      {tab === "trends" && <>
        {monthlyDetail.length === 0 ? <Empty msg="No trend data yet — leads will appear once the CRM sheet is populated" /> : <>
          <ChartCard title={`Leads vs Admissions by Month · ${brandLabel}${isFiltered ? " · filtered" : ""}`} height={320}>
            <ComposedChart data={filteredDetail.map(m => ({ name: m.month, Leads: m.leads, "Walk-ins": m.walkins, Admissions: m.admissions }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip /><Legend />
              <Bar  dataKey="Leads"      fill={primary} radius={[3,3,0,0]} />
              <Bar  dataKey="Walk-ins"   fill={BLUE}    radius={[3,3,0,0]} />
              <Line dataKey="Admissions" stroke={GREEN}  strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ChartCard>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="text-sm font-bold" style={{ color: NAVY }}>Month-by-Month Breakdown · {brandLabel}{isFiltered ? " · filtered" : ""}</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3 text-left">Month</th>
                    <th className="px-4 py-3 text-right">Leads</th>
                    <th className="px-4 py-3 text-right">Walk-ins</th>
                    <th className="px-4 py-3 text-right">Admissions</th>
                    <th className="px-4 py-3 text-right">Closed</th>
                    <th className="px-4 py-3 text-right">Conv %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...filteredDetail].reverse().map(m => {
                    const conv = m.leads > 0 ? (m.admissions / m.leads * 100) : 0;
                    return (
                      <tr key={m.month} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold" style={{ color: NAVY }}>{m.month}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmt(m.leads)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(m.walkins)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: GREEN }}>{fmt(m.admissions)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: RED }}>{fmt(m.closed)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: AMBER }}>{pct(conv)}</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-4 py-3" style={{ color: NAVY }}>{isFiltered ? "Subtotal" : "Total"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{fmt(activeKpis.totalLeads)}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(activeKpis.walkins)}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: GREEN }}>{fmt(activeKpis.admissions)}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: RED }}>{fmt(filteredClosed)}</td>
                    <td className="px-4 py-3 text-right tabular-nums" style={{ color: AMBER }}>{pct(convPct)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>}
      </>}

      {/* ════ ANALYTICS ════ */}
      {tab === "analytics" && <>
        {isFiltered && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-amber-50 border border-amber-200 text-amber-800">
            <span className="font-semibold">⚠ Full-year view —</span> source and programme breakdowns are not yet filtered by month range. Use the Trends tab for month-scoped figures.
          </div>
        )}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-4" style={{ color: NAVY }}>By Source</div>
            {bySource.length === 0 ? <Empty /> : (
              <div className="space-y-2.5">
                {bySource.map(s => (
                  <BarPct key={s.source} label={s.source} value={s.cnt}
                    total={bySource.reduce((a,x) => a+x.cnt, 0)} color={primary} />
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-4" style={{ color: NAVY }}>By Lead Owner</div>
            {byOwner.filter(o => o.leadOwner).length === 0 ? <Empty msg="No owners assigned yet" /> : (
              <div className="space-y-2.5">
                {byOwner.filter(o => o.leadOwner).map(o => (
                  <BarPct key={o.leadOwner!} label={o.leadOwner!} value={o.cnt}
                    total={byOwner.reduce((a,x) => a+x.cnt, 0)} color={AMBER} />
                ))}
              </div>
            )}
          </div>
        </div>

        {byProgram.length > 0 && (
          <ChartCard title="Leads by Programme / Grade" height={Math.max(200, byProgram.length * 32)}>
            <BarChart layout="vertical" data={byProgram.map(p => ({ name: p.program, Leads: p.cnt }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="Leads" fill={BLUE} radius={[0,3,3,0]} />
            </BarChart>
          </ChartCard>
        )}

        {bySource.length > 0 && (
          <ChartCard title="Source Distribution" height={240}>
            <PieChart>
              <Pie data={bySource.map(s => ({ name: s.source, value: s.cnt }))}
                dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {bySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartCard>
        )}
      </>}

      {/* ════ COUNSELLORS ════ */}
      {tab === "counsellors" && <>
        {isFiltered && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-amber-50 border border-amber-200 text-amber-800">
            <span className="font-semibold">⚠ Full-year view —</span> counsellor rows and totals show the full academic year, not the selected month range.
          </div>
        )}
        {byCounsellor.length === 0
          ? <Empty msg="No counsellor data yet — assign Lead Owner in the CRM sheet to see rankings" />
          : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Counsellor</th>
                      <th className="px-4 py-3 text-right">Leads</th>
                      <th className="px-4 py-3 text-right">Walk-ins</th>
                      <th className="px-4 py-3 text-right">Admissions</th>
                      <th className="px-4 py-3 text-right">Open</th>
                      <th className="px-4 py-3 text-right">Closed</th>
                      <th className="px-4 py-3 text-right">Conv %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {byCounsellor.map((c, i) => {
                      const conv = c.leads > 0 ? (c.admissions / c.leads * 100) : 0;
                      return (
                        <tr key={c.leadOwner} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold" style={{ color: NAVY }}>{c.leadOwner}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{fmt(c.leads)}</td>
                          <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(c.walkins)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-bold" style={{ color: GREEN }}>{fmt(c.admissions)}</td>
                          <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(c.open)}</td>
                          <td className="px-4 py-3 text-right tabular-nums" style={{ color: RED }}>{fmt(c.closed)}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: AMBER }}>{pct(conv)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                      <td className="px-4 py-3" colSpan={2} style={{ color: NAVY }}>
                        Total
                        {isFiltered && <span className="ml-1 text-xs font-normal text-slate-400">(full year)</span>}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmt(kpis.totalLeads)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(kpis.walkins)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: GREEN }}>{fmt(kpis.admissions)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(openLeads)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: RED }}>{fmt(closedLeads)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: AMBER }}>{pct(kpis.totalLeads > 0 ? (kpis.admissions / kpis.totalLeads) * 100 : 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )
        }
      </>}
    </div>
  );
}

/* ── Main Dashboard shell ──────────────────────── */
function Dashboard({ onLock }: { onLock: () => void }) {
  const [risStats, setRisStats] = useState<Stats | null>(null);
  const [rpsStats, setRpsStats] = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [brandTab, setBrandTab] = useState<BrandTab>("combined");
  const cancelled = useRef(false);

  const fetchData = useCallback((bust = false) => {
    setLoading(true);
    const qs = bust ? "?brand=RIS&ay=2027-28&bust=1" : "?brand=RIS&ay=2027-28";
    const qsRps = bust ? "?brand=RPS&ay=2027-28&bust=1" : "?brand=RPS&ay=2027-28";
    Promise.all([
      fetch(`/api/walkin/crm-stats${qs}`).then(r => {
        if (r.status === 401) onLock();
        return r.ok ? r.json() : Promise.reject(r.statusText);
      }),
      fetch(`/api/walkin/crm-stats${qsRps}`).then(r => {
        if (r.status === 401) onLock();
        return r.ok ? r.json() : Promise.reject(r.statusText);
      }),
    ]).then(([ris, rps]: [Stats, Stats]) => {
      if (!cancelled.current) { setRisStats(ris); setRpsStats(rps); setError(null); setLastFetch(new Date()); }
    }).catch(e => { if (!cancelled.current) setError(String(e)); })
      .finally(() => { if (!cancelled.current) setLoading(false); });
  }, [onLock]);

  useEffect(() => {
    document.title = "Marketing · AY 2027-28";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchData();
    const iv = setInterval(fetchData, 60_000);
    return () => { cancelled.current = true; clearInterval(iv); };
  }, [fetchData]);

  if (loading && !risStats) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
      <div className="text-slate-500">Loading marketing data…</div>
    </div>
  );
  if (error && !risStats) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f1f5f9" }}>
      <div className="bg-white rounded-xl p-8 max-w-md shadow border border-red-200">
        <div className="text-red-600 font-bold mb-2">Failed to load data</div>
        <div className="text-sm text-slate-600 mb-4">{error}</div>
        <button onClick={() => fetchData()} className="px-4 py-2 rounded-lg text-white font-semibold" style={{ background: NAVY }}>Retry</button>
      </div>
    </div>
  );
  if (!risStats || !rpsStats) return null;

  const combined    = mergeStats(risStats, rpsStats);
  const activeStats = brandTab === "combined" ? combined : brandTab === "RIS" ? risStats : rpsStats;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 54%, #eaf0f6 100%)" }}>
      {/* Header */}
      <div className="py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <img src="/images/rainbow-group-logo-2.jpg" alt="Rainbow Group" style={{ height: 42, width: "auto", borderRadius: 8, flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg text-white leading-tight">Marketing Dashboard · AY 2027-28</div>
            <div className="text-xs text-blue-200 flex items-center gap-2">
              Rainbow Group · Lead source & funnel analytics · CRM Leads Tracker
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-blue-200">
          {lastFetch && `Updated: ${lastFetch.toLocaleTimeString()}`}
          {loading && " · refreshing…"}
          <button onClick={() => fetchData()} className="px-3 py-1.5 rounded bg-amber-400 text-[#091a4f] font-bold hover:bg-amber-300">Refresh</button>
          <button onClick={onLock}
            className="px-3 py-1.5 rounded border border-white/30 text-white/80 hover:bg-white/10">Lock</button>
        </div>
      </div>


      {/* Brand tab bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 py-2">
          {(["combined","RIS","RPS"] as BrandTab[]).map(t => (
            <button key={t} onClick={() => setBrandTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition"
              style={{
                background: brandTab === t ? NAVY : "#f1f5f9",
                color: brandTab === t ? "#fff" : SLATE,
              }}>
              {t === "combined" ? "Combined" : t === "RIS" ? "🔵 RIS" : "🔴 RPS"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <DashboardContent stats={activeStats} brandTab={brandTab} />
        <div className="mt-8 text-center text-xs text-slate-400">
          Live from CRM Leads Tracker · AY 2027-28 · auto-refreshes every 60 seconds
          <a href="/sales-27-28"     className="ml-3 underline" style={{ color: AMBER }}>RIS Sales →</a>
          <a href="/rps-sales-27-28" className="ml-3 underline" style={{ color: AMBER }}>RPS Sales →</a>
          <a href="/overview-27-28"  className="ml-3 underline" style={{ color: AMBER }}>Group Overview →</a>
        </div>
      </div>
    </div>
  );
}

export default function WalkinMarketing2728() {
  const { authed, checking, unlock, lock } = useWalkinDashboardSession("marketing");
  if (checking) return <div className="min-h-screen" style={{ background: NAVY }} />;
  if (!authed) return <PasscodeGate onSuccess={unlock} />;
  return <Dashboard onLock={() => void lock()} />;
}
