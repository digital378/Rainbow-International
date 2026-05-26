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
  conversionRatio: Array<{ counselor: string; enquiries: number; closed: number; open: number; admissions: number; ratio: number }>;
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

  const { kpis, monthlyTargets, walkins, admissions, counselorLeaderboard, conversionRatio } = data;

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

      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* KPIs Row 1 — Core Metrics */}
        <div>
          <SectionTitle sub="Live from Google Sheets · New Admission List is source of truth · auto-refresh every 5 min">Key Metrics</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-4">
            <KpiCard label="Walkins (Total)" value={fmt(kpis.walkinsTotal)} sub={`${kpis.walkinsThisMonth} this month`} testId="kpi-walkins-total" />
            <KpiCard label="Admissions (Confirmed)" value={fmt(kpis.admissionsTotal)} sub={`${kpis.admissionsThisMonth} this month`} accent={GREEN} testId="kpi-admissions-total" />
            <KpiCard label="Conversion %" value={pct(kpis.overallConversion)} sub="Admissions / Walkins" accent={AMBER} testId="kpi-conversion" />
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

        {/* Source-wise Admissions */}
        {admissions.bySource.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="text-sm font-bold" style={{ color: NAVY }}>Admissions by Source · AY 2026-27</div>
                <div className="text-xs text-slate-400 mt-0.5">All {kpis.admissionsTotal} confirmed admissions · New Admission List</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
              {admissions.bySource.map((s) => {
                const pct = Math.round((s.count / kpis.admissionsTotal) * 100);
                return (
                  <div key={s.source} data-testid={`src-adm-${s.source}`}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="font-medium text-slate-700 truncate max-w-[160px]">{s.source}</span>
                      <span className="tabular-nums font-bold ml-2" style={{ color: NAVY }}>{s.count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: NAVY }} />
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
            <ChartCard title="Admissions by Branch" testId="chart-adm-branch">
              <BarChart data={admissions.byBranch.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="branch" tick={{ fontSize: 10 }} width={140} />
                <Tooltip />
                <Bar dataKey="count" fill={CYAN} />
              </BarChart>
            </ChartCard>
          </div>
        </div>

        {/* Counselor Leaderboard */}
        <div>
          <SectionTitle sub="Walkins & status from Walkin Sheet 26-27 · Confirmed admissions from New Admission List">Counselor Leaderboard</SectionTitle>
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
                {counselorLeaderboard.map((c) => (
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
            <SectionTitle sub="Direct from 'CONVERSION RATIO' sheet">Conversion Ratio (Authoritative)</SectionTitle>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-conversion">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4">Counsellor</th>
                    <th className="text-right py-3 px-3">Enquiries</th>
                    <th className="text-right py-3 px-3">Open</th>
                    <th className="text-right py-3 px-3">Closed</th>
                    <th className="text-right py-3 px-3">Admissions</th>
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
                      <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: c.ratio >= 30 ? GREEN : c.ratio >= 15 ? AMBER : RED }}>{pct(c.ratio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Closed Reasons */}
        {walkins.closedReasonSegments && walkins.closedReasonSegments.length > 0 && (() => {
          const totalClosed = walkins.closedReasonSegments.reduce((s, x) => s + x.count, 0);
          const SEGMENT_COLORS: Record<string, string> = {
            "Location / Not in Catchment": "#7c3aed",
            "Finance / Fees": "#dc2626",
            "Joined Another School": "#ea580c",
            "Distance / Too Far": "#0891b2",
            "Not Interested / Unresponsive": "#64748b",
            "Board / Curriculum Preference": "#2563eb",
            "Timing / Schedule": "#d97706",
            "No Reason Recorded": "#94a3b8",
            "Other": "#6b7280",
          };
          return (
            <div>
              <SectionTitle sub={`${totalClosed} closed leads from Walkin Sheet · Reasons curated into segments`}>Why Leads Closed</SectionTitle>
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
                      {walkins.closedReasonSegments.map((s) => {
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
                    {walkins.closedReasonSegments.map((s) => {
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
                  {walkins.closedReasonSegments.find(s => s.segment === "No Reason Recorded") && (
                    <div className="mt-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                      ⚠️ <strong>{walkins.closedReasonSegments.find(s => s.segment === "No Reason Recorded")!.count} leads</strong> closed with no reason recorded — counsellors should fill "REASON OF CLOSING" for accurate analysis.
                    </div>
                  )}
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
