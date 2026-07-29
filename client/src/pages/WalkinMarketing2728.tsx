import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line,
} from "recharts";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", PURPLE = "#7c3aed", SLATE = "#475569";
const PIE_COLORS = [NAVY, RED, AMBER, GREEN, BLUE, PURPLE, SLATE, "#0891b2", "#ea580c"];

const PASSCODE = "MKT27";
const AUTH_KEY  = "mkt27_auth";

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
  };
}

/* ── Passcode Gate ─────────────────────────────── */
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { document.title = "Marketing · AY 2027-28"; ref.current?.focus(); }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PASSCODE) { try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {} onSuccess(); }
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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-2xl font-black mt-1" style={{ color: accent || NAVY }}>{value}</div>
      {sub && <div className="text-xs mt-1 text-slate-500">{sub}</div>}
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
  return <div className="h-40 flex items-center justify-center text-slate-400 text-sm">{msg}</div>;
}

/* ── Dashboard content (inner tabs) ───────────── */
function DashboardContent({ stats, brandTab }: { stats: Stats; brandTab: BrandTab }) {
  const [tab, setTab] = useState<InnerTab>("overview");
  const primary = brandTab === "RPS" ? RED : NAVY;

  const { kpis, monthly, monthlyDetail = [], bySource, byOwner, statusBreakdown, byCounsellor = [], byProgram = [] } = stats;
  const openLeads   = statusBreakdown.filter(s => ["OPEN","FOLLOW-UP"].includes(s.status)).reduce((a,s) => a+s.cnt, 0);
  const closedLeads = statusBreakdown.find(s => s.status === "CLOSED")?.cnt ?? 0;
  const convPct     = kpis.totalLeads > 0 ? (kpis.admissions / kpis.totalLeads) * 100 : 0;
  const wiConvPct   = kpis.walkins    > 0 ? (kpis.admissions / kpis.walkins)    * 100 : 0;
  const brandLabel  = brandTab === "combined" ? "Combined (RIS + RPS)" : brandTab;

  return (
    <div className="space-y-8">
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

      {/* ════ OVERVIEW ════ */}
      {tab === "overview" && <>
        <div>
          <div className="text-base font-black mb-3" style={{ color: NAVY }}>Lead Funnel · {brandLabel} · AY 2027-28</div>
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
                  <Bar dataKey="Leads" fill={primary} radius={[3,3,0,0]} />
                </BarChart>
              </ChartCard>
          }
          {statusBreakdown.length === 0
            ? <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"><Empty msg="No status data yet" /></div>
            : <ChartCard title="Status Breakdown">
                <PieChart>
                  <Pie data={statusBreakdown.map(s => ({ name: s.status, value: s.cnt }))}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ChartCard>
          }
        </div>
      </>}

      {/* ════ TRENDS ════ */}
      {tab === "trends" && <>
        {monthlyDetail.length === 0 ? <Empty msg="No trend data yet — leads will appear once the CRM sheet is populated" /> : <>
          <ChartCard title={`Leads vs Admissions by Month · ${brandLabel}`} height={320}>
            <ComposedChart data={monthlyDetail.map(m => ({ name: m.month, Leads: m.leads, "Walk-ins": m.walkins, Admissions: m.admissions }))}>
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
              <div className="text-sm font-bold" style={{ color: NAVY }}>Month-by-Month Breakdown · {brandLabel}</div>
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

      {/* ════ ANALYTICS ════ */}
      {tab === "analytics" && <>
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
    </div>
  );
}

/* ── Main Dashboard shell ──────────────────────── */
function Dashboard() {
  const [risStats, setRisStats] = useState<Stats | null>(null);
  const [rpsStats, setRpsStats] = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [brandTab, setBrandTab] = useState<BrandTab>("combined");
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/walkin/crm-stats?brand=RIS&ay=2027-28").then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch("/api/walkin/crm-stats?brand=RPS&ay=2027-28").then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
    ]).then(([ris, rps]: [Stats, Stats]) => {
      if (!cancelled.current) { setRisStats(ris); setRpsStats(rps); setError(null); setLastFetch(new Date()); }
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

  const combined    = mergeStats(risStats, rpsStats);
  const activeStats = brandTab === "combined" ? combined : brandTab === "RIS" ? risStats : rpsStats;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
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
          <button onClick={fetchData} className="px-3 py-1.5 rounded bg-amber-400 text-[#091a4f] font-bold hover:bg-amber-300">Refresh</button>
          <button onClick={() => { try { sessionStorage.removeItem(AUTH_KEY); } catch {} window.location.reload(); }}
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
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <Dashboard />;
}
