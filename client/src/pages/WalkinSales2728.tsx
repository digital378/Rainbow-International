import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", PURPLE = "#7c3aed", SLATE = "#475569";
const PIE_COLORS = [NAVY, AMBER, GREEN, BLUE, PURPLE, RED, SLATE, "#0891b2", "#ea580c"];

const PASSCODE = "RIS27";
const AUTH_KEY  = "ris27_sales_auth";

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
  useEffect(() => { document.title = "RIS Sales · AY 2027-28"; ref.current?.focus(); }, []);
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
          <img src="/images/ris-logo-2.png" alt="RIS" style={{ height: 48, width: "auto", flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg text-[#091a4f]">RIS Sales · AY 2027-28</div>
            <div className="text-xs text-slate-500">Internal · Passcode required</div>
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
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SLATE }}>{label}</div>
      <div className="text-3xl font-black mt-1" style={{ color: accent || NAVY }}>{value}</div>
      {sub && <div className="text-xs mt-1 text-slate-500">{sub}</div>}
    </div>
  );
}

function Dashboard() {
  const [data, setData]   = useState<Stats | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/walkin/stats?brand=RIS&ay=2027-28").then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch("/api/walkin/branches?active=false").then(r => r.ok ? r.json() : []),
    ]).then(([stats, brs]: [Stats, Branch[]]) => {
      if (!cancelled.current) { setData(stats); setBranches(brs); setError(null); setLastFetch(new Date()); }
    }).catch(e => { if (!cancelled.current) setError(String(e)); })
      .finally(() => { if (!cancelled.current) setLoading(false); });
  }, []);

  useEffect(() => {
    document.title = "RIS Sales · AY 2027-28";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchData();
    const iv = setInterval(fetchData, 60_000);
    return () => { cancelled.current = true; clearInterval(iv); };
  }, [fetchData]);

  const branchName = (id: number | null) => branches.find(b => b.id === id)?.name || (id ? `Branch #${id}` : "Unassigned");

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f1f5f9" }}>
      <div className="text-slate-500">Loading 27-28 data…</div>
    </div>
  );
  if (error && !data) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f1f5f9" }}>
      <div className="bg-white rounded-xl p-8 max-w-md shadow border border-red-200">
        <div className="text-red-600 font-bold mb-2">Failed to load data</div>
        <div className="text-sm text-slate-600 mb-4">{error}</div>
        <button onClick={fetchData} className="px-4 py-2 rounded-lg text-white font-semibold" style={{ background: NAVY }}>Retry</button>
      </div>
    </div>
  );
  if (!data) return null;

  const { kpis, monthly, bySource, byBranch, byOwner, statusBreakdown } = data;
  const openLeads = statusBreakdown.filter(s => ["OPEN", "FOLLOW-UP"].includes(s.status)).reduce((a, s) => a + s.cnt, 0);
  const closedLeads = statusBreakdown.find(s => s.status === "CLOSED")?.cnt ?? 0;
  const convPct = kpis.totalLeads > 0 ? (kpis.admissions / kpis.totalLeads) * 100 : 0;
  const walkInConvPct = kpis.walkins > 0 ? (kpis.admissions / kpis.walkins) * 100 : 0;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* Top bar */}
      <div className="py-4 px-6 flex flex-wrap items-center justify-between gap-3 border-b-4 border-amber-400" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <img src="/images/ris-logo-2.png" alt="RIS" style={{ height: 40, width: "auto", flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg text-white leading-tight">RIS Sales Dashboard · AY 2027-28</div>
            <div className="text-xs text-blue-200 flex items-center gap-2">
              Live from DB · Rainbow International School
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

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* KPI Row */}
        <div>
          <div className="text-xl font-black mb-4" style={{ color: NAVY }}>AY 2027-28 Funnel</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard label="Total Leads" value={fmt(kpis.totalLeads)} sub="Walk-in enquiries" />
            <KpiCard label="Walk-in Booked" value={fmt(kpis.bookings)} sub="Scheduled visits" accent={PURPLE} />
            <KpiCard label="Walk-in Done" value={fmt(kpis.walkins)} sub="Completed visits" accent={BLUE} />
            <KpiCard label="Admissions" value={fmt(kpis.admissions)} sub="Confirmed done" accent={GREEN} />
            <KpiCard label="Conversion %" value={pct(convPct)} sub="Admissions / Leads" accent={AMBER} />
            <KpiCard label="Walk-in Conv. %" value={pct(walkInConvPct)} sub="Admissions / Walk-ins" accent={AMBER} />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Open Pipeline" value={fmt(openLeads)} sub="Open + Follow-up" accent={BLUE} />
            <KpiCard label="Closed" value={fmt(closedLeads)} sub="Not proceeding" accent={RED} />
            {statusBreakdown.filter(s => !["OPEN","FOLLOW-UP","CLOSED"].includes(s.status)).slice(0,2).map(s => (
              <KpiCard key={s.status} label={s.status} value={fmt(s.cnt)} />
            ))}
          </div>
        </div>

        {/* Monthly trend + Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Monthly Lead Volume</div>
            {monthly.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
            ) : (
              <div style={{ height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={monthly.map(m => ({ name: m.month, Leads: m.cnt }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="Leads" fill={NAVY} radius={[3,3,0,0]} />
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
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                      {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Source + Owner + Branch */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* By Source */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>By Source</div>
            {bySource.length === 0 ? <div className="text-slate-400 text-sm">No data yet</div> : (
              <div className="space-y-2">
                {bySource.slice(0, 8).map(s => {
                  const total = bySource.reduce((a, x) => a + x.cnt, 0);
                  const p = total > 0 ? Math.round(s.cnt / total * 100) : 0;
                  return (
                    <div key={s.source}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-slate-700 truncate max-w-[140px]">{s.source}</span>
                        <span className="font-bold tabular-nums" style={{ color: NAVY }}>{s.cnt} <span className="text-slate-400 font-normal">({p}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p}%`, background: NAVY }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By Owner / Counsellor */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>By Lead Owner</div>
            {byOwner.length === 0 ? <div className="text-slate-400 text-sm">No owners assigned yet</div> : (
              <div className="space-y-2">
                {byOwner.filter(o => o.leadOwner).slice(0, 8).map(o => {
                  const total = byOwner.reduce((a, x) => a + x.cnt, 0);
                  const p = total > 0 ? Math.round(o.cnt / total * 100) : 0;
                  return (
                    <div key={o.leadOwner || "unassigned"}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-slate-700 truncate max-w-[140px]">{o.leadOwner || "Unassigned"}</span>
                        <span className="font-bold tabular-nums" style={{ color: NAVY }}>{o.cnt} <span className="text-slate-400 font-normal">({p}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p}%`, background: AMBER }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By Branch */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>By Branch</div>
            {byBranch.length === 0 ? <div className="text-slate-400 text-sm">No branch data yet</div> : (
              <div className="space-y-2">
                {byBranch.slice(0, 8).map(b => {
                  const total = byBranch.reduce((a, x) => a + x.cnt, 0);
                  const p = total > 0 ? Math.round(b.cnt / total * 100) : 0;
                  return (
                    <div key={b.branchId ?? "none"}>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-slate-700 truncate max-w-[140px]">{branchName(b.branchId)}</span>
                        <span className="font-bold tabular-nums" style={{ color: NAVY }}>{b.cnt} <span className="text-slate-400 font-normal">({p}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p}%`, background: GREEN }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-xs text-slate-400">
          Data from AY 2027-28 walkin_leads table · RIS only · auto-refreshes every 60 seconds
          <a href="/leads" className="ml-3 underline" style={{ color: AMBER }}>Manage Leads →</a>
        </div>
      </div>
    </div>
  );
}

export default function WalkinSales2728() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}
