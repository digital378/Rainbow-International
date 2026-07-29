import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", PURPLE = "#7c3aed", SLATE = "#475569";
const PIE_COLORS = [NAVY, RED, AMBER, GREEN, BLUE, PURPLE, SLATE, "#0891b2", "#ea580c"];

const PASSCODE = "MKT27";
const AUTH_KEY  = "mkt27_auth";

type Stats = {
  brand: string | null;
  academicYear: string;
  kpis: { totalLeads: number; bookings: number; walkins: number; admissions: number };
  monthly: Array<{ month: string; cnt: number }>;
  bySource: Array<{ source: string; cnt: number }>;
  byBranch: Array<{ branchId: number | null; cnt: number }>;
  byOwner: Array<{ leadOwner: string | null; cnt: number }>;
  statusBreakdown: Array<{ status: string; cnt: number }>;
  generatedAt: string;
};

type Branch = { id: number; name: string; brand: string; code: string };
type BrandTab = "combined" | "RIS" | "RPS";

const fmt = (n: number) => n.toLocaleString("en-IN");
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { document.title = "Marketing · AY 2027-28"; ref.current?.focus(); }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PASSCODE) {
      try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else { setError(true); setCode(""); setTimeout(() => setError(false), 600); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400" style={{ animation: error ? "shake 0.4s" : undefined }}>
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
        {error && <div className="mt-2 text-sm text-red-600 text-center">Incorrect passcode</div>}
        <button type="submit" className="mt-5 w-full py-3 rounded-lg font-bold text-white hover:bg-[#0b2168] transition" style={{ background: NAVY }}>Unlock</button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-2xl font-black mt-1" style={{ color: accent || NAVY }}>{value}</div>
      {sub && <div className="text-xs mt-1 text-slate-500">{sub}</div>}
    </div>
  );
}

function BarPct({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const p = total > 0 ? Math.round(value / total * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="font-medium text-slate-700 truncate max-w-[160px]">{label}</span>
        <span className="font-bold tabular-nums" style={{ color: NAVY }}>{value} <span className="text-slate-400 font-normal">({p}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
      </div>
    </div>
  );
}

function mergeStats(ris: Stats, rps: Stats): Stats {
  // Merge kpis
  const kpis = {
    totalLeads: ris.kpis.totalLeads + rps.kpis.totalLeads,
    bookings: ris.kpis.bookings + rps.kpis.bookings,
    walkins: ris.kpis.walkins + rps.kpis.walkins,
    admissions: ris.kpis.admissions + rps.kpis.admissions,
  };
  // Merge monthly
  const monthMap = new Map<string, number>();
  for (const m of [...ris.monthly, ...rps.monthly]) {
    monthMap.set(m.month, (monthMap.get(m.month) || 0) + m.cnt);
  }
  const monthly = Array.from(monthMap, ([month, cnt]) => ({ month, cnt })).sort((a,b) => a.month.localeCompare(b.month));
  // Merge bySource
  const srcMap = new Map<string, number>();
  for (const s of [...ris.bySource, ...rps.bySource]) {
    srcMap.set(s.source, (srcMap.get(s.source) || 0) + s.cnt);
  }
  const bySource = Array.from(srcMap, ([source, cnt]) => ({ source, cnt })).sort((a,b) => b.cnt - a.cnt);
  // Merge byBranch — keep separate since branch IDs are unique
  const branchMap = new Map<number | null, number>();
  for (const b of [...ris.byBranch, ...rps.byBranch]) {
    branchMap.set(b.branchId, (branchMap.get(b.branchId) || 0) + b.cnt);
  }
  const byBranch = Array.from(branchMap, ([branchId, cnt]) => ({ branchId, cnt })).sort((a,b) => b.cnt - a.cnt);
  // Merge byOwner
  const ownerMap = new Map<string | null, number>();
  for (const o of [...ris.byOwner, ...rps.byOwner]) {
    ownerMap.set(o.leadOwner, (ownerMap.get(o.leadOwner) || 0) + o.cnt);
  }
  const byOwner = Array.from(ownerMap, ([leadOwner, cnt]) => ({ leadOwner, cnt })).sort((a,b) => b.cnt - a.cnt);
  // Merge statusBreakdown
  const statusMap = new Map<string, number>();
  for (const s of [...ris.statusBreakdown, ...rps.statusBreakdown]) {
    statusMap.set(s.status, (statusMap.get(s.status) || 0) + s.cnt);
  }
  const statusBreakdown = Array.from(statusMap, ([status, cnt]) => ({ status, cnt })).sort((a,b) => b.cnt - a.cnt);
  return { brand: null, academicYear: "2027-28", kpis, monthly, bySource, byBranch, byOwner, statusBreakdown, generatedAt: ris.generatedAt };
}

function DashboardContent({ stats, branches, tab }: { stats: Stats; branches: Branch[]; tab: BrandTab }) {
  const branchName = (id: number | null) => branches.find(b => b.id === id)?.name || (id ? `Branch #${id}` : "Unassigned");
  const { kpis, monthly, bySource, byBranch, byOwner, statusBreakdown } = stats;
  const convPct = kpis.totalLeads > 0 ? (kpis.admissions / kpis.totalLeads) * 100 : 0;
  const walkInConvPct = kpis.walkins > 0 ? (kpis.admissions / kpis.walkins) * 100 : 0;
  const openLeads = statusBreakdown.filter(s => ["OPEN","FOLLOW-UP"].includes(s.status)).reduce((a,s) => a+s.cnt, 0);
  const primaryColor = tab === "RPS" ? RED : NAVY;

  // Build combined monthly chart for source comparison
  const monthlyChartData = monthly.map(m => ({ name: m.month, Leads: m.cnt }));

  // Source vs branch chart data
  const sourceChartData = bySource.slice(0, 8).map(s => ({
    name: s.source.length > 18 ? s.source.slice(0, 18) + "…" : s.source,
    Leads: s.cnt,
  }));

  return (
    <div className="space-y-8">
      {/* Funnel KPIs */}
      <div>
        <div className="text-lg font-black mb-3" style={{ color: NAVY }}>
          Lead Funnel · {tab === "combined" ? "Combined (RIS + RPS)" : tab} · AY 2027-28
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Leads" value={fmt(kpis.totalLeads)} sub="Enquiries captured" />
          <KpiCard label="Bookings" value={fmt(kpis.bookings)} sub="Scheduled" accent={PURPLE} />
          <KpiCard label="Walk-ins Done" value={fmt(kpis.walkins)} sub="Visited school" accent={BLUE} />
          <KpiCard label="Admissions" value={fmt(kpis.admissions)} sub="Confirmed" accent={GREEN} />
          <KpiCard label="Lead → Adm %" value={pct(convPct)} sub="Conversion rate" accent={AMBER} />
          <KpiCard label="Walk-in → Adm %" value={pct(walkInConvPct)} sub="Visit conversion" accent={AMBER} />
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Open Pipeline" value={fmt(openLeads)} sub="Open + Follow-up" accent={primaryColor} />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Ad Spend</div>
            <div className="text-2xl font-black text-amber-700">Spend: [CONFIRM]</div>
            <div className="text-xs text-amber-500">Connect Google Sheets feed (Task #131)</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Cost per Lead</div>
            <div className="text-2xl font-black text-amber-700">CPL: [CONFIRM]</div>
            <div className="text-xs text-amber-500">Available after spend data</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600">Cost per Admission</div>
            <div className="text-2xl font-black text-amber-700">CPA: [CONFIRM]</div>
            <div className="text-xs text-amber-500">Available after spend data</div>
          </div>
        </div>
      </div>

      {/* Monthly + Status charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Monthly Lead Volume</div>
          {monthlyChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No monthly data yet</div>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Leads" fill={primaryColor} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Leads by Source Channel</div>
          {sourceChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No source data yet</div>
          ) : (
            <div style={{ height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={sourceChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={110} />
                  <Tooltip />
                  <Bar dataKey="Leads" fill={AMBER} radius={[0,3,3,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Source / Branch / Status breakdown */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Source Breakdown</div>
          {bySource.length === 0 ? <div className="text-slate-400 text-sm">No data yet</div> : (
            <div className="space-y-2">
              {bySource.slice(0,10).map(s => (
                <BarPct key={s.source} label={s.source} value={s.cnt} total={bySource.reduce((a,x)=>a+x.cnt,0)} color={primaryColor} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Branch Breakdown</div>
          {byBranch.length === 0 ? <div className="text-slate-400 text-sm">No branch data yet</div> : (
            <div className="space-y-2">
              {byBranch.slice(0,10).map(b => (
                <BarPct key={b.branchId ?? "none"} label={branchName(b.branchId)} value={b.cnt} total={byBranch.reduce((a,x)=>a+x.cnt,0)} color={GREEN} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Pipeline Status</div>
          {statusBreakdown.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          ) : (
            <div style={{ height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={statusBreakdown.map(s => ({ name: s.status, value: s.cnt }))}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ""}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [risStats, setRisStats] = useState<Stats | null>(null);
  const [rpsStats, setRpsStats] = useState<Stats | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [tab, setTab] = useState<BrandTab>("combined");
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/walkin/stats?brand=RIS&ay=2027-28").then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch("/api/walkin/stats?brand=RPS&ay=2027-28").then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch("/api/walkin/branches?active=false").then(r => r.ok ? r.json() : []),
    ]).then(([ris, rps, brs]: [Stats, Stats, Branch[]]) => {
      if (!cancelled.current) { setRisStats(ris); setRpsStats(rps); setBranches(brs); setError(null); setLastFetch(new Date()); }
    }).catch(e => { if (!cancelled.current) setError(String(e)); })
      .finally(() => { if (!cancelled.current) setLoading(false); });
  }, []);

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
        <button onClick={fetchData} className="px-4 py-2 rounded-lg text-white font-semibold" style={{ background: NAVY }}>Retry</button>
      </div>
    </div>
  );
  if (!risStats || !rpsStats) return null;

  const combined = mergeStats(risStats, rpsStats);
  const activeStats = tab === "combined" ? combined : tab === "RIS" ? risStats : rpsStats;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <img src="/images/rainbow-group-logo-2.jpg" alt="Rainbow Group" style={{ height: 42, width: "auto", borderRadius: 8, flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg text-white leading-tight">Marketing Dashboard · AY 2027-28</div>
            <div className="text-xs text-blue-200 flex items-center gap-2">
              Rainbow Group · Lead source & funnel analytics · Live DB
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-blue-200">
          {lastFetch && `Updated: ${lastFetch.toLocaleTimeString()}`}
          {loading && " · refreshing…"}
          <button onClick={fetchData} className="px-3 py-1.5 rounded bg-amber-400 text-[#091a4f] font-bold hover:bg-amber-300">Refresh</button>
          <button onClick={() => { try { sessionStorage.removeItem(AUTH_KEY); } catch {} window.location.reload(); }}
            className="px-3 py-1.5 rounded border border-white/30 text-white/80 hover:bg-white/10">Lock</button>
        </div>
      </div>

      {/* Brand tab bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 py-2">
          {(["combined","RIS","RPS"] as BrandTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition"
              style={{
                background: tab === t ? NAVY : "#f1f5f9",
                color: tab === t ? "#fff" : SLATE,
              }}>
              {t === "combined" ? "Combined" : t === "RIS" ? "🔵 RIS" : "🔴 RPS"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <DashboardContent stats={activeStats} branches={branches} tab={tab} />
        <div className="mt-8 text-center text-xs text-slate-400">
          Live from walkin_leads table · AY 2027-28 · auto-refreshes every 60 seconds
          <a href="/leads" className="ml-3 underline" style={{ color: AMBER }}>Manage Leads →</a>
          <a href="/overview-27-28" className="ml-3 underline" style={{ color: AMBER }}>Group Overview →</a>
        </div>
      </div>
    </div>
  );
}

export default function WalkinMarketing2728() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}
