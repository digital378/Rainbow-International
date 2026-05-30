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
    totalEnquiries: number;
    totalAdmissions: number;
    totalAdmRIS: number;
    openEnquiries: number;
    closedTotal: number;
    inProcess: number;
    futureProspect: number;
    overallConversion: number;
    thisMonthEnquiries: number;
    thisMonthAdm: number;
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
};

/* ── Passcode Gate ─────────────────────────────────────── */
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.title = "RPS Sales Dashboard | Rainbow Public School";
    inputRef.current?.focus();
  }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === RPS_PASSCODE) {
      try { sessionStorage.setItem(RPS_AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else {
      setError(true); setCode("");
      setTimeout(() => setError(false), 600);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }} data-testid="rps-passcode-gate">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400" style={{ animation: error ? "shake 0.4s" : undefined }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-base">RPS</div>
          <div>
            <div className="font-black text-lg leading-tight text-[#091a4f]">RPS Sales Dashboard</div>
            <div className="text-xs text-slate-500">Internal · Passcode required</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input
          ref={inputRef} type="password" autoComplete="off" value={code}
          onChange={(e) => setCode(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.4em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          placeholder="••••" data-testid="rps-input-passcode"
        />
        {error && <div className="mt-2 text-sm text-red-600 text-center">Incorrect passcode</div>}
        <button type="submit" className="mt-5 w-full py-3 rounded-lg bg-[#091a4f] text-white font-bold hover:bg-[#0b2168] transition" data-testid="rps-button-unlock">Unlock</button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

export default function RpsSales() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(RPS_AUTH_KEY) === "1"; } catch { return false; }
  });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <RpsDashboard />;
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

const STATUS_COLOR: Record<string, string> = {
  "ADM DONE":                  GREEN,
  "ADM DONE IN RIS":           CYAN,
  "OPEN":                      BLUE,
  "IN PROCESS ADM":            AMBER,
  "FUTURE PROSPECT":           PURPLE,
  "CLOSED":                    RED,
  "CLOSED (LEAD TRANSFER TO RIS)": SLATE,
};

const STATUS_LABEL: Record<string, string> = {
  "ADM DONE":                  "Adm Done",
  "ADM DONE IN RIS":           "Adm → RIS",
  "OPEN":                      "Open",
  "IN PROCESS ADM":            "In Process",
  "FUTURE PROSPECT":           "Future Prospect",
  "CLOSED":                    "Closed",
  "CLOSED (LEAD TRANSFER TO RIS)": "Closed (→RIS)",
};

/* ── Main Dashboard ────────────────────────────────────── */
function RpsDashboard() {
  const [data, setData]         = useState<RpsData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/rps-sales/live")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((d: RpsData) => {
        if (!cancelled.current) { setData(d); setError(null); setLastFetch(new Date()); }
      })
      .catch((e) => { if (!cancelled.current) setError(String(e)); })
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

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div style={{ background: NAVY }} className="px-6 py-4 flex items-center justify-between">
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
            <button onClick={fetchData} disabled={loading} className="text-xs text-amber-300 hover:text-white transition" data-testid="rps-btn-refresh">↻ Refresh</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div>
          <SectionTitle sub="Rainbow Public School · all branches · 26-27 academic year">Key Performance Indicators</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard label="Total Enquiries" value={fmt(kpis.totalEnquiries)} sub={`${kpis.thisMonthEnquiries} this month`} testId="rps-kpi-enquiries" />
            <KpiCard label="Admissions Done" value={fmt(totalAdmAll)} sub={`${kpis.totalAdmissions} RPS + ${kpis.totalAdmRIS} RIS`} accent={GREEN} highlight testId="rps-kpi-admissions" />
            <KpiCard label="Conversion Rate" value={pct(kpis.overallConversion)} sub="Adm ÷ Total enquiries" accent={kpis.overallConversion >= 50 ? GREEN : kpis.overallConversion >= 30 ? AMBER : RED} testId="rps-kpi-conversion" />
            <KpiCard label="Open Enquiries" value={fmt(kpis.openEnquiries)} sub={`${kpis.inProcess} in process · ${kpis.futureProspect} future`} accent={BLUE} testId="rps-kpi-open" />
            <KpiCard label="Closed" value={fmt(kpis.closedTotal)} sub="Not converted" accent={RED} testId="rps-kpi-closed" />
          </div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard label="This Month — Enquiries" value={fmt(kpis.thisMonthEnquiries)} sub="New walk-ins this month" testId="rps-kpi-mo-enq" />
            <KpiCard label="This Month — Admissions" value={fmt(kpis.thisMonthAdm)} accent={GREEN} testId="rps-kpi-mo-adm" />
            <KpiCard label="DM Pipeline — Admitted" value={fmt(d.dmPipeline.admitted)} accent={GREEN} sub="from DM tracker" testId="rps-kpi-dm-adm" />
            <KpiCard label="DM Pipeline — Open" value={fmt(d.dmPipeline.open)} accent={BLUE} sub="active DM leads" testId="rps-kpi-dm-open" />
          </div>
        </div>

        {/* ── Monthly Trend ────────────────────────────────────────── */}
        {d.byMonth.length > 0 && (
          <div>
            <SectionTitle sub="Enquiries and admissions by month">Monthly Trend</SectionTitle>
            <ChartCard title="Enquiries vs Admissions — Month over Month" testId="rps-chart-monthly">
              <ComposedChart data={d.byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any, n: string) => [fmt(+v), n === "enquiries" ? "Enquiries" : "Admissions"]} />
                <Legend />
                <Area type="monotone" dataKey="enquiries" fill="#dbeafe" stroke={BLUE} name="Enquiries" strokeWidth={2} />
                <Bar dataKey="admissions" fill={GREEN} name="Admissions" radius={[3,3,0,0]} />
              </ComposedChart>
            </ChartCard>
          </div>
        )}

        {/* ── MIS Progress ─────────────────────────────────────────── */}
        {d.misHistory.length > 0 && (
          <div>
            <SectionTitle sub="Cumulative running totals from MIS dashboard">MIS Progress Tracker</SectionTitle>
            <ChartCard title="Cumulative Walkins & Admissions Over Time" testId="rps-chart-mis">
              <LineChart data={d.misHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(d.misHistory.length / 8)} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="walkins" stroke={BLUE} name="Total Walkins" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="admissions" stroke={GREEN} name="Total Admissions" dot={false} strokeWidth={2} />
              </LineChart>
            </ChartCard>
          </div>
        )}

        {/* ── Branch Performance ───────────────────────────────────── */}
        {d.byBranch.length > 0 && (
          <div>
            <SectionTitle sub="All 6 branches · enquiries, admissions, conversion">Branch Performance</SectionTitle>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartCard title="Admissions by Branch" testId="rps-chart-branch-adm">
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
                <table className="w-full text-sm" data-testid="rps-table-branch">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4">Branch</th>
                      <th className="text-right py-3 px-3">Enquiries</th>
                      <th className="text-right py-3 px-3">Adm</th>
                      <th className="text-right py-3 px-3">Open</th>
                      <th className="text-right py-3 px-3">Closed</th>
                      <th className="text-right py-3 px-3">Conv%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.byBranch.map((b, i) => (
                      <tr key={b.branch} className={`border-t border-slate-100 ${i === 0 ? "bg-green-50" : "hover:bg-slate-50"}`}>
                        <td className="py-2.5 px-4 font-semibold">{b.branch}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums">{fmt(b.enquiries)}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{fmt(b.admissions)}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: BLUE }}>{fmt(b.open)}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: RED }}>{fmt(b.closed)}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: b.conversion >= 50 ? GREEN : b.conversion >= 30 ? AMBER : RED }}>{pct(b.conversion)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Source & Grade ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {d.bySource.length > 0 && (
            <ChartCard title="Enquiries by Source" testId="rps-chart-source">
              <BarChart data={d.bySource} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="source" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any, n: string) => [fmt(+v), n === "enquiries" ? "Enquiries" : "Admissions"]} />
                <Legend />
                <Bar dataKey="enquiries" fill={BLUE} name="Enquiries" radius={[3,3,0,0]} />
                <Bar dataKey="admissions" fill={GREEN} name="Admissions" radius={[3,3,0,0]} />
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

        {/* ── Lead Status Pie ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200" data-testid="rps-chart-status-pie">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Enquiry Status Breakdown</div>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Adm Done (RPS)", value: kpis.totalAdmissions },
                      { name: "Adm Done (RIS)", value: kpis.totalAdmRIS },
                      { name: "Open", value: kpis.openEnquiries },
                      { name: "In Process", value: kpis.inProcess },
                      { name: "Future Prospect", value: kpis.futureProspect },
                      { name: "Closed", value: kpis.closedTotal },
                    ].filter(x => x.value > 0)}
                    cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {[GREEN, CYAN, BLUE, AMBER, PURPLE, RED].map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => [fmt(+v), "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DM Pipeline */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200" data-testid="rps-dm-pipeline">
            <div className="text-sm font-bold mb-4" style={{ color: NAVY }}>DM Pipeline by Branch</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center rounded-lg p-3" style={{ background: "#dcfce7" }}>
                <div className="text-2xl font-black" style={{ color: GREEN }}>{fmt(d.dmPipeline.admitted)}</div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">Admitted</div>
              </div>
              <div className="text-center rounded-lg p-3" style={{ background: "#dbeafe" }}>
                <div className="text-2xl font-black" style={{ color: BLUE }}>{fmt(d.dmPipeline.open)}</div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">Open</div>
              </div>
              <div className="text-center rounded-lg p-3" style={{ background: "#fee2e2" }}>
                <div className="text-2xl font-black" style={{ color: RED }}>{fmt(d.dmPipeline.closed)}</div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">Closed</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-slate-500 uppercase">
                  <tr>
                    <th className="text-left pb-2">Branch</th>
                    <th className="text-right pb-2" style={{ color: GREEN }}>Adm</th>
                    <th className="text-right pb-2" style={{ color: BLUE }}>Open</th>
                    <th className="text-right pb-2" style={{ color: RED }}>Closed</th>
                  </tr>
                </thead>
                <tbody>
                  {d.dmPipeline.byBranch.map(b => (
                    <tr key={b.branch} className="border-t border-slate-100">
                      <td className="py-1.5 font-medium">{b.branch}</td>
                      <td className="text-right tabular-nums font-bold" style={{ color: GREEN }}>{b.admitted}</td>
                      <td className="text-right tabular-nums" style={{ color: BLUE }}>{b.open}</td>
                      <td className="text-right tabular-nums" style={{ color: RED }}>{b.closed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {d.dmPipeline.byConfidence.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="text-xs font-semibold text-slate-500 mb-2">Open DMs by Sales Confidence</div>
                <div className="flex gap-2 flex-wrap">
                  {d.dmPipeline.byConfidence.map(c => (
                    <span key={c.confidence} className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{ background: c.confidence.toLowerCase() === "high" ? "#dcfce7" : c.confidence.toLowerCase() === "medium" ? "#fef9c3" : "#fee2e2",
                               color: c.confidence.toLowerCase() === "high" ? GREEN : c.confidence.toLowerCase() === "medium" ? "#92400e" : RED }}>
                      {c.confidence}: {c.count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Counselor Leaderboard ────────────────────────────────── */}
        {d.counselorLeaderboard.length > 0 && (
          <div>
            <SectionTitle sub="From Individual Conversion pivot · sorted by total admissions">Counselor Leaderboard</SectionTitle>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm" data-testid="rps-table-counselor">
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
                    <tr key={`${c.counselor}-${i}`} className={`border-t border-slate-100 ${i === 0 ? "bg-amber-50" : "hover:bg-slate-50"}`}>
                      <td className="py-2.5 px-4 font-semibold">{c.counselor}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{c.admDone || "—"}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: CYAN }}>{c.admRIS || "—"}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums font-black" style={{ color: GREEN }}>{c.admDone + c.admRIS}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: RED }}>{c.closed || "—"}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: BLUE }}>{c.open || "—"}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: AMBER }}>{c.inProcess || "—"}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums">{c.total}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: c.conversion >= 50 ? GREEN : c.conversion >= 30 ? AMBER : RED }}>{pct(c.conversion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Closed Reasons ───────────────────────────────────────── */}
        {d.closedReasons.length > 0 && (
          <div>
            <SectionTitle sub="Top reasons for closed enquiries">Why Enquiries Close</SectionTitle>
            <ChartCard title="Closed Enquiry Reasons" testId="rps-chart-closed-reasons">
              <BarChart data={d.closedReasons} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="reason" tick={{ fontSize: 10 }} width={170} />
                <Tooltip formatter={(v: any) => [fmt(+v), "Closed"]} />
                <Bar dataKey="count" fill={RED} name="Closed" radius={[0,3,3,0]}>
                  {d.closedReasons.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ChartCard>
          </div>
        )}

        {/* ── Recent Enquiries ─────────────────────────────────────── */}
        {d.recentEnquiries.length > 0 && (
          <div>
            <SectionTitle sub="20 most recent · sorted by date">Recent Enquiries</SectionTitle>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm" data-testid="rps-table-recent">
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
                          style={{ background: (STATUS_COLOR[e.status] || SLATE) + "22", color: STATUS_COLOR[e.status] || SLATE }}>
                          {STATUS_LABEL[e.status] || e.status}
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
