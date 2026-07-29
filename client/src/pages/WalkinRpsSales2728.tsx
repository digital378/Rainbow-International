import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", PURPLE = "#7c3aed", SLATE = "#475569";
const RPS_GRAD = "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)";
const PIE_COLORS = [RED, AMBER, GREEN, NAVY, BLUE, PURPLE, SLATE, "#0891b2", "#ea580c"];

const PASSCODE = "RPS27";
const AUTH_KEY  = "rps27_sales_auth";

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
};

type Tab = "overview" | "trends" | "analytics" | "counsellors";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview",    label: "Overview"    },
  { id: "trends",      label: "Trends"      },
  { id: "analytics",   label: "Analytics"   },
  { id: "counsellors", label: "Counsellors" },
];

const fmt = (n: number) => n.toLocaleString("en-IN");
const pct = (n: number, d = 1) => `${n.toFixed(d)}%`;

/* ── Passcode Gate ─────────────────────────────── */
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { document.title = "RPS Sales · AY 2027-28"; ref.current?.focus(); }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PASSCODE) { try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {} onSuccess(); }
    else { setError(true); setCode(""); setTimeout(() => setError(false), 600); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: RPS_GRAD }}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400"
        style={{ animation: error ? "shake 0.4s" : undefined }}>
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
        <button type="submit" className="mt-5 w-full py-3 rounded-lg font-bold text-white transition"
          style={{ background: RPS_GRAD }}>Unlock</button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

/* ── Shared UI atoms ───────────────────────────── */
function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SLATE }}>{label}</div>
      <div className="text-3xl font-black mt-1" style={{ color: accent || RED }}>{value}</div>
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

function ChartCard({ title, children, height = 260 }: { title: string; children: React.ReactNode; height?: number }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>{title}</div>
      <div style={{ height }}>
        <ResponsiveContainer>{children as any}</ResponsiveContainer>
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
  return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">{msg}</div>;
}

/* ── Main Dashboard ────────────────────────────── */
function Dashboard() {
  const [data, setData]       = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch("/api/walkin/crm-stats?brand=RPS&ay=2027-28")
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((d: Stats) => { if (!cancelled.current) { setData(d); setError(null); setLastFetch(new Date()); } })
      .catch(e => { if (!cancelled.current) setError(String(e)); })
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

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-red-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Loading RPS 2027-28 data…</p>
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

  const { kpis, monthly, monthlyDetail = [], bySource, byOwner, statusBreakdown, byCounsellor = [], byProgram = [] } = data;
  const openLeads   = statusBreakdown.filter(s => ["OPEN","FOLLOW-UP"].includes(s.status)).reduce((a,s) => a+s.cnt, 0);
  const closedLeads = statusBreakdown.find(s => s.status === "CLOSED")?.cnt ?? 0;
  const convPct     = kpis.totalLeads > 0 ? (kpis.admissions / kpis.totalLeads) * 100 : 0;
  const wiConvPct   = kpis.walkins    > 0 ? (kpis.admissions / kpis.walkins)    * 100 : 0;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* ── Header ── */}
      <div className="px-6 py-5 shadow-lg" style={{ background: RPS_GRAD }}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/images/rps-logo-2.png" alt="RPS" style={{ height: 42, width: "auto", borderRadius: 8, flexShrink: 0 }} />
            <div>
              <div className="text-white font-black text-lg leading-tight">RPS Sales Dashboard · AY 2027-28</div>
              <div className="text-red-100 text-xs flex items-center gap-2">
                Rainbow Preschool · CRM Leads Tracker
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {lastFetch && <div className="text-xs text-red-200">Updated {lastFetch.toLocaleTimeString()}</div>}
            <button onClick={fetchData} disabled={loading} className="text-xs text-red-100 hover:text-white transition px-3 py-1.5 rounded bg-white/20 hover:bg-white/30">↻ Refresh</button>
            <button onClick={() => { try { sessionStorage.removeItem(AUTH_KEY); } catch {} window.location.reload(); }}
              className="text-xs text-red-100 hover:text-white transition px-3 py-1.5 rounded border border-white/30">Lock</button>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="sticky top-0 z-10 border-b border-slate-200 shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 py-2">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition"
              style={{ background: activeTab === t.id ? RED : "#f1f5f9", color: activeTab === t.id ? "#fff" : SLATE }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ════ OVERVIEW TAB ════ */}
        {activeTab === "overview" && <>
          <div>
            <SectionTitle sub="Live from CRM Leads Tracker · AY 2027-28">Lead Funnel · RPS</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <KpiCard label="Total Leads"     value={fmt(kpis.totalLeads)}  sub="All enquiries"    />
              <KpiCard label="Walk-in Booked"  value={fmt(kpis.bookings)}    sub="Scheduled"        accent={PURPLE} />
              <KpiCard label="Walk-in Done"    value={fmt(kpis.walkins)}     sub="Visited school"   accent={BLUE}   />
              <KpiCard label="Admissions"      value={fmt(kpis.admissions)}  sub="Confirmed"        accent={GREEN}  />
              <KpiCard label="Lead → Adm %"    value={pct(convPct)}          sub="Conversion rate"  accent={AMBER}  />
              <KpiCard label="Walk-in → Adm %" value={pct(wiConvPct)}        sub="Visit conversion" accent={AMBER}  />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Open Pipeline" value={fmt(openLeads)}   sub="Open + Follow-up" accent={BLUE} />
              <KpiCard label="Closed"        value={fmt(closedLeads)} sub="Not proceeding"   accent={RED}  />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {monthly.length === 0
              ? <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"><Empty msg="No monthly data yet" /></div>
              : <ChartCard title="Monthly Lead Volume">
                  <BarChart data={monthly.map(m => ({ name: m.month, Leads: m.cnt }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="Leads" fill={RED} radius={[3,3,0,0]} />
                  </BarChart>
                </ChartCard>
            }
            {statusBreakdown.length === 0
              ? <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"><Empty msg="No status data yet" /></div>
              : <ChartCard title="Status Breakdown">
                  <PieChart>
                    <Pie data={statusBreakdown.map(s => ({ name: s.status, value: s.cnt }))}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                      label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ChartCard>
            }
          </div>
        </>}

        {/* ════ TRENDS TAB ════ */}
        {activeTab === "trends" && <>
          <SectionTitle sub="Month-by-month lead and admission volumes">Monthly Trends</SectionTitle>
          {monthlyDetail.length === 0 ? <Empty msg="No trend data yet — leads will appear here once the CRM sheet is populated" /> : <>
            <ChartCard title="Leads vs Admissions by Month" height={320}>
              <ComposedChart data={monthlyDetail.map(m => ({ name: m.month, Leads: m.leads, "Walk-ins": m.walkins, Admissions: m.admissions }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar  dataKey="Leads"      fill={RED}   radius={[3,3,0,0]} />
                <Bar  dataKey="Walk-ins"   fill={BLUE}  radius={[3,3,0,0]} />
                <Line dataKey="Admissions" stroke={GREEN} strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ChartCard>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="text-sm font-bold" style={{ color: NAVY }}>Month-by-Month Breakdown</div>
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
                    {[...monthlyDetail].reverse().map(m => {
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
                      <td className="px-4 py-3" style={{ color: NAVY }}>Total</td>
                      <td className="px-4 py-3 text-right tabular-nums">{fmt(kpis.totalLeads)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(kpis.walkins)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: GREEN }}>{fmt(kpis.admissions)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: RED }}>{fmt(closedLeads)}</td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: AMBER }}>{pct(convPct)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>}
        </>}

        {/* ════ ANALYTICS TAB ════ */}
        {activeTab === "analytics" && <>
          <SectionTitle sub="Lead distribution by source and programme">Analytics</SectionTitle>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="text-sm font-bold mb-4" style={{ color: NAVY }}>By Source</div>
              {bySource.length === 0 ? <Empty /> : (
                <div className="space-y-2.5">
                  {bySource.map(s => (
                    <BarPct key={s.source} label={s.source} value={s.cnt}
                      total={bySource.reduce((a,x) => a+x.cnt, 0)} color={RED} />
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
            <ChartCard title="Leads by Programme / Grade" height={Math.max(220, byProgram.length * 32)}>
              <BarChart layout="vertical" data={byProgram.map(p => ({ name: p.program, Leads: p.cnt }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Leads" fill={RED} radius={[0,3,3,0]} />
              </BarChart>
            </ChartCard>
          )}

          {bySource.length > 0 && (
            <ChartCard title="Source Distribution" height={260}>
              <PieChart>
                <Pie data={bySource.map(s => ({ name: s.source, value: s.cnt }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {bySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ChartCard>
          )}
        </>}

        {/* ════ COUNSELLORS TAB ════ */}
        {activeTab === "counsellors" && <>
          <SectionTitle sub="Per-counsellor lead and conversion performance">Counsellor Leaderboard</SectionTitle>
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
                        <td className="px-4 py-3" colSpan={2} style={{ color: NAVY }}>Total</td>
                        <td className="px-4 py-3 text-right tabular-nums">{fmt(kpis.totalLeads)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(kpis.walkins)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: GREEN }}>{fmt(kpis.admissions)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: BLUE }}>{fmt(openLeads)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: RED }}>{fmt(closedLeads)}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: AMBER }}>{pct(convPct)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )
          }
        </>}

        <div className="text-center text-xs text-slate-400">
          Live from CRM Leads Tracker · AY 2027-28 · RPS · auto-refreshes every 60 s
          <a href="/overview-27-28" className="ml-3 underline" style={{ color: RED }}>Group Overview →</a>
          <a href="/marketing-27-28" className="ml-3 underline" style={{ color: RED }}>Marketing →</a>
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
