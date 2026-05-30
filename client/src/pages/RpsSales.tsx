import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area,
} from "recharts";

const NAVY  = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE  = "#2563eb", CYAN  = "#0891b2", PURPLE = "#7c3aed", SLATE = "#475569";
const PIE_COLORS = [NAVY, AMBER, GREEN, BLUE, CYAN, PURPLE, RED, SLATE, "#ea580c", "#0ea5e9", "#16a34a", "#a855f7"];

const RPS_PASSCODE = "RPS8";
const RPS_AUTH_KEY = "rps_sales_auth";

type RpsData = {
  generatedAt: string;
  kpis: {
    totalEnquiries: number; totalAdmissions: number; totalAdmRIS: number;
    openEnquiries: number; closedTotal: number; inProcess: number;
    futureProspect: number; overallConversion: number;
    thisMonthEnquiries: number; thisMonthAdm: number;
  };
  byMonth: Array<{ monthKey: string; label: string; enquiries: number; admissions: number }>;
  byBranch: Array<{ branch: string; enquiries: number; admissions: number; open: number; closed: number; conversion: number }>;
  bySource: Array<{ source: string; enquiries: number; admissions: number }>;
  byGrade: Array<{ grade: string; count: number }>;
  counselorLeaderboard: Array<{ counselor: string; admDone: number; admRIS: number; closed: number; open: number; inProcess: number; futureProspect: number; total: number; conversion: number }>;
  closedReasons: Array<{ reason: string; count: number }>;
  recentEnquiries: Array<{ date: string; name: string; grade: string; branch: string; counselor: string; source: string; status: string }>;
  dmPipeline: {
    admitted: number; open: number; closed: number;
    byBranch: Array<{ branch: string; admitted: number; open: number; closed: number }>;
    byConfidence: Array<{ confidence: string; count: number }>;
  };
  misHistory: Array<{ date: string; walkins: number; admissions: number; gap: number }>;
  leadTime: { median: number; p90: number; histogram: Array<{ bucket: string; count: number }>; sampleSize: number };
  ageingBuckets: Array<{ bucket: string; count: number; pct: number }>;
  counselorFunnel: Array<{ counselor: string; enquiries: number; counselled: number; toured: number; admitted: number }>;
  closedReasonTrend: { months: string[]; monthKeys: string[]; data: Array<{ reason: string; counts: Record<string, number> }> };
  forecastSeries: Array<{ label: string; actual?: number; projected?: number }>;
};

/* ── Passcode Gate ─────────────────────────────────────── */
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { document.title = "RPS Sales Dashboard"; inputRef.current?.focus(); }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === RPS_PASSCODE) {
      try { sessionStorage.setItem(RPS_AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else { setError(true); setCode(""); setTimeout(() => setError(false), 600); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400" style={{ animation: error ? "shake 0.4s" : undefined }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-base">RPS</div>
          <div><div className="font-black text-lg leading-tight text-[#091a4f]">RPS Sales Dashboard</div><div className="text-xs text-slate-500">Internal · Passcode required</div></div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input ref={inputRef} type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.4em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          placeholder="••••" />
        {error && <div className="mt-2 text-sm text-red-600 text-center">Incorrect passcode</div>}
        <button type="submit" className="mt-5 w-full py-3 rounded-lg bg-[#091a4f] text-white font-bold hover:bg-[#0b2168] transition">Unlock</button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

export default function RpsSales() {
  const [authed, setAuthed] = useState<boolean>(() => { try { return sessionStorage.getItem(RPS_AUTH_KEY) === "1"; } catch { return false; } });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <RpsDashboard />;
}

/* ── Helpers ───────────────────────────────────────────── */
const fmt  = (n: number) => n.toLocaleString("en-IN");
const fmtL = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(1)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(1)}L` : `₹${fmt(n)}`;
const pct  = (n: number) => `${n.toFixed(n >= 100 ? 0 : 1)}%`;

function csvDownload(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-black tracking-tight" style={{ color: NAVY }}>{children}</h2>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, testId, action }: { title: string; children: React.ReactNode; testId?: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200" data-testid={testId}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold" style={{ color: NAVY }}>{title}</div>
        {action}
      </div>
      <div style={{ width: "100%", height: 280 }}><ResponsiveContainer>{children as any}</ResponsiveContainer></div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent, highlight, badge }: { label: string; value: string | number; sub?: string; accent?: string; highlight?: boolean; badge?: string }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${highlight ? "border-amber-400 border-2" : "border-slate-200"}`}>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SLATE }}>{label}</div>
      <div className="text-3xl font-black mt-1" style={{ color: accent || NAVY }}>{value}</div>
      {sub && <div className="text-xs mt-1 text-slate-500">{sub}</div>}
      {badge && <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">{badge}</span>}
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  "ADM DONE": GREEN, "ADM DONE IN RIS": CYAN, "OPEN": BLUE,
  "IN PROCESS ADM": AMBER, "FUTURE PROSPECT": PURPLE,
  "CLOSED": RED, "CLOSED (LEAD TRANSFER TO RIS)": SLATE,
};
const STATUS_LABEL: Record<string, string> = {
  "ADM DONE": "Adm Done", "ADM DONE IN RIS": "Adm→RIS", "OPEN": "Open",
  "IN PROCESS ADM": "In Process", "FUTURE PROSPECT": "Future Prospect",
  "CLOSED": "Closed", "CLOSED (LEAD TRANSFER TO RIS)": "Closed(→RIS)",
};

/* ── Heat-map cell ─────────────────────────────────────── */
function HeatCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0;
  const bg = intensity === 0 ? "#f8fafc"
    : intensity < 0.25 ? "#fecaca"
    : intensity < 0.5  ? "#f87171"
    : intensity < 0.75 ? "#ef4444"
    : "#b91c1c";
  return (
    <div className="w-10 h-9 flex items-center justify-center rounded text-xs font-bold transition-all"
      style={{ background: bg, color: intensity > 0.4 ? "#fff" : "#374151" }}>
      {value || ""}
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
function RpsDashboard() {
  const [data, setData]       = useState<RpsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"analytics"|"pipeline"|"counselors"|"leads">("overview");
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/rps-sales/live")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((d: RpsData) => { if (!cancelled.current) { setData(d); setError(null); setLastFetch(new Date()); } })
      .catch(e => { if (!cancelled.current) setError(String(e)); })
      .finally(() => { if (!cancelled.current) setLoading(false); });
  }, []);

  useEffect(() => {
    document.title = "RPS Sales Dashboard | Rainbow Public School";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchData();
    const iv = setInterval(fetchData, 5 * 60 * 1000);
    return () => { cancelled.current = true; clearInterval(iv); };
  }, [fetchData]);

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading RPS data from Google Sheets…</p>
        </div>
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
        <div className="bg-white rounded-xl p-8 shadow text-center max-w-md">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="font-bold text-slate-800 mb-2">Failed to load data</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 rounded-lg text-white font-bold" style={{ background: NAVY }}>Retry</button>
        </div>
      </div>
    );
  }

  const d = data!;
  const { kpis } = d;
  const totalAdmAll = kpis.totalAdmissions + kpis.totalAdmRIS;
  const TABS: { id: typeof activeTab; label: string }[] = [
    { id: "overview",   label: "Overview" },
    { id: "analytics",  label: "Deep Analytics" },
    { id: "pipeline",   label: "DM Pipeline" },
    { id: "counselors", label: "Counselors" },
    { id: "leads",      label: "Recent Leads" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ background: NAVY }} className="px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-sm">RPS</div>
            <div>
              <div className="text-white font-black text-lg leading-tight">RPS Sales Dashboard</div>
              <div className="text-amber-300 text-xs">Rainbow Public School · 26-27 Academic Year</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />}
            <div className="text-right">
              {lastFetch && <div className="text-xs text-slate-400">Updated {lastFetch.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}</div>}
              <button onClick={fetchData} disabled={loading} className="text-xs text-amber-300 hover:text-white transition">↻ Refresh</button>
            </div>
          </div>
        </div>
        {/* Nav tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-1 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${activeTab === t.id ? "bg-amber-400 text-[#091a4f]" : "text-slate-300 hover:text-white hover:bg-white/10"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ══════════════════════════════════════════════════════════ OVERVIEW */}
        {activeTab === "overview" && (
          <>
            {/* KPI Grid */}
            <div>
              <SectionTitle sub="Rainbow Public School · all branches · 26-27">Key Performance Indicators</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <KpiCard label="Total Enquiries" value={fmt(kpis.totalEnquiries)} sub={`${kpis.thisMonthEnquiries} this month`} />
                <KpiCard label="Admissions Done" value={fmt(totalAdmAll)} sub={`${kpis.totalAdmissions} RPS · ${kpis.totalAdmRIS} RIS`} accent={GREEN} highlight />
                <KpiCard label="Conversion" value={pct(kpis.overallConversion)} accent={kpis.overallConversion >= 50 ? GREEN : kpis.overallConversion >= 30 ? AMBER : RED} />
                <KpiCard label="Open Enquiries" value={fmt(kpis.openEnquiries)} sub={`${kpis.inProcess} in process`} accent={BLUE} />
                <KpiCard label="Closed" value={fmt(kpis.closedTotal)} accent={RED} />
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiCard label="This Month Enquiries" value={fmt(kpis.thisMonthEnquiries)} />
                <KpiCard label="This Month Admissions" value={fmt(kpis.thisMonthAdm)} accent={GREEN} />
                {d.leadTime.sampleSize > 0 && <>
                  <KpiCard label="Median Lead Time" value={`${d.leadTime.median}d`} sub={`P90: ${d.leadTime.p90} days`} accent={AMBER} badge="enquiry → adm" />
                  <KpiCard label="Future Prospect" value={fmt(kpis.futureProspect)} accent={PURPLE} sub="warm pipeline" />
                </>}
              </div>
            </div>

            {/* Monthly Trend with Forecast */}
            {d.forecastSeries.length > 0 && (
              <div>
                <SectionTitle sub="Historical actuals + 2-month linear regression forecast">Monthly Admissions Trend & Forecast</SectionTitle>
                <ChartCard title="Enquiries vs Admissions (with forecast overlay)" testId="rps-chart-forecast">
                  <ComposedChart data={d.forecastSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="actual" fill={GREEN} name="Actual Adm" radius={[3,3,0,0]} />
                    <Line dataKey="projected" stroke={AMBER} name="Forecast" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: AMBER, r: 4 }} connectNulls />
                  </ComposedChart>
                </ChartCard>
              </div>
            )}

            {/* Branch Performance */}
            {d.byBranch.length > 0 && (
              <div>
                <SectionTitle sub="All 6 branches · enquiries, admissions, conversion">Branch Performance</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <ChartCard title="Admissions vs Enquiries by Branch" testId="rps-chart-branch">
                    <BarChart data={d.byBranch} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="branch" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip formatter={(v: any) => [fmt(+v)]} />
                      <Bar dataKey="enquiries" fill="#dbeafe" name="Enquiries" radius={[0,3,3,0]} />
                      <Bar dataKey="admissions" fill={GREEN} name="Admissions" radius={[0,3,3,0]} />
                    </BarChart>
                  </ChartCard>
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <span className="text-sm font-bold" style={{ color: NAVY }}>Branch Summary</span>
                      <button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                        onClick={() => csvDownload("rps-branch.csv", ["Branch","Enquiries","Admissions","Open","Closed","Conv%"],
                          d.byBranch.map(b => [b.branch,b.enquiries,b.admissions,b.open,b.closed,b.conversion]))}>
                        ↓ CSV
                      </button>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                        <tr>
                          <th className="text-left py-2 px-4">Branch</th>
                          <th className="text-right py-2 px-3">Enq</th>
                          <th className="text-right py-2 px-3">Adm</th>
                          <th className="text-right py-2 px-3">Open</th>
                          <th className="text-right py-2 px-3">Closed</th>
                          <th className="text-right py-2 px-3">Conv%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.byBranch.map((b, i) => (
                          <tr key={b.branch} className={`border-t border-slate-100 ${i===0?"bg-green-50":"hover:bg-slate-50"}`}>
                            <td className="py-2 px-4 font-semibold">{b.branch}</td>
                            <td className="text-right py-2 px-3 tabular-nums">{fmt(b.enquiries)}</td>
                            <td className="text-right py-2 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{fmt(b.admissions)}</td>
                            <td className="text-right py-2 px-3 tabular-nums" style={{ color: BLUE }}>{fmt(b.open)}</td>
                            <td className="text-right py-2 px-3 tabular-nums" style={{ color: RED }}>{fmt(b.closed)}</td>
                            <td className="text-right py-2 px-3 tabular-nums font-bold"
                              style={{ color: b.conversion>=50?GREEN:b.conversion>=30?AMBER:RED }}>{pct(b.conversion)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Source & Grade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {d.bySource.length > 0 && (
                <ChartCard title="Enquiries & Admissions by Source" testId="rps-chart-source">
                  <BarChart data={d.bySource} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="source" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any, n: string) => [fmt(+v), n==="enquiries"?"Enquiries":"Admissions"]} />
                    <Legend />
                    <Bar dataKey="enquiries" fill={BLUE} name="enquiries" radius={[3,3,0,0]} />
                    <Bar dataKey="admissions" fill={GREEN} name="admissions" radius={[3,3,0,0]} />
                  </BarChart>
                </ChartCard>
              )}
              {d.byGrade.length > 0 && (
                <ChartCard title="Enquiries by Grade" testId="rps-chart-grade">
                  <BarChart data={d.byGrade.slice(0, 12)} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="grade" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip formatter={(v: any) => [fmt(+v), "Enquiries"]} />
                    <Bar dataKey="count" fill={PURPLE} name="Enquiries" radius={[0,3,3,0]} />
                  </BarChart>
                </ChartCard>
              )}
            </div>

            {/* Status Pie */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Enquiry Status Breakdown</div>
              <div style={{ width: "100%", height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={[
                      { name: "Adm Done (RPS)", value: kpis.totalAdmissions },
                      { name: "Adm Done (RIS)", value: kpis.totalAdmRIS },
                      { name: "Open", value: kpis.openEnquiries },
                      { name: "In Process", value: kpis.inProcess },
                      { name: "Future Prospect", value: kpis.futureProspect },
                      { name: "Closed", value: kpis.closedTotal },
                    ].filter(x => x.value > 0)}
                      cx="50%" cy="50%" outerRadius={90} dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                      {[GREEN, CYAN, BLUE, AMBER, PURPLE, RED].map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [fmt(+v)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════ DEEP ANALYTICS */}
        {activeTab === "analytics" && (
          <>
            {/* Lead Time */}
            {d.leadTime.sampleSize > 0 && (
              <div>
                <SectionTitle sub={`Based on ${d.leadTime.sampleSize} admitted enquiries with both dates recorded`}>Lead-to-Admission Time Analysis</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="grid grid-cols-2 gap-4">
                    <KpiCard label="Median Lead Time" value={`${d.leadTime.median} days`} sub="50th percentile" accent={AMBER} highlight />
                    <KpiCard label="90th Percentile" value={`${d.leadTime.p90} days`} sub="9 in 10 convert within" accent={RED} />
                    <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                      <p className="text-sm text-slate-600">
                        Half of all admissions happen within <strong>{d.leadTime.median} days</strong> of enquiry.
                        Setting follow-up deadlines at <strong>{d.leadTime.p90} days</strong> captures 90% of conversions.
                      </p>
                    </div>
                  </div>
                  <ChartCard title="Lead Time Distribution (enquiry → admission)" testId="rps-chart-leadtime">
                    <BarChart data={d.leadTime.histogram} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => [v, "Admissions"]} />
                      <Bar dataKey="count" name="Admissions" radius={[3,3,0,0]}>
                        {d.leadTime.histogram.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ChartCard>
                </div>
              </div>
            )}

            {/* Ageing Buckets */}
            {d.ageingBuckets.length > 0 && (
              <div>
                <SectionTitle sub="Days since enquiry date for OPEN + In Process + Future Prospect leads">Open Lead Ageing Buckets</SectionTitle>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <div className="space-y-3">
                    {d.ageingBuckets.map((b, i) => {
                      const color = i === 0 ? GREEN : i === 1 ? CYAN : i === 2 ? AMBER : i === 3 ? "#ea580c" : RED;
                      return (
                        <div key={b.bucket} className="flex items-center gap-3">
                          <span className="w-24 text-sm font-semibold text-slate-700 text-right">{b.bucket}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
                            <div className="h-full rounded-full flex items-center px-3 text-white text-xs font-bold transition-all"
                              style={{ width: `${Math.max(b.pct, 4)}%`, background: color }}>
                              {b.count} ({b.pct}%)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Total active open leads: <strong>{d.ageingBuckets.reduce((s,b)=>s+b.count,0)}</strong>
                  </p>
                </div>
              </div>
            )}

            {/* Closed-Reason Trend Heat-map */}
            {d.closedReasonTrend.data.length > 0 && (
              <div>
                <SectionTitle sub="Counts per month — darker = more closures. Click row label to filter.">Closed-Reason Trend Heat-Map</SectionTitle>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 overflow-x-auto">
                  <div className="inline-block min-w-full">
                    {/* Month headers */}
                    <div className="flex gap-1 mb-1 pl-44">
                      {d.closedReasonTrend.months.map((m, i) => (
                        <div key={i} className="w-10 text-center text-xs font-semibold text-slate-500 leading-tight">{m}</div>
                      ))}
                    </div>
                    {d.closedReasonTrend.data.map(row => {
                      const counts = d.closedReasonTrend.monthKeys.map(mk => row.counts[mk] || 0);
                      const max = Math.max(...counts, 1);
                      return (
                        <div key={row.reason} className="flex items-center gap-1 mb-1">
                          <div className="w-44 text-xs font-medium text-slate-700 text-right pr-2 truncate" title={row.reason}>{row.reason}</div>
                          {counts.map((v, i) => <HeatCell key={i} value={v} max={max} />)}
                          <div className="ml-2 text-xs text-slate-500 font-bold w-8">{counts.reduce((s,c)=>s+c,0)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Closed Reasons Bar */}
            {d.closedReasons.length > 0 && (
              <ChartCard title="Top Closed Reasons (all time)" testId="rps-chart-closed">
                <BarChart data={d.closedReasons} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="reason" tick={{ fontSize: 10 }} width={170} />
                  <Tooltip formatter={(v: any) => [fmt(+v), "Closed"]} />
                  <Bar dataKey="count" name="Closed" radius={[0,3,3,0]}>
                    {d.closedReasons.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ChartCard>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ DM PIPELINE */}
        {activeTab === "pipeline" && (
          <>
            {/* DM KPIs */}
            <div>
              <SectionTitle sub="DM Tracker — all branches">DM Pipeline Overview</SectionTitle>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <KpiCard label="DM Admitted" value={fmt(d.dmPipeline.admitted)} accent={GREEN} highlight />
                <KpiCard label="DM Open" value={fmt(d.dmPipeline.open)} accent={BLUE} />
                <KpiCard label="DM Closed" value={fmt(d.dmPipeline.closed)} accent={RED} />
              </div>

              {/* Revenue waterfall from confidence */}
              {d.dmPipeline.byConfidence.length > 0 && (
                <div>
                  <SectionTitle sub="Open DMs · assuming ₹50,000 revenue per admission">Sales Confidence Pipeline & Revenue Projection</SectionTitle>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      {d.dmPipeline.byConfidence.map(c => {
                        const rev = c.count * 50000;
                        const color = c.confidence.toLowerCase()==="high" ? GREEN : c.confidence.toLowerCase()==="medium" ? AMBER : RED;
                        const bg   = c.confidence.toLowerCase()==="high" ? "#dcfce7" : c.confidence.toLowerCase()==="medium" ? "#fef9c3" : "#fee2e2";
                        return (
                          <div key={c.confidence} className="rounded-xl p-4 text-center" style={{ background: bg }}>
                            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>{c.confidence} Confidence</div>
                            <div className="text-3xl font-black" style={{ color }}>{c.count}</div>
                            <div className="text-sm font-semibold text-slate-600 mt-1">open leads</div>
                            <div className="text-lg font-black mt-2" style={{ color }}>{fmtL(rev)}</div>
                            <div className="text-xs text-slate-500">potential revenue</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-lg p-3 bg-slate-50 text-sm text-slate-600">
                      <strong>Total projected revenue</strong> from open DMs:{" "}
                      <span className="font-black text-lg" style={{ color: GREEN }}>
                        {fmtL(d.dmPipeline.byConfidence.reduce((s,c) => s + c.count*50000, 0))}
                      </span>
                      {" "}· <span className="text-slate-500">{d.dmPipeline.open} open leads × ₹50,000</span>
                    </div>
                  </div>
                </div>
              )}

              {/* DM by Branch */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartCard title="DM Pipeline by Branch" testId="rps-chart-dm-branch">
                  <BarChart data={d.dmPipeline.byBranch} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="branch" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="admitted" fill={GREEN} name="Admitted" radius={[0,3,3,0]} stackId="a" />
                    <Bar dataKey="open" fill={BLUE} name="Open" radius={[0,3,3,0]} stackId="a" />
                    <Bar dataKey="closed" fill={RED} name="Closed" radius={[0,3,3,0]} stackId="a" />
                  </BarChart>
                </ChartCard>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto p-5">
                  <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>DM Branch Table</div>
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-slate-500">
                      <tr>
                        <th className="text-left pb-2">Branch</th>
                        <th className="text-right pb-2" style={{ color: GREEN }}>Adm</th>
                        <th className="text-right pb-2" style={{ color: BLUE }}>Open</th>
                        <th className="text-right pb-2" style={{ color: RED }}>Closed</th>
                        <th className="text-right pb-2">Conv%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.dmPipeline.byBranch.map(b => {
                        const tot = b.admitted + b.open + b.closed;
                        const conv = tot ? Math.round(b.admitted/tot*100) : 0;
                        return (
                          <tr key={b.branch} className="border-t border-slate-100">
                            <td className="py-1.5 font-medium">{b.branch}</td>
                            <td className="text-right tabular-nums font-bold" style={{ color: GREEN }}>{b.admitted}</td>
                            <td className="text-right tabular-nums" style={{ color: BLUE }}>{b.open}</td>
                            <td className="text-right tabular-nums" style={{ color: RED }}>{b.closed}</td>
                            <td className="text-right tabular-nums font-bold" style={{ color: conv>=50?GREEN:conv>=30?AMBER:RED }}>{conv}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* MIS Progress */}
            {d.misHistory.length > 0 && (
              <div>
                <SectionTitle sub="Cumulative running totals from MIS dashboard">MIS Progress Tracker</SectionTitle>
                <ChartCard title="Cumulative Walkins & Admissions Over Time">
                  <LineChart data={d.misHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(d.misHistory.length/8)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="walkins" stroke={BLUE} name="Total Walkins" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="admissions" stroke={GREEN} name="Total Admissions" dot={false} strokeWidth={2} />
                  </LineChart>
                </ChartCard>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ COUNSELORS */}
        {activeTab === "counselors" && (
          <>
            {/* Conversion funnel by counselor */}
            {d.counselorFunnel.length > 0 && (
              <div>
                <SectionTitle sub="Enquiries → Counselling Recorded → School Tour → Admission">Conversion Funnel by Counsellor</SectionTitle>
                <ChartCard title="Stage-by-Stage Conversion Funnel (top 12 by admissions)" testId="rps-chart-funnel"
                  action={<button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                    onClick={() => csvDownload("rps-funnel.csv",
                      ["Counsellor","Enquiries","Counselled","School Tour","Admitted","Conv%"],
                      d.counselorFunnel.map(c => [c.counselor,c.enquiries,c.counselled,c.toured,c.admitted,
                        c.enquiries?Math.round(c.admitted/c.enquiries*100):0]))}>↓ CSV</button>}>
                  <BarChart data={d.counselorFunnel} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="counselor" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(v: any, n: string) => [fmt(+v), n]} />
                    <Legend />
                    <Bar dataKey="enquiries" fill="#dbeafe" name="Enquiries" radius={[0,3,3,0]} />
                    <Bar dataKey="counselled" fill={CYAN} name="Counselled" radius={[0,3,3,0]} />
                    <Bar dataKey="toured" fill={PURPLE} name="School Tour" radius={[0,3,3,0]} />
                    <Bar dataKey="admitted" fill={GREEN} name="Admitted" radius={[0,3,3,0]} />
                  </BarChart>
                </ChartCard>
                {/* Funnel table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                      <tr>
                        <th className="text-left py-3 px-4">Counsellor</th>
                        <th className="text-right py-3 px-3">Enquiries</th>
                        <th className="text-right py-3 px-3">Counselled</th>
                        <th className="text-right py-3 px-3">School Tour</th>
                        <th className="text-right py-3 px-3">Admitted</th>
                        <th className="text-right py-3 px-3">Conv%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.counselorFunnel.map((c, i) => {
                        const conv = c.enquiries ? Math.round(c.admitted/c.enquiries*100) : 0;
                        return (
                          <tr key={`${c.counselor}-${i}`} className={`border-t border-slate-100 ${i===0?"bg-amber-50":"hover:bg-slate-50"}`}>
                            <td className="py-2.5 px-4 font-semibold">{c.counselor}</td>
                            <td className="text-right py-2.5 px-3 tabular-nums">{c.enquiries}</td>
                            <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: CYAN }}>{c.counselled}</td>
                            <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: PURPLE }}>{c.toured}</td>
                            <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{c.admitted}</td>
                            <td className="text-right py-2.5 px-3 tabular-nums font-bold"
                              style={{ color: conv>=50?GREEN:conv>=30?AMBER:RED }}>{conv}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Counselor leaderboard */}
            {d.counselorLeaderboard.length > 0 && (
              <div>
                <SectionTitle sub="From Individual Conversion pivot · sorted by total admissions">Full Counsellor Leaderboard</SectionTitle>
                <div className="flex justify-end mb-2">
                  <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                    onClick={() => csvDownload("rps-leaderboard.csv",
                      ["Counsellor","Adm(RPS)","Adm(RIS)","Total Adm","Closed","Open","In Process","Grand Total","Conv%"],
                      d.counselorLeaderboard.map(c => [c.counselor,c.admDone,c.admRIS,c.admDone+c.admRIS,c.closed,c.open,c.inProcess,c.total,c.conversion]))}>
                    ↓ Download CSV
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                      <tr>
                        <th className="text-left py-3 px-4">Counsellor</th>
                        <th className="text-right py-3 px-3">Adm (RPS)</th>
                        <th className="text-right py-3 px-3">Adm (RIS)</th>
                        <th className="text-right py-3 px-3">Total Adm</th>
                        <th className="text-right py-3 px-3">Closed</th>
                        <th className="text-right py-3 px-3">Open</th>
                        <th className="text-right py-3 px-3">In Process</th>
                        <th className="text-right py-3 px-3">Grand Total</th>
                        <th className="text-right py-3 px-3">Conv%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.counselorLeaderboard.map((c, i) => (
                        <tr key={`${c.counselor}-${i}`} className={`border-t border-slate-100 ${i===0?"bg-amber-50":"hover:bg-slate-50"}`}>
                          <td className="py-2 px-4 font-semibold">{c.counselor}</td>
                          <td className="text-right py-2 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{c.admDone||"—"}</td>
                          <td className="text-right py-2 px-3 tabular-nums" style={{ color: CYAN }}>{c.admRIS||"—"}</td>
                          <td className="text-right py-2 px-3 tabular-nums font-black" style={{ color: GREEN }}>{c.admDone+c.admRIS}</td>
                          <td className="text-right py-2 px-3 tabular-nums" style={{ color: RED }}>{c.closed||"—"}</td>
                          <td className="text-right py-2 px-3 tabular-nums" style={{ color: BLUE }}>{c.open||"—"}</td>
                          <td className="text-right py-2 px-3 tabular-nums" style={{ color: AMBER }}>{c.inProcess||"—"}</td>
                          <td className="text-right py-2 px-3 tabular-nums">{c.total}</td>
                          <td className="text-right py-2 px-3 tabular-nums font-bold"
                            style={{ color: c.conversion>=50?GREEN:c.conversion>=30?AMBER:RED }}>{pct(c.conversion)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════ RECENT LEADS */}
        {activeTab === "leads" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle sub="20 most recent · sorted by date">Recent Enquiries</SectionTitle>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                onClick={() => csvDownload("rps-recent-leads.csv",
                  ["Date","Student","Grade","Branch","Counsellor","Source","Status"],
                  d.recentEnquiries.map(e => [e.date,e.name,e.grade,e.branch,e.counselor,e.source,e.status]))}>
                ↓ Download CSV
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Student</th>
                    <th className="text-left py-3 px-3">Grade</th>
                    <th className="text-left py-3 px-3">Branch</th>
                    <th className="text-left py-3 px-3">Counsellor</th>
                    <th className="text-left py-3 px-3">Source</th>
                    <th className="text-left py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentEnquiries.map((e, i) => (
                    <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-4 text-slate-500 text-xs whitespace-nowrap">{e.date}</td>
                      <td className="py-2 px-4 font-medium">{e.name}</td>
                      <td className="py-2 px-3 text-slate-600">{e.grade}</td>
                      <td className="py-2 px-3 text-slate-600">{e.branch}</td>
                      <td className="py-2 px-3 text-slate-600">{e.counselor}</td>
                      <td className="py-2 px-3 text-slate-500">{e.source}</td>
                      <td className="py-2 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: (STATUS_COLOR[e.status]||SLATE)+"22", color: STATUS_COLOR[e.status]||SLATE }}>
                          {STATUS_LABEL[e.status]||e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pb-6">
          Auto-refreshes every 5 minutes · Data from Google Sheets · Generated {d.generatedAt ? new Date(d.generatedAt).toLocaleString("en-IN") : "—"}
        </div>
      </div>
    </div>
  );
}
