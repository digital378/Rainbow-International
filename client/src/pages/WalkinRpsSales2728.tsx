import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", PURPLE = "#7c3aed", SLATE = "#475569";
const PIE_COLORS = [RED, AMBER, GREEN, NAVY, BLUE, PURPLE, SLATE, "#0891b2", "#ea580c"];

const PASSCODE = "RPS27";
const AUTH_KEY  = "rps27_sales_auth";

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

type Branch = { id: number; name: string; code: string };

const fmt = (n: number) => n.toLocaleString("en-IN");
const pct = (n: number) => `${n.toFixed(1)}%`;

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { document.title = "RPS Sales · AY 2027-28"; ref.current?.focus(); }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PASSCODE) {
      try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else { setError(true); setCode(""); setTimeout(() => setError(false), 600); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" }}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400" style={{ animation: error ? "shake 0.4s" : undefined }}>
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/rps-logo-2.png" alt="RPS" style={{ height: 48, width: "auto", flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg text-[#091a4f]">RPS Sales · AY 2027-28</div>
            <div className="text-xs text-slate-500">Internal · Passcode required</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input ref={ref} type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.4em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-red-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          placeholder="••••" />
        {error && <div className="mt-2 text-sm text-red-600 text-center">Incorrect passcode</div>}
        <button type="submit" className="mt-5 w-full py-3 rounded-lg font-bold text-white transition" style={{ background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" }}>Unlock</button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SLATE }}>{label}</div>
      <div className="text-3xl font-black mt-1" style={{ color: accent || "#991b1b" }}>{value}</div>
      {sub && <div className="text-xs mt-1 text-slate-500">{sub}</div>}
    </div>
  );
}

function BarPct({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const p = total > 0 ? Math.round(value / total * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="font-medium text-slate-700 truncate max-w-[140px]">{label}</span>
        <span className="font-bold tabular-nums" style={{ color: NAVY }}>{value} <span className="text-slate-400 font-normal">({p}%)</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
      </div>
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState<Stats | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/walkin/crm-stats?brand=RPS&ay=2027-28").then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch("/api/walkin/branches?active=false").then(r => r.ok ? r.json() : []),
    ]).then(([stats, brs]: [Stats, Branch[]]) => {
      if (!cancelled.current) { setData(stats); setBranches(brs); setError(null); setLastFetch(new Date()); }
    }).catch(e => { if (!cancelled.current) setError(String(e)); })
      .finally(() => { if (!cancelled.current) setLoading(false); });
  }, []);

  useEffect(() => {
    document.title = "RPS Sales · AY 2027-28";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchData();
    const iv = setInterval(fetchData, 60_000);
    return () => { cancelled.current = true; clearInterval(iv); };
  }, [fetchData]);

  const branchName = (id: number | null) => branches.find(b => b.id === id)?.name || (id ? `Branch #${id}` : "Unassigned");

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Loading RPS 27-28 data…</p>
      </div>
    </div>
  );
  if (error && !data) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f8fafc" }}>
      <div className="bg-white rounded-xl p-8 max-w-md shadow border border-red-200">
        <div className="text-red-600 font-bold mb-2">Failed to load data</div>
        <div className="text-sm text-slate-600 mb-4">{error}</div>
        <button onClick={fetchData} className="px-4 py-2 rounded-lg text-white font-semibold" style={{ background: RED }}>Retry</button>
      </div>
    </div>
  );
  if (!data) return null;

  const { kpis, monthly, bySource, byBranch, byOwner, statusBreakdown } = data;
  const openLeads = statusBreakdown.filter(s => ["OPEN","FOLLOW-UP"].includes(s.status)).reduce((a, s) => a + s.cnt, 0);
  const closedLeads = statusBreakdown.find(s => s.status === "CLOSED")?.cnt ?? 0;
  const convPct = kpis.totalLeads > 0 ? (kpis.admissions / kpis.totalLeads) * 100 : 0;
  const walkInConvPct = kpis.walkins > 0 ? (kpis.admissions / kpis.walkins) * 100 : 0;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Header */}
      <div className="px-6 py-5 shadow-lg" style={{ background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/rps-logo-2.png" alt="RPS" style={{ height: 42, width: "auto", borderRadius: 8, flexShrink: 0 }} />
            <div>
              <div className="text-white font-black text-lg leading-tight">RPS Sales Dashboard · AY 2027-28</div>
              <div className="text-red-100 text-xs flex items-center gap-2">
                Rainbow Preschool · Live from CRM Leads Tracker
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {lastFetch && <div className="text-xs text-red-200">Updated {lastFetch.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>}
            <button onClick={fetchData} disabled={loading} className="text-xs text-red-100 hover:text-white transition px-3 py-1.5 rounded bg-white/20 hover:bg-white/30">↻ Refresh</button>
            <button onClick={() => { try { sessionStorage.removeItem(AUTH_KEY); } catch {} window.location.reload(); }}
              className="text-xs text-red-100 hover:text-white transition px-3 py-1.5 rounded border border-white/30">Lock</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* KPIs */}
        <div>
          <div className="text-xl font-black mb-4" style={{ color: NAVY }}>AY 2027-28 Funnel · RPS</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard label="Total Leads" value={fmt(kpis.totalLeads)} sub="Walk-in enquiries" />
            <KpiCard label="Bookings" value={fmt(kpis.bookings)} sub="Scheduled visits" accent={PURPLE} />
            <KpiCard label="Walk-ins Done" value={fmt(kpis.walkins)} sub="Completed visits" accent={BLUE} />
            <KpiCard label="Admissions" value={fmt(kpis.admissions)} sub="Confirmed done" accent={GREEN} />
            <KpiCard label="Conversion %" value={pct(convPct)} sub="Admissions / Leads" accent={AMBER} />
            <KpiCard label="Walk-in Conv. %" value={pct(walkInConvPct)} sub="Admissions / Walk-ins" accent={AMBER} />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <KpiCard label="Open Pipeline" value={fmt(openLeads)} sub="Open + Follow-up" accent={BLUE} />
            <KpiCard label="Closed" value={fmt(closedLeads)} sub="Not proceeding" accent={RED} />
          </div>
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Monthly Lead Volume</div>
            {monthly.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet for AY 2027-28</div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={monthly.map(m => ({ name: m.month, Leads: m.cnt }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="Leads" fill={RED} radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Status Breakdown</div>
            {statusBreakdown.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={statusBreakdown.map(s => ({ name: s.status, value: s.cnt }))}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}>
                      {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Source / Owner / Branch breakdown bars */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>By Source</div>
            {bySource.length === 0 ? <div className="text-slate-400 text-sm">No data yet</div> : (
              <div className="space-y-2">
                {bySource.slice(0,8).map(s => (
                  <BarPct key={s.source} label={s.source} value={s.cnt} total={bySource.reduce((a,x) => a+x.cnt,0)} color={RED} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>By Lead Owner</div>
            {byOwner.filter(o => o.leadOwner).length === 0 ? <div className="text-slate-400 text-sm">No owners assigned yet</div> : (
              <div className="space-y-2">
                {byOwner.filter(o => o.leadOwner).slice(0,8).map(o => (
                  <BarPct key={o.leadOwner!} label={o.leadOwner!} value={o.cnt} total={byOwner.reduce((a,x) => a+x.cnt,0)} color={AMBER} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>By Branch</div>
            {byBranch.length === 0 ? <div className="text-slate-400 text-sm">No branch data yet</div> : (
              <div className="space-y-2">
                {byBranch.slice(0,8).map(b => (
                  <BarPct key={b.branchId ?? "none"} label={branchName(b.branchId)} value={b.cnt} total={byBranch.reduce((a,x) => a+x.cnt,0)} color={GREEN} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Live from CRM Leads Tracker · AY 2027-28 · RPS only · auto-refreshes every 60 seconds
          <a href="/leads" className="ml-3 underline" style={{ color: RED }}>Manage Leads →</a>
        </div>
      </div>
    </div>
  );
}

export default function WalkinRpsSales2728() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}
