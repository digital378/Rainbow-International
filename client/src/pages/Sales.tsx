import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area,
} from "recharts";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", CYAN = "#0891b2", PURPLE = "#7c3aed", SLATE = "#475569";
const PIE_COLORS = [NAVY, AMBER, GREEN, BLUE, CYAN, PURPLE, RED, SLATE, "#ea580c", "#0ea5e9", "#16a34a", "#a855f7"];

const SALES_PASSCODE = "RIS8";
const SALES_AUTH_KEY = "ris_sales_auth";

/* ── types ─────────────────────────────────────────────── */
type SalesData = {
  generatedAt: string;
  kpis: {
    walkinsTotal: number;
    walkinsThisMonth: number;
    admissionsTotal: number;
    admissionsThisMonth: number;
    provisionalCount: number;
    provisionalRegular: number;
    provisionalIntegrated: number;
    provisionalThisMonth: number;
    rpsRollover: number;
    overallConversion: number;
    openEnquiries: number;
    closedEnquiries: number;
    yearTarget: number;
    yearAchieved: number;
    yearTargetGap: number;
    docsPending: number;
    docsClear: number;
    misDate: string;
    misWalkins: number;
    misAdmissions: number;
    misTargetGap: number;
  };
  monthlyTargets: Array<{ month: string; target: number; achieved: number; gap: number }>;
  walkins: {
    byMonth: Array<{ monthKey: string; month: string; count: number }>;
    bySource: Array<{ source: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    byGrade: Array<{ grade: string; count: number }>;
    recent: Array<{ date: string; name: string; grade: string; counselor: string; source: string; status: string }>;
    closedReasonSegments: Array<{ segment: string; count: number }>;
  };
  admissions: {
    byMonth: Array<{ monthKey: string; month: string; total: number }>;
    byBranch: Array<{ branch: string; count: number }>;
    byGrade: Array<{ grade: string; count: number }>;
    bySource: Array<{ source: string; count: number }>;
    byCounselor: Array<{ counselor: string; count: number }>;
    recent: Array<{ date: string; name: string; grade: string; counselor: string; source: string; branch: string }>;
    recentProvisional: Array<{ date: string; name: string; grade: string; counselor: string; source: string; branch: string; type: string; coaching: string }>;
  };
  counselorLeaderboard: Array<{ counselor: string; walkins: number; admissions: number; provisional: number; closed: number; followup: number; admFromList: number; conversion: number }>;
  conversionRatio: Array<{ counselor: string; enquiries: number; open: number; closed: number; admissions: number; ratio: number; provisional: number; ratioWithProv: number }>;
  liveCheckins: {
    todayTotal: number;
    byRa: Array<{ raName: string; raBranch: string; count: number }>;
    recent: Array<{ id: string; raName: string; raBranch: string; parentName: string; studentName: string; grade: string; submittedAt: string }>;
    last7Days: Array<{ date: string; count: number }>;
  };
  leadTemperature: { hot: number; warm: number; cold: number; provisional: number; open: number };
  heatGrid: Array<{
    counselor: string;
    months: Array<{ monthKey: string; hot: number; warm: number; cold: number; provisional: number; open: number; total: number }>;
    totals: { hot: number; warm: number; cold: number; provisional: number; open: number; total: number };
  }>;
  monthBreakdown: Array<{
    monthKey: string; label: string;
    walkins: number; admissions: number; closed: number; provisional: number; followup: number;
    admBySource: Array<{ source: string; count: number }>;
    closedSegs: Array<{ segment: string; count: number }>;
    counselors: Array<{ counselor: string; walkins: number; admissions: number; provisional: number; closed: number; followup: number; admFromList: number; conversion: number }>;
  }>;
};

/* ── Passcode Gate ─────────────────────────────────────── */
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.title = "Sales Dashboard | Rainbow International School";
    inputRef.current?.focus();
  }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === SALES_PASSCODE) {
      try { sessionStorage.setItem(SALES_AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else {
      setError(true); setCode("");
      setTimeout(() => setError(false), 600);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }} data-testid="passcode-gate">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400" style={{ animation: error ? "shake 0.4s" : undefined }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-base">RIS</div>
          <div>
            <div className="font-black text-lg leading-tight text-[#091a4f]">Sales Dashboard</div>
            <div className="text-xs text-slate-500">Internal · Passcode required</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.4em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          placeholder="••••"
          data-testid="input-passcode"
        />
        {error && <div className="mt-2 text-sm text-red-600 text-center" data-testid="text-passcode-error">Incorrect passcode</div>}
        <button type="submit" className="mt-5 w-full py-3 rounded-lg bg-[#091a4f] text-white font-bold hover:bg-[#0b2168] transition" data-testid="button-unlock">Unlock</button>
      </form>
      <style>{`@keyframes shake {0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

export default function Sales() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(SALES_AUTH_KEY) === "1"; } catch { return false; }
  });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <SalesDashboard />;
}

/* ── helpers ───────────────────────────────────────────── */
const fmt = (n: number) => n.toLocaleString("en-IN");
const pct = (n: number) => `${n.toFixed(n >= 100 ? 0 : 1)}%`;

function KpiCard({ label, value, sub, accent, highlight, testId }: { label: string; value: string | number; sub?: string; accent?: string; highlight?: boolean; testId?: string }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${highlight ? "border-amber-400 border-2" : "border-slate-200"}`} data-testid={testId}>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SLATE }}>{label}</div>
      <div className="text-3xl font-black mt-1" style={{ color: accent || NAVY }}>{value}</div>
      {sub && <div className="text-xs mt-1 text-slate-500">{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-black tracking-tight" style={{ color: NAVY }}>{children}</h2>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, testId }: { title: string; children: React.ReactNode; testId?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200" data-testid={testId}>
      <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>{title}</div>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>{children as any}</ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
function SalesDashboard() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("YTD");
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/sales/live")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d: SalesData) => {
        if (!cancelled.current) { setData(d); setError(null); setLastFetch(new Date()); }
      })
      .catch((e) => { if (!cancelled.current) setError(String(e)); })
      .finally(() => { if (!cancelled.current) setLoading(false); });
  }, []);

  useEffect(() => {
    document.title = "Sales Dashboard | Rainbow International School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchData();
    const iv = setInterval(fetchData, 5 * 60 * 1000);
    return () => { cancelled.current = true; clearInterval(iv); };
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
        <div className="text-slate-500">Loading sales data…</div>
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f1f5f9" }}>
        <div className="bg-white rounded-xl p-8 max-w-md shadow border border-red-200">
          <div className="text-red-600 font-bold mb-2">Failed to load sales data</div>
          <div className="text-sm text-slate-600 mb-4">{error}</div>
          <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-[#091a4f] text-white font-semibold">Retry</button>
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { kpis, monthlyTargets, walkins, admissions, counselorLeaderboard, conversionRatio, monthBreakdown, leadTemperature, heatGrid } = data;

  // Active month data (filtered or YTD)
  const activeMonth = selectedMonth !== "YTD" ? monthBreakdown.find(m => m.monthKey === selectedMonth) : null;
  const activeWalkins    = activeMonth ? activeMonth.walkins    : kpis.walkinsTotal;
  const activeAdmissions = activeMonth ? (admissions.byMonth.find(m => m.monthKey === selectedMonth)?.total ?? 0) : kpis.admissionsTotal;
  const activeClosed     = activeMonth ? activeMonth.closed     : (walkins.byStatus.find(s => s.status === "CLOSED")?.count || 0);
  const activeFollowup   = activeMonth ? activeMonth.followup   : (walkins.byStatus.find(s => s.status.includes("FOLLOW"))?.count || 0);
  const activeConversion = activeWalkins ? Math.round((activeAdmissions / activeWalkins) * 10000) / 100 : 0;
  const activeLeaderboard  = activeMonth ? activeMonth.counselors   : counselorLeaderboard;
  const activeClosedSegs   = activeMonth ? activeMonth.closedSegs   : walkins.closedReasonSegments;
  const activeAdmBySource  = activeMonth ? activeMonth.admBySource  : admissions.bySource;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Top bar */}
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-sm">RIS</div>
          <div>
            <div className="font-black text-lg leading-tight tracking-tight">Sales Performance Dashboard</div>
            <div className="text-xs text-blue-200">Walkin Enquiries 2026-27 · Internal Use Only</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="text-blue-200">
            {lastFetch ? `Updated: ${lastFetch.toLocaleTimeString()}` : ""}
            {loading && " · refreshing…"}
          </div>
          <button onClick={fetchData} className="px-3 py-1.5 rounded bg-amber-400 text-[#091a4f] font-bold hover:bg-amber-300" data-testid="button-refresh">Refresh</button>
          <button onClick={() => { sessionStorage.removeItem(SALES_AUTH_KEY); window.location.reload(); }} className="px-3 py-1.5 rounded border border-white/30 text-white/80 hover:bg-white/10" data-testid="button-lock">Lock</button>
        </div>
      </div>

      {/* Month / YTD Filter Pill Bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 shadow-sm" style={{ background: "#fff" }}>
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-1">Period:</span>
          {["YTD", ...monthBreakdown.map(m => m.monthKey)].map((mk) => {
            const label = mk === "YTD" ? "YTD (All)" : (monthBreakdown.find(m => m.monthKey === mk)?.label || mk);
            const active = selectedMonth === mk;
            return (
              <button
                key={mk}
                onClick={() => setSelectedMonth(mk)}
                data-testid={`filter-month-${mk}`}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: active ? NAVY : "#f1f5f9",
                  color: active ? "#fff" : "#475569",
                  border: active ? `2px solid ${NAVY}` : "2px solid transparent",
                }}
              >{label}</button>
            );
          })}
          {selectedMonth !== "YTD" && (
            <span className="ml-2 text-xs text-amber-600 font-medium">
              · Showing {monthBreakdown.find(m => m.monthKey === selectedMonth)?.label} only
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* KPIs Row 1 — Core Metrics */}
        <div>
          <SectionTitle sub={selectedMonth === "YTD" ? "Live from Google Sheets · New Admission List is source of truth · auto-refresh every 5 min" : `Filtered: ${monthBreakdown.find(m=>m.monthKey===selectedMonth)?.label} · Walkin Sheet data`}>Key Metrics</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-4">
            <KpiCard label="Walkins" value={fmt(activeWalkins)} sub={selectedMonth === "YTD" ? `${kpis.walkinsThisMonth} this month` : "This month"} testId="kpi-walkins-total" />
            <KpiCard label="Admissions (Confirmed)" value={fmt(activeAdmissions)} sub={selectedMonth === "YTD" ? `${kpis.admissionsThisMonth} this month` : "From New Admission List"} accent={GREEN} testId="kpi-admissions-total" />
            <KpiCard label="Conversion %" value={pct(activeConversion)} sub="Admissions / Walkins" accent={AMBER} testId="kpi-conversion" />
            <KpiCard label="Provisional (Pending)" value={fmt(kpis.provisionalCount)} sub={`${kpis.provisionalRegular} Regular · ${kpis.provisionalIntegrated} Integrated`} accent={PURPLE} testId="kpi-provisional" />
          </div>

          {/* KPIs Row 2 — Target & Ops */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <KpiCard label="Year Target" value={fmt(kpis.yearTarget)} sub="Full AY 2026-27" testId="kpi-year-target" />
            <KpiCard label="Year Achieved" value={fmt(kpis.yearAchieved)} sub="From Target Sheet" accent={GREEN} testId="kpi-year-achieved" />
            <KpiCard label="Target Gap" value={fmt(kpis.yearTargetGap)} sub="Remaining to hit target" accent={RED} highlight testId="kpi-target-gap" />
            <KpiCard label="RPS Rollover" value={fmt(kpis.rpsRollover)} sub="RPS preschool → RIS" accent={CYAN} testId="kpi-rps-rollover" />
            <KpiCard label="Open Enquiries" value={fmt(kpis.openEnquiries)} sub="Open + Follow-up" accent={BLUE} testId="kpi-open" />
            <KpiCard label="Docs Pending" value={fmt(kpis.docsPending)} sub={`${kpis.docsClear} clear · ${kpis.docsPending} outstanding`} accent={AMBER} testId="kpi-docs-pending" />
          </div>
        </div>

        {/* Today's Walk-ins — Live QR Check-in Widget */}
        {data.liveCheckins && (() => {
          const lc = data.liveCheckins;
          const todayStr = new Date().toISOString().slice(0, 10);
          // Build full 7-day array (fill missing days with 0)
          const last7: Array<{ date: string; count: number; isToday: boolean }> = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            const found = lc.last7Days.find(r => r.date === key);
            const label = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
            last7.push({ date: label, count: found?.count || 0, isToday: key === todayStr });
          }
          return (
            <div>
              <SectionTitle sub="Live QR check-ins via walk-in form · DB only · resets at midnight">Today's Walk-ins (QR Check-in)</SectionTitle>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total KPI */}
                <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-amber-400 flex flex-col gap-1" data-testid="kpi-live-checkins-today">
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SLATE }}>Today's QR Check-ins</div>
                  <div className="text-4xl font-black" style={{ color: NAVY }}>{lc.todayTotal}</div>
                  <div className="text-xs text-slate-400">Scans since midnight · DB</div>
                  <a href="/admin/ras" className="mt-2 text-xs font-semibold underline" style={{ color: AMBER }}>Manage RA Profiles →</a>
                </div>

                {/* Per-RA breakdown */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>By Counsellor (Today)</div>
                  {lc.byRa.length === 0 ? (
                    <div className="text-xs text-slate-400">No check-ins today yet</div>
                  ) : (
                    <div className="space-y-2">
                      {lc.byRa.map(r => (
                        <div key={r.raName} className="flex items-center gap-2" data-testid={`live-ra-${r.raName}`}>
                          <div className="flex-1 text-xs font-medium text-slate-700 truncate">{r.raName}</div>
                          <div className="text-xs text-slate-400">{r.raBranch}</div>
                          <div className="text-sm font-black tabular-nums" style={{ color: NAVY }}>{r.count}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7-day sparkline */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200" data-testid="chart-live-checkins-7day">
                  <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Last 7 Days</div>
                  <div style={{ width: "100%", height: 120 }}>
                    <ResponsiveContainer>
                      <BarChart data={last7} barSize={18}>
                        <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} allowDecimals={false} width={20} />
                        <Tooltip formatter={(v: number) => [v, "Check-ins"]} />
                        <Bar dataKey="count" name="Check-ins" radius={[3, 3, 0, 0]}>
                          {last7.map((entry, idx) => (
                            <Cell key={idx} fill={entry.isToday ? AMBER : NAVY} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Amber = today · Navy = past days</div>
                </div>

                {/* Recent submissions */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Recent Today</div>
                  {lc.recent.length === 0 ? (
                    <div className="text-xs text-slate-400">No check-ins today yet</div>
                  ) : (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {lc.recent.slice(0, 8).map(r => (
                        <div key={r.id} className="text-xs border-b border-slate-50 pb-1.5">
                          <div className="font-semibold text-slate-700">{r.parentName} <span className="text-slate-400 font-normal">for {r.studentName}</span></div>
                          <div className="text-slate-400">{r.grade} · {r.raName} · {new Date(r.submittedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Source-wise Admissions */}
        {activeAdmBySource.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-sm font-bold" style={{ color: NAVY }}>
                  Admissions by Source{selectedMonth === "YTD" ? " · AY 2026-27" : ` · ${monthBreakdown.find(m=>m.monthKey===selectedMonth)?.label}`}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedMonth === "YTD" ? `All ${kpis.admissionsTotal} confirmed admissions · New Admission List` : `${activeAdmissions} admissions this month · New Admission List`}
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {activeAdmBySource.map((s) => {
                const total = activeAdmBySource.reduce((sum, x) => sum + x.count, 0);
                const pctVal = total > 0 ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.source} data-testid={`src-adm-${s.source}`}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium text-slate-700 truncate max-w-[160px]">{s.source}</span>
                      <span className="tabular-nums font-bold ml-2" style={{ color: NAVY }}>{s.count} <span className="text-slate-400 font-normal">({pctVal}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pctVal}%`, background: NAVY }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Target vs Actual */}
        <div>
          <SectionTitle sub="Monthly admissions target vs achieved · From RIS Target Sheet">Target vs Actual — AY 2026-27</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard title="Monthly: Target vs Achieved" testId="chart-target-vs-actual">
              <ComposedChart data={monthlyTargets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="target" fill="#e2e8f0" name="Target" />
                <Bar dataKey="achieved" fill={GREEN} name="Achieved" />
                <Line type="monotone" dataKey="target" stroke={AMBER} strokeWidth={2} dot={false} name="Target Line" />
              </ComposedChart>
            </ChartCard>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="text-sm font-bold mb-4" style={{ color: NAVY }}>Month-by-Month Breakdown</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" data-testid="table-monthly-target">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase">
                      <th className="text-left pb-2">Month</th>
                      <th className="text-right pb-2">Target</th>
                      <th className="text-right pb-2">Achieved</th>
                      <th className="text-right pb-2">Gap</th>
                      <th className="text-right pb-2">Hit?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyTargets.filter(m => m.target > 0).map((m) => (
                      <tr key={m.month} className="border-t border-slate-100">
                        <td className="py-1.5 font-medium">{m.month}</td>
                        <td className="text-right py-1.5 tabular-nums">{m.target}</td>
                        <td className="text-right py-1.5 tabular-nums font-bold" style={{ color: m.achieved > 0 ? GREEN : SLATE }}>{m.achieved}</td>
                        <td className="text-right py-1.5 tabular-nums" style={{ color: m.gap > 0 ? RED : GREEN }}>{m.gap > 0 ? `-${m.gap}` : "✓"}</td>
                        <td className="text-right py-1.5">
                          {m.achieved > 0 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: m.achieved >= m.target ? "#dcfce7" : "#fef3c7", color: m.achieved >= m.target ? GREEN : AMBER }}>
                              {m.achieved >= m.target ? "✓ Met" : `${Math.round((m.achieved/m.target)*100)}%`}
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 font-bold">
                      <td className="pt-2">Total</td>
                      <td className="text-right pt-2 tabular-nums">{kpis.yearTarget}</td>
                      <td className="text-right pt-2 tabular-nums" style={{ color: GREEN }}>{kpis.yearAchieved}</td>
                      <td className="text-right pt-2 tabular-nums" style={{ color: RED }}>-{kpis.yearTargetGap}</td>
                      <td className="text-right pt-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "#fef3c7", color: AMBER }}>
                          {Math.round((kpis.yearAchieved / kpis.yearTarget) * 100)}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div>
          <SectionTitle>Monthly Trends</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4">
            <ChartCard title="Walkins by Month" testId="chart-walkins-month">
              <LineChart data={walkins.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={NAVY} strokeWidth={2.5} dot={{ r: 4 }} name="Walkins" />
              </LineChart>
            </ChartCard>
            <ChartCard title="Admissions by Month (Confirmed)" testId="chart-admissions-month">
              <ComposedChart data={admissions.byMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" fill="#dcfce7" stroke={GREEN} strokeWidth={2} name="Admissions" />
              </ComposedChart>
            </ChartCard>
          </div>
        </div>

        {/* Walkin Breakdowns */}
        <div>
          <SectionTitle>Walkin Breakdowns</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <ChartCard title="Walkins by Source" testId="chart-by-source">
              <PieChart>
                <Pie data={walkins.bySource.slice(0, 8)} dataKey="count" nameKey="source" outerRadius={90} label={(p: any) => `${p.source} (${p.count})`}>
                  {walkins.bySource.slice(0, 8).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartCard>
            <ChartCard title="Walkins by Status" testId="chart-by-status">
              <BarChart data={walkins.byStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="status" tick={{ fontSize: 10 }} width={140} />
                <Tooltip />
                <Bar dataKey="count" fill={GREEN} />
              </BarChart>
            </ChartCard>
            <ChartCard title="Top Grades (Walkins)" testId="chart-by-grade">
              <BarChart data={walkins.byGrade.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="grade" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill={BLUE} />
              </BarChart>
            </ChartCard>
          </div>
        </div>

        {/* Admission Breakdowns */}
        <div>
          <SectionTitle sub="Source: New Admission List (287 confirmed admissions)">Admission Breakdowns</SectionTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <ChartCard title="Admissions by Source" testId="chart-adm-source">
              <BarChart data={admissions.bySource.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 10 }} width={140} />
                <Tooltip />
                <Bar dataKey="count" fill={NAVY} />
              </BarChart>
            </ChartCard>
            <ChartCard title="Admissions by Grade" testId="chart-adm-grade">
              <BarChart data={admissions.byGrade.slice(0, 12)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="grade" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill={AMBER} />
              </BarChart>
            </ChartCard>
            <ChartCard title="Admissions by RA" testId="chart-adm-ra">
              <BarChart data={admissions.byCounselor.slice(0, 15)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="counselor" tick={{ fontSize: 10 }} width={140} />
                <Tooltip />
                <Bar dataKey="count" fill={CYAN} />
              </BarChart>
            </ChartCard>
          </div>
        </div>

        {/* Counselor Leaderboard */}
        <div>
          <SectionTitle sub={selectedMonth === "YTD" ? "Walkins & status from Walkin Sheet 26-27 · Confirmed admissions from New Admission List" : `Filtered: ${monthBreakdown.find(m=>m.monthKey===selectedMonth)?.label} · Walkin Sheet`}>Counselor Leaderboard</SectionTitle>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-counselor">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                <tr>
                  <th className="text-left py-3 px-4">Counsellor</th>
                  <th className="text-right py-3 px-3">Walkins</th>
                  <th className="text-right py-3 px-3">Adm (Confirmed)</th>
                  <th className="text-right py-3 px-3">Provisional</th>
                  <th className="text-right py-3 px-3">Closed</th>
                  <th className="text-right py-3 px-3">Follow-up</th>
                  <th className="text-right py-3 px-3">Conversion %</th>
                </tr>
              </thead>
              <tbody>
                {activeLeaderboard.map((c) => (
                  <tr key={c.counselor} className="border-t border-slate-100 hover:bg-slate-50" data-testid={`row-counselor-${c.counselor}`}>
                    <td className="py-2.5 px-4 font-semibold">{c.counselor}</td>
                    <td className="text-right py-2.5 px-3 tabular-nums">{c.walkins}</td>
                    <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{c.admissions}</td>
                    <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: PURPLE }}>{c.provisional}</td>
                    <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: RED }}>{c.closed}</td>
                    <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: BLUE }}>{c.followup}</td>
                    <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: c.conversion >= 30 ? GREEN : c.conversion >= 15 ? AMBER : RED }}>{pct(c.conversion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Authoritative Conversion Ratio */}
        {conversionRatio.length > 0 && (
          <div>
            <SectionTitle sub="SUMMARY · Nursery to Grade 12 consolidated · sorted by admissions">Conversion Ratio (Authoritative)</SectionTitle>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-conversion">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4">Counsellor</th>
                    <th className="text-right py-3 px-3">Enquiries</th>
                    <th className="text-right py-3 px-3">Open</th>
                    <th className="text-right py-3 px-3">Closed</th>
                    <th className="text-right py-3 px-3">Admissions</th>
                    <th className="text-right py-3 px-3">Provisional</th>
                    <th className="text-right py-3 px-3">Ratio %</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionRatio.map((c, i) => (
                    <tr key={`${c.counselor}-${i}`} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold">{c.counselor}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums">{c.enquiries}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: BLUE }}>{c.open}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: RED }}>{c.closed}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{c.admissions}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: AMBER }}>{c.provisional || "—"}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: c.ratio >= 30 ? GREEN : c.ratio >= 15 ? AMBER : RED }}>{pct(c.ratio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Closed Reasons */}
        {activeClosedSegs && activeClosedSegs.length > 0 && (() => {
          const totalClosed = activeClosedSegs.reduce((s, x) => s + x.count, 0);
          const SEGMENT_COLORS: Record<string, string> = {
            "No Reason Recorded": "#94a3b8",
            "Location / Not in Catchment": "#7c3aed",
            "Finance / Fees": "#dc2626",
            "Joined Another School": "#ea580c",
            "Distance / Too Far": "#0891b2",
            "Not Interested / Unresponsive": "#64748b",
            "Board / Curriculum Preference": "#2563eb",
            "Timing / Schedule": "#d97706",
            "Other": "#6b7280",
          };
          const periodLabel = selectedMonth === "YTD" ? "all year" : monthBreakdown.find(m => m.monthKey === selectedMonth)?.label;
          return (
            <div>
              <SectionTitle sub={`${totalClosed} closed leads · ${periodLabel} · Reasons curated into segments`}>Why Leads Closed</SectionTitle>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm" data-testid="table-closed-reasons">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="text-left py-3 px-4">Reason Segment</th>
                        <th className="text-right py-3 px-4">Count</th>
                        <th className="text-right py-3 px-4">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeClosedSegs.map((s) => {
                        const pctVal = Math.round((s.count / totalClosed) * 100);
                        const color = SEGMENT_COLORS[s.segment] || "#6b7280";
                        return (
                          <tr key={s.segment} className="border-t border-slate-100 hover:bg-slate-50">
                            <td className="py-2.5 px-4">
                              <span className="inline-block w-2 h-2 rounded-full mr-2 flex-shrink-0 align-middle" style={{ background: color }} />
                              <span className="font-medium text-slate-700">{s.segment}</span>
                            </td>
                            <td className="text-right py-2.5 px-4 tabular-nums font-bold" style={{ color }}>{s.count}</td>
                            <td className="text-right py-2.5 px-4 tabular-nums text-slate-500">{pctVal}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 font-bold bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-600">Total Closed</td>
                        <td className="text-right py-2.5 px-4 tabular-nums">{totalClosed}</td>
                        <td className="text-right py-2.5 px-4 text-slate-400">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="text-sm font-bold mb-4" style={{ color: NAVY }}>Segment Breakdown</div>
                  <div className="space-y-3">
                    {activeClosedSegs.map((s) => {
                      const pctVal = Math.round((s.count / totalClosed) * 100);
                      const color = SEGMENT_COLORS[s.segment] || "#6b7280";
                      return (
                        <div key={s.segment}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-600 font-medium truncate max-w-[200px]">{s.segment}</span>
                            <span className="tabular-nums font-bold ml-2" style={{ color }}>{s.count} <span className="text-slate-400 font-normal">({pctVal}%)</span></span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pctVal}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Lead Temperature Heatmap */}
        {heatGrid.length > 0 && (() => {
          // All month keys across all counselors
          const allMks = Array.from(new Set(heatGrid.flatMap(r => r.months.map(m => m.monthKey)))).sort();
          const mLabel = (mk: string) => monthBreakdown.find(m => m.monthKey === mk)?.label || mk;
          // Max cell total for intensity scaling
          const maxTotal = Math.max(...heatGrid.flatMap(r => r.months.map(m => m.total)), 1);
          // Cell background: heat intensity based on hot+provisional ratio; cold biases blue
          const cellBg = (cell: { hot:number; warm:number; cold:number; provisional:number; open:number; total:number } | undefined) => {
            if (!cell || cell.total === 0) return { bg: "#f8fafc", text: "#cbd5e1" };
            const hotRatio = (cell.hot + cell.provisional * 0.7) / cell.total;
            const coldRatio = cell.cold / cell.total;
            const intensity = Math.min(cell.total / maxTotal, 1);
            if (hotRatio >= 0.5) return { bg: `rgba(220,38,38,${0.15 + intensity * 0.55})`, text: "#7f1d1d" };
            if (hotRatio >= 0.25) return { bg: `rgba(245,158,11,${0.2 + intensity * 0.45})`, text: "#78350f" };
            if (coldRatio >= 0.5) return { bg: `rgba(37,99,235,${0.12 + intensity * 0.35})`, text: "#1e3a8a" };
            return { bg: `rgba(16,185,129,${0.12 + intensity * 0.35})`, text: "#064e3b" };
          };
          const total = leadTemperature.hot + leadTemperature.warm + leadTemperature.cold + leadTemperature.provisional + leadTemperature.open;
          return (
            <div>
              <SectionTitle sub="Lead temperature by counselor × month · Hot=Admission, Warm=Follow-up, Cold=Closed, Open=New">Lead Temperature Heatmap</SectionTitle>
              {/* Temperature summary pills */}
              <div className="flex flex-wrap gap-3 mb-4">
                {[
                  { label: "🔴 Hot (Admitted)", count: leadTemperature.hot, color: "#dc2626", bg: "#fef2f2" },
                  { label: "🟣 Provisional", count: leadTemperature.provisional, color: "#7c3aed", bg: "#faf5ff" },
                  { label: "🟡 Warm (Follow-up)", count: leadTemperature.warm, color: "#d97706", bg: "#fffbeb" },
                  { label: "🟢 Open (New)", count: leadTemperature.open, color: "#059669", bg: "#f0fdf4" },
                  { label: "🔵 Cold (Closed)", count: leadTemperature.cold, color: "#2563eb", bg: "#eff6ff" },
                ].map(t => (
                  <div key={t.label} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold" style={{ background: t.bg, borderColor: t.color + "33", color: t.color }}>
                    <span>{t.label}</span>
                    <span className="font-black">{t.count}</span>
                    <span className="font-normal text-xs opacity-70">({total > 0 ? Math.round(t.count/total*100) : 0}%)</span>
                  </div>
                ))}
              </div>
              {/* Heatmap grid */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="text-xs border-collapse w-full" data-testid="table-heatmap">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-slate-50 z-10 py-2 px-3 text-left text-slate-500 font-semibold border-b border-r border-slate-200 whitespace-nowrap">Counsellor</th>
                      {allMks.map(mk => (
                        <th key={mk} className="py-2 px-2 text-center text-slate-500 font-semibold border-b border-slate-200 whitespace-nowrap min-w-[64px]">{mLabel(mk)}</th>
                      ))}
                      <th className="py-2 px-2 text-center text-slate-500 font-semibold border-b border-l border-slate-200 whitespace-nowrap">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatGrid.map((row) => {
                      const cellMap = new Map(row.months.map(m => [m.monthKey, m]));
                      return (
                        <tr key={row.counselor} className="border-t border-slate-100">
                          <td className="sticky left-0 bg-white z-10 py-2 px-3 font-semibold text-slate-700 border-r border-slate-100 whitespace-nowrap">{row.counselor}</td>
                          {allMks.map(mk => {
                            const cell = cellMap.get(mk);
                            const { bg, text } = cellBg(cell);
                            return (
                              <td key={mk} className="py-1 px-1 text-center" style={{ background: bg }}>
                                {cell && cell.total > 0 ? (
                                  <div className="font-bold" style={{ color: text }}>{cell.total}</div>
                                ) : (
                                  <div className="text-slate-200">—</div>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-2 px-3 text-center font-black border-l border-slate-100" style={{ color: NAVY }}>{row.totals.total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                <span>🔴 Red cell = high admission rate</span>
                <span>🟡 Amber = active follow-ups</span>
                <span>🔵 Blue = many closed/lost leads</span>
                <span>🟢 Green = mostly new open leads</span>
                <span>Number = total walkins in that cell</span>
              </div>

              {/* SOP Commentary Panel */}
              <div className="mt-6 grid md:grid-cols-2 gap-4">
                {/* SOP Definitions table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100" style={{ background: NAVY }}>
                    <div className="text-sm font-black text-white tracking-tight">Lead Temperature SOP — AY 2026-27</div>
                    <div className="text-xs text-blue-200 mt-0.5">CRM status definitions & immediate actions</div>
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase">
                      <tr>
                        <th className="text-left py-2 px-3">Temperature</th>
                        <th className="text-right py-2 px-3">Count</th>
                        <th className="text-right py-2 px-3">Share</th>
                        <th className="text-left py-2 px-3">Immediate Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          icon: "🔴", label: "Hot (Admitted)", count: leadTemperature.hot, color: "#dc2626", bg: "#fef2f2",
                          def: "Application, interview & full fee received. CRM = Admission Done.",
                          action: "Issue welcome pack → add to orientation list within 48 h.",
                        },
                        {
                          icon: "🟣", label: "Provisional", count: leadTemperature.provisional, color: "#7c3aed", bg: "#faf5ff",
                          def: "Application & interview cleared; fee / docs pending ≤ 7 days. CRM = Application Initiated.",
                          action: "Daily reminder SMS + counsellor call; escalate to Branch Head on day 5.",
                        },
                        {
                          icon: "🟡", label: "Warm (Follow-up)", count: leadTemperature.warm, color: "#d97706", bg: "#fffbeb",
                          def: "At least one counselling/tour complete, parent undecided. Next follow-up booked within 24 h.",
                          action: "Personalised value email; second follow-up call ≤ 72 h; invite to next open-house.",
                        },
                        {
                          icon: "🟢", label: "Open (New)", count: leadTemperature.open, color: "#059669", bg: "#f0fdf4",
                          def: "New enquiry not yet contacted. CRM = New.",
                          action: "Call within 30 min, WhatsApp intro, book campus visit.",
                        },
                        {
                          icon: "🔵", label: "Cold (Closed)", count: leadTemperature.cold, color: "#2563eb", bg: "#eff6ff",
                          def: "Lead lost / not interested / duplicate after ≥ 3 attempts. CRM = Closed.",
                          action: "Tag lost-reason; add to quarterly re-nurture campaign.",
                        },
                      ].map(t => (
                        <tr key={t.label} className="border-t border-slate-100 align-top" style={{ background: t.bg + "55" }}>
                          <td className="py-2.5 px-3">
                            <div className="font-bold" style={{ color: t.color }}>{t.icon} {t.label}</div>
                            <div className="text-slate-500 mt-0.5 leading-relaxed">{t.def}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-black tabular-nums" style={{ color: t.color }}>{t.count}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">{total > 0 ? Math.round(t.count / total * 100) : 0}%</td>
                          <td className="py-2.5 px-3 text-slate-600 leading-relaxed">{t.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Funnel health + counselor highlights */}
                <div className="flex flex-col gap-4">
                  {/* Funnel Health */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="text-sm font-black mb-3" style={{ color: NAVY }}>Funnel Health Notes</div>
                    <ol className="space-y-3 text-xs text-slate-700 list-none">
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[10px]" style={{ background: RED }}>1</span>
                        <span>
                          <strong>Hot : Warm ratio is {leadTemperature.warm > 0 ? Math.round(leadTemperature.hot / leadTemperature.warm) : "∞"} : 1</strong> — strong closing but limited middle-funnel stock; replenish with remarketing &amp; counsellor callbacks.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[10px]" style={{ background: BLUE }}>2</span>
                        <span>
                          <strong>Cold leads = {total > 0 ? Math.round(leadTemperature.cold / total * 100) : 0}% of YTD traffic</strong> — activate lost-reason analysis and target the top two reversible reasons with fee-breakdown explainer mails.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-[10px]" style={{ background: AMBER }}>3</span>
                        <span>
                          <strong>SLA targets to maintain:</strong> New lead contact ≤ 30 min · First follow-up on Warm leads ≤ 24 h; second ≤ 72 h · Provisional leads closed within 7 days.
                        </span>
                      </li>
                    </ol>
                  </div>
                  {/* Counselor Highlights */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="text-sm font-black mb-3" style={{ color: NAVY }}>Counsellor Highlights</div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {heatGrid.slice(0, 4).map((row, i) => {
                        const hotPct = row.totals.total > 0 ? Math.round(row.totals.hot / row.totals.total * 100) : 0;
                        const coldPct = row.totals.total > 0 ? Math.round(row.totals.cold / row.totals.total * 100) : 0;
                        const badge = hotPct >= 40 ? { label: "Strong Closer", color: RED, bg: "#fef2f2" }
                          : coldPct >= 60 ? { label: "Review Needed", color: BLUE, bg: "#eff6ff" }
                          : { label: "Active", color: "#059669", bg: "#f0fdf4" };
                        return (
                          <li key={row.counselor} className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800">{i + 1}. {row.counselor}</span>
                            <span className="flex items-center gap-2 text-slate-500">
                              <span className="tabular-nums">{row.totals.total} walkins</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                      Badge logic: Strong Closer = ≥40% hot leads · Review Needed = ≥60% cold · Active otherwise
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Recent Tables */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <SectionTitle sub="Latest 25 confirmed admissions">Recent Admissions</SectionTitle>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-xs" data-testid="table-recent-admissions">
                <thead className="bg-slate-50 uppercase text-slate-600">
                  <tr>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Grade</th>
                    <th className="text-left py-2 px-3">Counsellor</th>
                    <th className="text-left py-2 px-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.recent.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-2 px-3 tabular-nums whitespace-nowrap">{r.date}</td>
                      <td className="py-2 px-3 font-medium">{r.name}</td>
                      <td className="py-2 px-3">{r.grade}</td>
                      <td className="py-2 px-3">{r.counselor}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">{r.source}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <SectionTitle sub="Latest 25 walkin enquiries">Recent Walkins</SectionTitle>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-xs" data-testid="table-recent-walkins">
                <thead className="bg-slate-50 uppercase text-slate-600">
                  <tr>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Grade</th>
                    <th className="text-left py-2 px-3">Counsellor</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {walkins.recent.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-2 px-3 tabular-nums whitespace-nowrap">{r.date}</td>
                      <td className="py-2 px-3 font-medium">{r.name}</td>
                      <td className="py-2 px-3">{r.grade}</td>
                      <td className="py-2 px-3">{r.counselor}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{
                          background: r.status.includes("ADMIS") ? "#dcfce7" : r.status.includes("CLOSED") ? "#fee2e2" : r.status.includes("PROV") ? "#ede9fe" : "#f1f5f9",
                          color: r.status.includes("ADMIS") ? GREEN : r.status.includes("CLOSED") ? RED : r.status.includes("PROV") ? PURPLE : SLATE,
                        }}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Provisional pending */}
        {admissions.recentProvisional.length > 0 && (
          <div>
            <SectionTitle sub={`${kpis.provisionalRegular} Regular · ${kpis.provisionalIntegrated} Integrated · not yet confirmed in New Admission List`}>Provisional (Pending Confirmation)</SectionTitle>
            <div className="bg-white rounded-xl shadow-sm border border-purple-200 overflow-x-auto">
              <table className="w-full text-xs" data-testid="table-provisional">
                <thead className="bg-purple-50 uppercase text-purple-700">
                  <tr>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-left py-2 px-3">Name</th>
                    <th className="text-left py-2 px-3">Grade</th>
                    <th className="text-left py-2 px-3">Counsellor</th>
                    <th className="text-left py-2 px-3">Source</th>
                    <th className="text-left py-2 px-3">Coaching</th>
                  </tr>
                </thead>
                <tbody>
                  {admissions.recentProvisional.map((r, i) => (
                    <tr key={i} className="border-t border-purple-100">
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                          background: r.type === "Integrated" ? "#ede9fe" : "#f3e8ff",
                          color: r.type === "Integrated" ? PURPLE : "#7e22ce",
                        }}>{r.type}</span>
                      </td>
                      <td className="py-2 px-3 tabular-nums whitespace-nowrap">{r.date}</td>
                      <td className="py-2 px-3 font-medium">{r.name}</td>
                      <td className="py-2 px-3">{r.grade}</td>
                      <td className="py-2 px-3">{r.counselor}</td>
                      <td className="py-2 px-3">{r.source}</td>
                      <td className="py-2 px-3">{r.coaching || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 text-center pb-4">
          Data sourced from Google Sheets · Generated {new Date(data.generatedAt).toLocaleString()} · Internal use only
        </div>
      </div>
    </div>
  );
}
