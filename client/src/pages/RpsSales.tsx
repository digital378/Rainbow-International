import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  ComposedChart, Area, ReferenceLine,
} from "recharts";

/* ── Colours ──────────────────────────────────────────────────────────────── */
const NAVY   = "#091a4f", AMBER  = "#f59e0b", GREEN  = "#059669", RED    = "#dc2626";
const BLUE   = "#2563eb", CYAN   = "#0891b2", PURPLE = "#7c3aed", SLATE  = "#475569";
const PIE_COLORS = [NAVY, AMBER, GREEN, BLUE, CYAN, PURPLE, RED, SLATE, "#ea580c", "#0ea5e9", "#16a34a", "#a855f7"];

/* ── Fee rules (v2.4) ─────────────────────────────────────────────────────── */
const FEE_RULES: Record<string, { oneTime: number; annual: number }> = {
  Kalwa:   { oneTime: 0,    annual: 60000 },
  default: { oneTime: 5000, annual: 80000 },
};
function feeFor(branch: string) {
  const r = FEE_RULES[branch] ?? FEE_RULES.default;
  return r.oneTime + r.annual;
}

/* ── Formatters ───────────────────────────────────────────────────────────── */
const INR   = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtL  = (n: number) => n >= 1e7 ? `₹${(n/1e7).toFixed(2)}Cr` : n >= 1e5 ? `₹${(n/1e5).toFixed(1)}L` : INR(n);
const fmt   = (n: number) => n.toLocaleString("en-IN");
const pct   = (n: number) => `${n.toFixed(n >= 100 ? 0 : 1)}%`;

/* ── Auth ─────────────────────────────────────────────────────────────────── */
const RPS_PASSCODE = "RPS8";
const RPS_AUTH_KEY = "rps_sales_auth";

/* ── Types ────────────────────────────────────────────────────────────────── */
type MarketingMonth = { monthKey: string; label: string; salaries: number; meta: number; google: number; adSpend: number; total: number };

type RpsData = {
  generatedAt: string;
  kpis: {
    totalEnquiries: number; totalAdmissions: number; totalAdmRIS: number;
    openEnquiries: number; closedTotal: number; inProcess: number;
    futureProspect: number; overallConversion: number;
    thisMonthEnquiries: number; thisMonthAdm: number;
  };
  byMonth:  Array<{ monthKey: string; label: string; enquiries: number; admissions: number }>;
  byBranch: Array<{ branch: string; enquiries: number; admissions: number; open: number; closed: number; conversion: number }>;
  bySource: Array<{ source: string; enquiries: number; admissions: number }>;
  monthlyDetail: Array<{ monthKey: string; label: string; enquiries: number; admissions: number; branches: Record<string, { enquiries: number; admissions: number }>; sources: Record<string, { enquiries: number; admissions: number }> }>;
  byGrade:  Array<{ grade: string; count: number }>;
  counselorLeaderboard: Array<{ counselor: string; admDone: number; admRIS: number; closed: number; open: number; inProcess: number; futureProspect: number; total: number; conversion: number }>;
  closedReasons:   Array<{ reason: string; count: number }>;
  recentEnquiries: Array<{ date: string; name: string; grade: string; branch: string; counselor: string; source: string; status: string }>;
  dmPipeline: {
    admitted: number; open: number; closed: number; convMedianDays: number;
    byBranch:     Array<{ branch: string; admitted: number; open: number; closed: number }>;
    byConfidence: Array<{ confidence: string; count: number }>;
    ageing:       Array<{ bucket: string; count: number; pct: number }>;
    counselors:   Array<{ counselor: string; open: number; admitted: number; closed: number; avgConvDays: number; total: number; conv: number }>;
    confByBranch: Array<{ branch: string; High: number; Medium: number; Low: number }>;
  };
  misHistory:      Array<{ date: string; walkins: number; admissions: number; gap: number }>;
  leadTime:        { median: number; p90: number; histogram: Array<{ bucket: string; count: number }>; sampleSize: number };
  ageingBuckets:   Array<{ bucket: string; count: number; pct: number }>;
  counselorFunnel: Array<{ counselor: string; enquiries: number; counselled: number; toured: number; admitted: number }>;
  closedReasonTrend: { months: string[]; monthKeys: string[]; data: Array<{ reason: string; counts: Record<string, number> }> };
  forecastSeries:  Array<{ label: string; actual?: number; projected?: number }>;
  dCohort:         Array<{ week: string; walkins: number; admDone: number; convPct: number; avgDays: number; b0_3: number; b4_7: number; b8_14: number; b15p: number }>;
  branchClosedList: Array<{ branch: string; reason: string; count: number }>;
  branchSrcAdm:    Array<{ branch: string; brandTieup: number; directWalkin: number; dm: number; referral: number; sibling: number; total: number }>;
  branchOpenPipeline: Array<{ branch: string; directWalkin: number; dm: number; referral: number; total: number }>;
};

/* ── Passcode Gate ────────────────────────────────────────────────────────── */
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { document.title = "RPS Sales Dashboard"; ref.current?.focus(); }, []);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === RPS_PASSCODE) { try { sessionStorage.setItem(RPS_AUTH_KEY, "1"); } catch {} onSuccess(); }
    else { setError(true); setCode(""); setTimeout(() => setError(false), 600); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }}>
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-amber-400">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-md bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-base">RPS</div>
          <div><div className="font-black text-lg leading-tight text-[#091a4f]">RPS Sales Dashboard</div><div className="text-xs text-slate-500">Internal · Passcode required</div></div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input ref={ref} type="password" autoComplete="off" value={code} onChange={e => setCode(e.target.value)}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.4em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-500 bg-red-50" : "border-slate-300"}`}
          placeholder="••••" />
        {error && <div className="mt-2 text-sm text-red-600 text-center">Incorrect passcode</div>}
        <button type="submit" className="mt-5 w-full py-3 rounded-lg bg-[#091a4f] text-white font-bold hover:bg-[#0b2168] transition">Unlock</button>
      </form>
    </div>
  );
}

export default function RpsSales() {
  const [authed, setAuthed] = useState<boolean>(() => { try { return sessionStorage.getItem(RPS_AUTH_KEY) === "1"; } catch { return false; } });
  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  return <RpsDashboard />;
}

/* ── Shared sub-components ────────────────────────────────────────────────── */
function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-black tracking-tight" style={{ color: NAVY }}>{children}</h2>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function ChartCard({ title, children, action, height = 280 }: { title: string; children: React.ReactNode; action?: React.ReactNode; height?: number }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-bold" style={{ color: NAVY }}>{title}</div>
        {action}
      </div>
      <div style={{ width: "100%", height }}><ResponsiveContainer>{children as any}</ResponsiveContainer></div>
    </div>
  );
}

function KpiCard({ label, value, sub, accent, highlight, badge }: { label: string; value: string | number; sub?: string; accent?: string; highlight?: boolean; badge?: string }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border ${highlight ? "border-amber-400 border-2" : "border-slate-200"}`}>
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: SLATE }}>{label}</div>
      <div className="text-3xl font-black mt-1 leading-tight" style={{ color: accent || NAVY }}>{value}</div>
      {sub && <div className="text-xs mt-1 text-slate-500">{sub}</div>}
      {badge && <span className="mt-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">{badge}</span>}
    </div>
  );
}

function AgeingBars({ buckets, colors }: { buckets: Array<{ bucket: string; count: number; pct: number }>; colors: string[] }) {
  return (
    <div className="space-y-3">
      {buckets.map((b, i) => (
        <div key={b.bucket} className="flex items-center gap-3">
          <span className="w-24 text-sm font-semibold text-slate-700 text-right">{b.bucket}</span>
          <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
            <div className="h-full rounded-full flex items-center px-3 text-white text-xs font-bold"
              style={{ width: `${Math.max(b.pct, 4)}%`, background: colors[i] || NAVY }}>
              {b.count} ({b.pct}%)
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HeatCell({ value, max }: { value: number; max: number }) {
  const t = max > 0 ? value / max : 0;
  const bg = t === 0 ? "#f8fafc" : t < 0.25 ? "#fecaca" : t < 0.5 ? "#f87171" : t < 0.75 ? "#ef4444" : "#b91c1c";
  return (
    <div className="w-10 h-9 flex items-center justify-center rounded text-xs font-bold"
      style={{ background: bg, color: t > 0.4 ? "#fff" : "#374151" }}>
      {value || ""}
    </div>
  );
}

function csvDownload(filename: string, headers: string[], rows: (string | number)[][]) {
  const lines = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
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

/* ── Revenue calculations (pure, v2.4) ───────────────────────────────────── */
function calcRevenue(d: RpsData, mktData: MarketingMonth[]) {
  // Recognised revenue per branch
  const recByBranch = d.byBranch.map(b => ({ branch: b.branch, admissions: b.admissions, revenue: b.admissions * feeFor(b.branch) }));
  const totalRev    = recByBranch.reduce((s, b) => s + b.revenue, 0);
  const totalAdm    = recByBranch.reduce((s, b) => s + b.admissions, 0);
  const avgFee      = totalAdm > 0 ? totalRev / totalAdm : 85000;

  // Marketing spend (salaries + ad spend)
  const totalSpend  = mktData.reduce((s, m) => s + m.total, 0);
  const cac         = totalAdm > 0 ? totalSpend / totalAdm : 0;
  const roi         = totalSpend > 0 ? (totalRev - totalSpend) / totalSpend * 100 : 0;

  // Projected Revenue: confidence-weighted open DM leads × fee per branch
  const projectedRev = d.dmPipeline.confByBranch.reduce((sum, b) => {
    const f = feeFor(b.branch);
    return sum + f * (b.High * 0.7 + b.Medium * 0.4 + b.Low * 0.1);
  }, 0);

  // Branch revenue table (spend allocated proportionally)
  const branchTable = recByBranch.map(b => {
    const spend   = totalAdm > 0 ? totalSpend * (b.admissions / totalAdm) : 0;
    const brROI   = spend > 0 ? (b.revenue - spend) / spend * 100 : 0;
    const brCAC   = b.admissions > 0 ? spend / b.admissions : 0;
    return { ...b, spend, roi: brROI, cac: brCAC };
  });

  // Monthly revenue trend joined with spend (monthKey "YYYY-MM" matches on both sides)
  const spendMap = Object.fromEntries(mktData.map(m => [m.monthKey, m.total]));
  let cumNet = 0;
  let paybackLabel: string | null = null;
  const trend = d.byMonth.map(m => {
    const rev  = Math.round(m.admissions * avgFee);
    const spnd = spendMap[m.monthKey] ?? 0;
    cumNet += rev - spnd;
    const snap = cumNet;
    if (!paybackLabel && snap >= 0) paybackLabel = m.label;
    return { label: m.label, monthKey: m.monthKey, revenue: rev, spend: spnd, cumNet: snap };
  });

  return { totalRev, totalAdm, avgFee, totalSpend, cac, roi, projectedRev, branchTable, trend, paybackLabel };
}

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
function RpsDashboard() {
  const [data,    setData]    = useState<RpsData | null>(null);
  const [mktData, setMktData] = useState<MarketingMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"analytics"|"revenue"|"pipeline"|"counselors"|"leads">("overview");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // null = All Time; value = monthKey "YYYY-MM"
  const cancelled = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/rps-sales/live").then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch("/api/marketing/monthly").then(r => r.ok ? r.json() : Promise.resolve([])),
    ])
      .then(([rps, mkt]: [RpsData, MarketingMonth[]]) => {
        if (!cancelled.current) { setData(rps); setMktData(mkt); setError(null); setLastFetch(new Date()); }
      })
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

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">Loading RPS data from Google Sheets…</p>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8fafc" }}>
      <div className="bg-white rounded-xl p-8 shadow text-center max-w-md">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="font-bold text-slate-800 mb-2">Failed to load data</p>
        <p className="text-slate-500 text-sm mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-lg text-white font-bold" style={{ background: NAVY }}>Retry</button>
      </div>
    </div>
  );

  const d = data!;
  const rev = calcRevenue(d, mktData);

  // ── Month filter helpers ────────────────────────────────────────────────────
  const monthDet = selectedMonth
    ? (d.monthlyDetail || []).find(m => m.monthKey === selectedMonth) ?? null
    : null;
  const filtBranch = monthDet
    ? Object.entries(monthDet.branches)
        .map(([branch, v]) => ({ branch, ...v, open: 0, closed: 0, conversion: v.enquiries ? Math.round(v.admissions / v.enquiries * 1000) / 10 : 0 }))
        .sort((a, b) => b.admissions - a.admissions)
    : d.byBranch;
  const filtSource = monthDet
    ? Object.entries(monthDet.sources)
        .map(([source, v]) => ({ source, ...v }))
        .sort((a, b) => b.enquiries - a.enquiries)
    : d.bySource;
  const filtKpis = monthDet
    ? { ...d.kpis, totalEnquiries: monthDet.enquiries, totalAdmissions: monthDet.admissions, totalAdmRIS: 0, openEnquiries: 0, closedTotal: 0, inProcess: 0, futureProspect: 0, overallConversion: monthDet.enquiries ? Math.round(monthDet.admissions / monthDet.enquiries * 1000) / 10 : 0, thisMonthEnquiries: monthDet.enquiries, thisMonthAdm: monthDet.admissions }
    : d.kpis;
  // Filter recent leads by month label (date format: "15 May 26"; label: "May 26")
  const filtLeads = monthDet
    ? d.recentEnquiries.filter(e => e.date.includes(monthDet.label))
    : d.recentEnquiries.slice(0, 20);
  // Month-specific counsellor leaderboard computed from filtLeads
  const monthLB = (selectedMonth && monthDet && filtLeads.length > 0)
    ? (() => {
        const map = new Map<string, { admDone: number; closed: number; open: number; inProcess: number; futureProspect: number; total: number }>();
        for (const e of filtLeads) {
          const c = e.counselor; if (!c) continue;
          const lb = map.get(c) || { admDone: 0, closed: 0, open: 0, inProcess: 0, futureProspect: 0, total: 0 };
          lb.total++;
          const st = e.status.toUpperCase();
          if (st === "ADM DONE" || st === "ADM DONE IN RIS") lb.admDone++;
          else if (st.startsWith("CLOSED")) lb.closed++;
          else if (st === "OPEN") lb.open++;
          else if (st === "IN PROCESS ADM") lb.inProcess++;
          else if (st.startsWith("FUTURE")) lb.futureProspect++;
          map.set(c, lb);
        }
        return Array.from(map, ([counselor, v]) => ({
          counselor, admDone: v.admDone, admRIS: 0,
          closed: v.closed, open: v.open, inProcess: v.inProcess,
          futureProspect: v.futureProspect, total: v.total,
          conversion: v.total > 0 ? Math.round(v.admDone / v.total * 1000) / 10 : 0,
        })).sort((a, b) => (b.admDone + b.admRIS) - (a.admDone + a.admRIS));
      })()
    : null;

  // Month-specific revenue & spend (for Revenue tab filter view)
  const mktMonth = selectedMonth ? mktData.find(m => m.monthKey === selectedMonth) : null;
  const revMonthAdm  = monthDet?.admissions ?? 0;
  const revMonthRev  = Math.round(revMonthAdm * rev.avgFee);
  const revMonthSpnd = mktMonth ? mktMonth.total : 0;
  const revMonthROI  = revMonthSpnd > 0 ? (revMonthRev - revMonthSpnd) / revMonthSpnd * 100 : 0;
  const revMonthCAC  = revMonthAdm > 0 ? revMonthSpnd / revMonthAdm : 0;

  const TABS = [
    { id: "overview"   as const, label: "Overview"    },
    { id: "analytics"  as const, label: "Deep Analytics" },
    { id: "revenue"    as const, label: "Revenue & ROI" },
    { id: "pipeline"   as const, label: "DM Pipeline"  },
    { id: "counselors" as const, label: "Counselors"   },
    { id: "leads"      as const, label: "Recent Leads" },
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
              <div className="text-amber-300 text-xs">Rainbow Public School · 26-27 Academic Year · v2.4</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {loading && <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />}
            <div className="text-right">
              {lastFetch && <div className="text-xs text-slate-400">Updated {lastFetch.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>}
              <button onClick={fetchData} disabled={loading} className="text-xs text-amber-300 hover:text-white transition">↻ Refresh</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-4 flex gap-1 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${activeTab === t.id ? "bg-amber-400 text-[#091a4f]" : "text-slate-300 hover:text-white hover:bg-white/10"}`}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Month filter pills */}
        <div className="max-w-7xl mx-auto mt-2 flex gap-1.5 overflow-x-auto pb-2 items-center">
          <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">Filter:</span>
          <button onClick={() => setSelectedMonth(null)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${!selectedMonth ? "bg-white text-[#091a4f]" : "text-slate-400 hover:text-white hover:bg-white/10 border border-slate-600"}`}>
            All Time
          </button>
          {(d.byMonth || []).map(m => (
            <button key={m.monthKey} onClick={() => setSelectedMonth(selectedMonth === m.monthKey ? null : m.monthKey)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${selectedMonth === m.monthKey ? "bg-amber-400 text-[#091a4f]" : "text-slate-400 hover:text-white hover:bg-white/10 border border-slate-600"}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ══ OVERVIEW ════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && <>
          {/* Month filter banner */}
          {selectedMonth && monthDet && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: AMBER + "22", color: AMBER }}>
              <span>📅 Showing data for <strong>{monthDet.label}</strong></span>
              <button onClick={() => setSelectedMonth(null)} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Clear filter</button>
            </div>
          )}

          {/* Funnel KPIs */}
          <div>
            <SectionTitle sub={selectedMonth ? `${monthDet?.label ?? ""} · filtered view` : "Rainbow Public School · all branches · 26-27"}>Key Performance Indicators</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiCard label="Total Enquiries"  value={fmt(filtKpis.totalEnquiries)} sub={selectedMonth ? monthDet?.label : `${filtKpis.thisMonthEnquiries} this month`} />
              <KpiCard label="Admissions Done"  value={fmt(filtKpis.totalAdmissions + filtKpis.totalAdmRIS)} sub={selectedMonth ? monthDet?.label : `${filtKpis.totalAdmissions} RPS · ${filtKpis.totalAdmRIS} RIS`} accent={GREEN} highlight />
              <KpiCard label="Conversion"       value={pct(filtKpis.overallConversion)} accent={filtKpis.overallConversion>=50?GREEN:filtKpis.overallConversion>=30?AMBER:RED} />
              <KpiCard label="Open Enquiries"   value={selectedMonth ? "—" : fmt(filtKpis.openEnquiries)} sub={selectedMonth ? "All-time only" : `${filtKpis.inProcess} in process`} accent={BLUE} />
              <KpiCard label="Closed"           value={selectedMonth ? "—" : fmt(filtKpis.closedTotal)} sub={selectedMonth ? "All-time only" : undefined} accent={RED} />
            </div>
            {!selectedMonth && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiCard label="This Month Enquiries"  value={fmt(d.kpis.thisMonthEnquiries)} />
                <KpiCard label="This Month Admissions" value={fmt(d.kpis.thisMonthAdm)} accent={GREEN} />
                {d.leadTime.sampleSize > 0 && <KpiCard label="Median Lead Time" value={`${d.leadTime.median}d`} sub={`P90: ${d.leadTime.p90} days · ${d.leadTime.sampleSize} admits`} accent={AMBER} badge="enquiry→adm" />}
                <KpiCard label="DM Median Conv." value={d.dmPipeline.convMedianDays ? `${d.dmPipeline.convMedianDays}d` : "—"} sub="DM visit → admission" accent={CYAN} />
              </div>
            )}
          </div>

          {/* Revenue Summary (A) */}
          <div>
            <SectionTitle sub={selectedMonth ? `${monthDet?.label ?? ""} · fee rules: ₹85k (default) · ₹60k (Kalwa)` : "v2.5 · fee rules: ₹85k (default) · ₹60k (Kalwa) · real marketing spend"}>Revenue Summary</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiCard label="Recognised Revenue" value={fmtL(selectedMonth ? revMonthRev  : rev.totalRev)}   accent={GREEN} highlight sub={selectedMonth ? `${revMonthAdm} adm × ${fmtL(rev.avgFee)}` : `${rev.totalAdm} adm × avg ${fmtL(rev.avgFee)}`} />
              <KpiCard label="Marketing Spend"    value={fmtL(selectedMonth ? revMonthSpnd : rev.totalSpend)} accent={AMBER} sub={selectedMonth ? (mktMonth ? `Meta ₹${(mktMonth.meta/1000).toFixed(0)}k + Google ₹${(mktMonth.google/1000).toFixed(0)}k + Salary ₹${(mktMonth.salaries/1000).toFixed(0)}k` : "No spend data") : `${mktData.filter(m => m.total > 0).length} months · real data`} />
              <KpiCard label="ROI"                value={`${Math.round(selectedMonth ? revMonthROI  : rev.roi)}%`} accent={(selectedMonth ? revMonthROI : rev.roi)>=0?GREEN:RED} sub="(Revenue − Spend) / Spend" />
              <KpiCard label="CAC"                value={INR(Math.round(selectedMonth ? revMonthCAC  : rev.cac))} accent={(selectedMonth ? revMonthCAC : rev.cac)>80000?RED:AMBER} sub="Spend ÷ Admissions Done" />
              <KpiCard label="Projected Pipeline" value={fmtL(rev.projectedRev)} accent={CYAN} sub="Conf-weighted open DMs × fee" badge="open DM" />
            </div>
          </div>

          {/* Forecast */}
          {d.forecastSeries.length > 0 && (
            <div>
              <SectionTitle sub="Historical actuals + 2-month linear regression forecast">Monthly Admissions Trend & Forecast</SectionTitle>
              <ChartCard title="Enquiries vs Admissions (with forecast overlay)">
                <ComposedChart data={d.forecastSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar  dataKey="actual"    fill={GREEN} name="Actual Adm" radius={[3,3,0,0]} />
                  <Line dataKey="projected" stroke={AMBER} name="Forecast" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: AMBER, r: 4 }} connectNulls />
                </ComposedChart>
              </ChartCard>
            </div>
          )}

          {/* Branch performance */}
          {filtBranch.length > 0 && (
            <div>
              <SectionTitle sub={selectedMonth ? `${monthDet?.label ?? ""} · branches · enquiries, admissions` : "All branches · enquiries, admissions, conversion"}>Branch Performance</SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ChartCard title="Admissions vs Enquiries by Branch">
                  <BarChart data={filtBranch} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="branch" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip formatter={(v: any) => [fmt(+v)]} />
                    <Bar dataKey="enquiries"  fill="#dbeafe" name="Enquiries"  radius={[0,3,3,0]} />
                    <Bar dataKey="admissions" fill={GREEN}   name="Admissions" radius={[0,3,3,0]} />
                  </BarChart>
                </ChartCard>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                  <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <span className="text-sm font-bold" style={{ color: NAVY }}>Branch Summary{selectedMonth && monthDet ? ` · ${monthDet.label}` : ""}</span>
                    <button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                      onClick={() => csvDownload("rps-branch.csv", ["Branch","Enquiries","Admissions","Conv%"],
                        filtBranch.map(b => [b.branch,b.enquiries,b.admissions,b.conversion]))}>↓ CSV</button>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                      <tr>
                        <th className="text-left py-2 px-4">Branch</th>
                        <th className="text-right py-2 px-3">Enq</th>
                        <th className="text-right py-2 px-3">Adm</th>
                        {!selectedMonth && <th className="text-right py-2 px-3">Open</th>}
                        {!selectedMonth && <th className="text-right py-2 px-3">Closed</th>}
                        <th className="text-right py-2 px-3">Conv%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtBranch.map((b, i) => (
                        <tr key={b.branch} className={`border-t border-slate-100 ${i===0?"bg-green-50":"hover:bg-slate-50"}`}>
                          <td className="py-2 px-4 font-semibold">{b.branch}</td>
                          <td className="text-right py-2 px-3 tabular-nums">{fmt(b.enquiries)}</td>
                          <td className="text-right py-2 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{fmt(b.admissions)}</td>
                          {!selectedMonth && <td className="text-right py-2 px-3 tabular-nums" style={{ color: BLUE }}>{fmt(b.open)}</td>}
                          {!selectedMonth && <td className="text-right py-2 px-3 tabular-nums" style={{ color: RED }}>{fmt(b.closed)}</td>}
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

          {/* Source + Grade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtSource.length > 0 && (
              <ChartCard title={`Enquiries & Admissions by Source${selectedMonth && monthDet ? ` · ${monthDet.label}` : ""}`}>
                <BarChart data={filtSource} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="source" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enquiries"  fill={BLUE}  name="Enquiries"  radius={[3,3,0,0]} />
                  <Bar dataKey="admissions" fill={GREEN} name="Admissions" radius={[3,3,0,0]} />
                </BarChart>
              </ChartCard>
            )}
            {d.byGrade.length > 0 && (
              <ChartCard title="Enquiries by Grade">
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
          {(() => {
            const pieData = [
              { name: "Adm Done (RPS)", value: d.kpis.totalAdmissions, color: GREEN },
              { name: "Adm Done (RIS)", value: d.kpis.totalAdmRIS,     color: CYAN   },
              { name: "Open",           value: d.kpis.openEnquiries,   color: BLUE   },
              { name: "In Process",     value: d.kpis.inProcess,       color: AMBER  },
              { name: "Future Prospect",value: d.kpis.futureProspect,  color: PURPLE },
              { name: "Closed",         value: d.kpis.closedTotal,     color: RED    },
            ].filter(x => x.value > 0);
            const total = pieData.reduce((s, x) => s + x.value, 0);
            return (
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <div className="text-sm font-bold mb-4" style={{ color: NAVY }}>Enquiry Status Breakdown</div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div style={{ width: 220, height: 220, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip formatter={(v: any, _: any, p: any) => [`${fmt(+v)} (${total?Math.round(+v/total*100):0}%)`, p.payload?.name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    {pieData.map(item => (
                      <div key={item.name} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: item.color + "15" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                          <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <div className="text-right ml-3">
                          <span className="text-sm font-black" style={{ color: item.color }}>{fmt(item.value)}</span>
                          <span className="text-xs text-slate-500 ml-1">({total?Math.round(item.value/total*100):0}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </>}

        {/* ══ DEEP ANALYTICS ══════════════════════════════════════════════════ */}
        {activeTab === "analytics" && <>
          {/* Lead Time */}
          {d.leadTime.sampleSize > 0 && (
            <div>
              <SectionTitle sub={`${d.leadTime.sampleSize} admitted leads · admDate strictly after enqDate (v2.3 bug fix)`}>Lead-to-Admission Time Analysis</SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <KpiCard label="Median Lead Time" value={`${d.leadTime.median} days`} sub="50th percentile" accent={AMBER} highlight />
                  <KpiCard label="90th Percentile"  value={`${d.leadTime.p90} days`}    sub="9 in 10 convert within" accent={RED} />
                  <div className="col-span-2 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <p className="text-sm text-slate-600">
                      Half of all admissions happen within <strong>{d.leadTime.median} days</strong> of enquiry.
                      Deadlines at <strong>{d.leadTime.p90} days</strong> capture 90% of conversions.
                    </p>
                  </div>
                </div>
                <ChartCard title="Lead Time Distribution (enquiry → admission)">
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

          {/* Open Lead Ageing */}
          {d.ageingBuckets.length > 0 && (
            <div>
              <SectionTitle sub="Days since enquiry for OPEN + In Process + Future Prospect leads">Open Lead Ageing Buckets</SectionTitle>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <AgeingBars buckets={d.ageingBuckets} colors={[GREEN, CYAN, AMBER, "#ea580c", RED]} />
                <p className="text-xs text-slate-500 mt-4">Total active open leads: <strong>{d.ageingBuckets.reduce((s,b)=>s+b.count,0)}</strong></p>
              </div>
            </div>
          )}

          {/* D-Cohort */}
          {d.dCohort.length > 0 && (
            <div>
              <SectionTitle sub="Weekly DM walk-in cohorts · conversion speed from D-Cohort tab">DM Weekly Cohort — Conversion Speed</SectionTitle>
              <ChartCard title="DM conversions by speed tier per cohort week" height={340}>
                <BarChart data={d.dCohort.slice(-16)} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 8 }} angle={-50} textAnchor="end" interval={0} height={65} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="b0_3"  fill={GREEN}  name="0-3 days"  stackId="a" />
                  <Bar dataKey="b4_7"  fill={CYAN}   name="4-7 days"  stackId="a" />
                  <Bar dataKey="b8_14" fill={AMBER}  name="8-14 days" stackId="a" />
                  <Bar dataKey="b15p"  fill={PURPLE} name="15+ days"  stackId="a" radius={[3,3,0,0]} />
                </BarChart>
              </ChartCard>
              <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="text-left py-2 px-4">Week</th>
                      <th className="text-right py-2 px-3">Walkins</th>
                      <th className="text-right py-2 px-3">Admitted</th>
                      <th className="text-right py-2 px-3">Conv%</th>
                      <th className="text-right py-2 px-3">Avg Days</th>
                      <th className="text-right py-2 px-3">0-3d</th>
                      <th className="text-right py-2 px-3">4-7d</th>
                      <th className="text-right py-2 px-3">8-14d</th>
                      <th className="text-right py-2 px-3">15+d</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.dCohort.slice(-12).map((c, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-4 font-medium text-xs">{c.week}</td>
                        <td className="text-right py-2 px-3 tabular-nums">{c.walkins}</td>
                        <td className="text-right py-2 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{c.admDone}</td>
                        <td className="text-right py-2 px-3 tabular-nums" style={{ color: c.convPct>=50?GREEN:c.convPct>=25?AMBER:RED }}>{c.convPct}%</td>
                        <td className="text-right py-2 px-3 tabular-nums" style={{ color: AMBER }}>{c.avgDays||"—"}</td>
                        <td className="text-right py-2 px-3 tabular-nums" style={{ color: GREEN }}>{c.b0_3||"—"}</td>
                        <td className="text-right py-2 px-3 tabular-nums" style={{ color: CYAN }}>{c.b4_7||"—"}</td>
                        <td className="text-right py-2 px-3 tabular-nums" style={{ color: AMBER }}>{c.b8_14||"—"}</td>
                        <td className="text-right py-2 px-3 tabular-nums" style={{ color: PURPLE }}>{c.b15p||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Closed-Reason Heat-map */}
          {d.closedReasonTrend.data.length > 0 && (
            <div>
              <SectionTitle sub="Month × reason matrix — darker = more closures">Closed-Reason Trend Heat-Map</SectionTitle>
              <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="flex gap-1 mb-1 pl-44">
                    {d.closedReasonTrend.months.map((m, i) => (
                      <div key={i} className="w-10 text-center text-xs font-semibold text-slate-500">{m}</div>
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
            <ChartCard title="Top Closed Reasons (all time)">
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

          {/* Branch Closed */}
          {d.branchClosedList.length > 0 && (
            <div>
              <SectionTitle sub="Pre-computed from Branch Closed tab">Closed Reasons by Branch</SectionTitle>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="text-left py-2 px-4">Branch</th>
                      <th className="text-left py-2 px-4">Reason</th>
                      <th className="text-right py-2 px-4">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.branchClosedList.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-4 font-semibold">{r.branch}</td>
                        <td className="py-2 px-4 text-slate-600">{r.reason}</td>
                        <td className="py-2 px-4 text-right font-bold tabular-nums" style={{ color: RED }}>{r.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>}

        {/* ══ REVENUE & ROI ═══════════════════════════════════════════════════ */}
        {activeTab === "revenue" && <>
          {/* Month filter banner */}
          {selectedMonth && monthDet && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: AMBER + "22", color: AMBER }}>
              <span>📅 Showing revenue for <strong>{monthDet.label}</strong></span>
              <button onClick={() => setSelectedMonth(null)} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Clear filter</button>
            </div>
          )}
          {/* A – Revenue Summary */}
          <div>
            <SectionTitle sub={selectedMonth ? `${monthDet?.label ?? ""} · fee rules: Kalwa ₹60k · others ₹85k · real marketing spend` : "Fee rules: Kalwa ₹60k · all others ₹85k · real marketing spend (salaries + Meta + Google)"}>Revenue & ROI Summary</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <KpiCard label="Recognised Revenue" value={fmtL(selectedMonth ? revMonthRev  : rev.totalRev)}   accent={GREEN} highlight sub={INR(selectedMonth ? revMonthRev  : rev.totalRev)} />
              <KpiCard label="Marketing Spend"    value={fmtL(selectedMonth ? revMonthSpnd : rev.totalSpend)} accent={AMBER} sub={selectedMonth ? (mktMonth ? `Meta+Google+Salary` : "No spend data") : `Salaries + Ad Spend · ${mktData.filter(m=>m.total>0).length} months`} />
              <KpiCard label="ROI"                value={`${Math.round(selectedMonth ? revMonthROI : rev.roi)}%`} accent={(selectedMonth ? revMonthROI : rev.roi)>=0?GREEN:RED} sub="(Rev − Spend) / Spend × 100" />
              <KpiCard label="CAC (Cost/Admission)" value={INR(Math.round(selectedMonth ? revMonthCAC : rev.cac))} accent={(selectedMonth ? revMonthCAC : rev.cac)>80000?RED:AMBER} sub={`Target: ≤ ₹80,000`} />
              <KpiCard label="Projected Pipeline" value={fmtL(rev.projectedRev)} accent={CYAN} sub="Conf-weighted × fee per branch" />
            </div>
            {/* Spend breakdown card */}
            {!selectedMonth && mktData.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Salaries</div>
                  <div className="text-lg font-black" style={{ color: NAVY }}>{fmtL(mktData.reduce((s,m)=>s+m.salaries,0))}</div>
                  <div className="text-xs text-slate-400">{mktData.filter(m=>m.salaries>0).length} months</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Meta Ads</div>
                  <div className="text-lg font-black" style={{ color: BLUE }}>{fmtL(mktData.reduce((s,m)=>s+m.meta,0))}</div>
                  <div className="text-xs text-slate-400">Facebook / Instagram</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Google Ads</div>
                  <div className="text-lg font-black" style={{ color: RED }}>{fmtL(mktData.reduce((s,m)=>s+m.google,0))}</div>
                  <div className="text-xs text-slate-400">Search / Display</div>
                </div>
              </div>
            )}
            {selectedMonth && mktMonth && (
              <div className="mt-3 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Salaries</div>
                  <div className="text-lg font-black" style={{ color: NAVY }}>{INR(mktMonth.salaries)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Meta Ads</div>
                  <div className="text-lg font-black" style={{ color: BLUE }}>{INR(mktMonth.meta)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Google Ads</div>
                  <div className="text-lg font-black" style={{ color: RED }}>{INR(mktMonth.google)}</div>
                </div>
              </div>
            )}
          </div>

          {/* B – Revenue vs Spend Trend */}
          {rev.trend.length > 0 && (
            <div>
              <SectionTitle sub="Monthly recognised revenue vs marketing spend · cumulative net (purple line)">Revenue vs Spend Trend</SectionTitle>
              <ChartCard title="Revenue (area) · Spend (bars) · Cumulative Net (line)" height={320}
                action={<button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                  onClick={() => csvDownload("rps-rev-trend.csv",
                    ["Month","Revenue","Spend","Cumulative Net"],
                    rev.trend.map(r => [r.label, r.revenue, r.spend, r.cumNet]))}>↓ CSV</button>}>
                <ComposedChart data={rev.trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 10 }} tickFormatter={v => fmtL(v)} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => fmtL(v)} />
                  <Tooltip formatter={(v: any, name: string) => [INR(+v), name]} />
                  <Legend />
                  <Area yAxisId="left"  type="monotone" dataKey="revenue" fill={GREEN+"33"} stroke={GREEN}  name="Revenue" strokeWidth={2} />
                  <Bar  yAxisId="left"  dataKey="spend"  fill={AMBER}   name="Spend"   radius={[3,3,0,0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumNet" stroke={PURPLE} name="Cumulative Net" strokeWidth={2} dot={false} />
                  <ReferenceLine yAxisId="right" y={0} stroke={RED} strokeDasharray="4 2" label={{ value: "Break-even", position: "insideTopRight", fontSize: 10, fill: RED }} />
                </ComposedChart>
              </ChartCard>
            </div>
          )}

          {/* C – Branch Revenue Table */}
          {rev.branchTable.length > 0 && (
            <div>
              <SectionTitle sub="Spend allocated proportionally by admissions · red = ROI < 0 or CAC > ₹80k">Branch Revenue Table</SectionTitle>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <div className="flex justify-end px-4 pt-3 pb-1">
                  <button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                    onClick={() => csvDownload("rps-branch-rev.csv",
                      ["Branch","Adm Done","Revenue (₹)","Spend (₹)","ROI%","CAC (₹)"],
                      rev.branchTable.map(b => [b.branch, b.admissions, Math.round(b.revenue), Math.round(b.spend), Math.round(b.roi), Math.round(b.cac)]))}>
                    ↓ CSV
                  </button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4">Branch</th>
                      <th className="text-right py-3 px-3">Adm Done</th>
                      <th className="text-right py-3 px-3">Fee/Adm</th>
                      <th className="text-right py-3 px-3">Revenue</th>
                      <th className="text-right py-3 px-3">Spend</th>
                      <th className="text-right py-3 px-3">ROI %</th>
                      <th className="text-right py-3 px-3">CAC</th>
                      <th className="text-center py-3 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rev.branchTable.map((b, i) => {
                      const warn = b.roi < 0 || b.cac > 80000;
                      return (
                        <tr key={i} className={`border-t border-slate-100 ${warn ? "bg-red-50" : i===0?"bg-green-50":"hover:bg-slate-50"}`}>
                          <td className="py-2.5 px-4 font-semibold">{b.branch}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{b.admissions}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums text-xs text-slate-500">{INR(feeFor(b.branch))}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{fmtL(b.revenue)}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: AMBER }}>{fmtL(b.spend)}</td>
                          <td className="text-right py-2.5 px-3 tabular-nums font-bold"
                            style={{ color: b.roi>=0?GREEN:RED }}>{Math.round(b.roi)}%</td>
                          <td className="text-right py-2.5 px-3 tabular-nums"
                            style={{ color: b.cac>80000?RED:SLATE }}>{INR(Math.round(b.cac))}</td>
                          <td className="text-center py-2.5 px-3">
                            {warn
                              ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                  {b.roi < 0 ? "ROI < 0" : "CAC > ₹80k"}
                                </span>
                              : <span className="text-slate-300 text-xs">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr className="border-t-2 border-slate-300 bg-slate-50 font-black">
                      <td className="py-2.5 px-4">Total</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: GREEN }}>{rev.totalAdm}</td>
                      <td className="text-right py-2.5 px-3 text-xs text-slate-500">{INR(Math.round(rev.avgFee))}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: GREEN }}>{fmtL(rev.totalRev)}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: AMBER }}>{fmtL(rev.totalSpend)}</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: rev.roi>=0?GREEN:RED }}>{Math.round(rev.roi)}%</td>
                      <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: AMBER }}>{INR(Math.round(rev.cac))}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* D – Payback Curve */}
          {rev.trend.filter(t => t.spend > 0 || t.revenue > 0).length > 0 && (
            <div>
              <SectionTitle sub="Cumulative net revenue = Σ(revenue − spend) · dot marks break-even">Payback Curve</SectionTitle>
              <ChartCard title="Cumulative net revenue over time" height={300}>
                <LineChart data={rev.trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => fmtL(v)} />
                  <Tooltip formatter={(v: any) => [INR(+v), "Cumulative Net"]} />
                  <ReferenceLine y={0} stroke={RED} strokeDasharray="4 2"
                    label={{ value: "Break-even", position: "insideTopRight", fontSize: 10, fill: RED }} />
                  {rev.paybackLabel && (
                    <ReferenceLine x={rev.paybackLabel} stroke={GREEN} strokeDasharray="4 2"
                      label={{ value: "Payback ✓", position: "top", fontSize: 10, fill: GREEN }} />
                  )}
                  <Line type="monotone" dataKey="cumNet" stroke={PURPLE} strokeWidth={2.5} name="Cumulative Net"
                    dot={(props: any) => {
                      const isPayback = props.payload.label === rev.paybackLabel;
                      if (!isPayback) return <circle key={props.key} cx={props.cx} cy={props.cy} r={0} />;
                      return <circle key={props.key} cx={props.cx} cy={props.cy} r={8} fill={GREEN} stroke="#fff" strokeWidth={2} />;
                    }} />
                </LineChart>
              </ChartCard>
              <div className="mt-3 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Total Revenue</div>
                  <div className="text-xl font-black" style={{ color: GREEN }}>{fmtL(rev.totalRev)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Total Spend</div>
                  <div className="text-xl font-black" style={{ color: AMBER }}>{fmtL(rev.totalSpend)}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Net Profit</div>
                  <div className="text-xl font-black" style={{ color: (rev.totalRev-rev.totalSpend)>=0?GREEN:RED }}>{fmtL(Math.abs(rev.totalRev-rev.totalSpend))}</div>
                </div>
              </div>
            </div>
          )}
        </>}

        {/* ══ DM PIPELINE ═════════════════════════════════════════════════════ */}
        {activeTab === "pipeline" && <>
          <div>
            <SectionTitle sub="DM Tracker · all branches · v2.4">DM Pipeline Overview</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <KpiCard label="DM Admitted"       value={fmt(d.dmPipeline.admitted)}        accent={GREEN} highlight />
              <KpiCard label="DM Open"           value={fmt(d.dmPipeline.open)}             accent={BLUE}  sub={`${d.branchOpenPipeline.reduce((s,b)=>s+b.total,0)} in Branch Open tab`} />
              <KpiCard label="DM Closed"         value={fmt(d.dmPipeline.closed)}           accent={RED} />
              <KpiCard label="Median Conv. Time" value={d.dmPipeline.convMedianDays ? `${d.dmPipeline.convMedianDays}d` : "—"} sub="visit → admission" accent={AMBER} />
            </div>

            {/* E – Pipeline Revenue Card (confidence × branch × fee) */}
            {d.dmPipeline.confByBranch.length > 0 && (
              <div className="mb-6">
                <SectionTitle sub="Open DM leads · High 70% · Medium 40% · Low 10% · fee per branch rule">Pipeline Revenue Projection (E)</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {["High","Medium","Low"].map(conf => {
                    const weight = conf==="High" ? 0.7 : conf==="Medium" ? 0.4 : 0.1;
                    const brRevs = d.dmPipeline.confByBranch.map(b => ({
                      branch: b.branch,
                      count: b[conf as "High"|"Medium"|"Low"],
                      revenue: b[conf as "High"|"Medium"|"Low"] * weight * feeFor(b.branch),
                    })).filter(x => x.count > 0);
                    const totalCount = brRevs.reduce((s,x) => s+x.count, 0);
                    const totalRevConf = brRevs.reduce((s,x) => s+x.revenue, 0);
                    const color = conf==="High" ? GREEN : conf==="Medium" ? AMBER : RED;
                    const bg    = conf==="High" ? "#dcfce7" : conf==="Medium" ? "#fef9c3" : "#fee2e2";
                    return (
                      <div key={conf} className="rounded-xl p-4" style={{ background: bg }}>
                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>{conf} Confidence · {Math.round(weight*100)}% weight</div>
                        <div className="text-3xl font-black" style={{ color }}>{totalCount} leads</div>
                        <div className="mt-3 space-y-1">
                          {brRevs.map(b => (
                            <div key={b.branch} className="flex justify-between text-xs">
                              <span className="text-slate-600">{b.branch}</span>
                              <span className="font-semibold" style={{ color }}>{b.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DM Open Ageing */}
            {d.dmPipeline.ageing.length > 0 && (
              <div className="mb-6">
                <SectionTitle sub="Pre-computed 'Days Since Visit' column (DM Tracker col Q)">DM Open Lead Ageing</SectionTitle>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                  <AgeingBars buckets={d.dmPipeline.ageing} colors={[GREEN, CYAN, AMBER, "#ea580c", RED]} />
                  <p className="text-xs text-slate-500 mt-4">Total DM open leads aged: <strong>{d.dmPipeline.ageing.reduce((s,b)=>s+b.count,0)}</strong></p>
                </div>
              </div>
            )}

            {/* Confidence × Branch */}
            {d.dmPipeline.confByBranch.length > 0 && (
              <div className="mb-6">
                <SectionTitle sub="Open DM leads · stacked by confidence per branch">Confidence × Branch Matrix</SectionTitle>
                <ChartCard title="Open DM confidence by branch">
                  <BarChart data={d.dmPipeline.confByBranch} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="branch" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="High"   fill={GREEN} name="High"   stackId="a" />
                    <Bar dataKey="Medium" fill={AMBER} name="Medium" stackId="a" />
                    <Bar dataKey="Low"    fill={RED}   name="Low"    stackId="a" radius={[0,3,3,0]} />
                  </BarChart>
                </ChartCard>
              </div>
            )}

            {/* DM by Branch + Branch Open pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartCard title="DM Pipeline by Branch (Admitted / Open / Closed)">
                <BarChart data={d.dmPipeline.byBranch} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="branch" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="admitted" fill={GREEN} name="Admitted" stackId="a" />
                  <Bar dataKey="open"     fill={BLUE}  name="Open"     stackId="a" />
                  <Bar dataKey="closed"   fill={RED}   name="Closed"   stackId="a" radius={[0,3,3,0]} />
                </BarChart>
              </ChartCard>

              {d.branchOpenPipeline.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="text-sm font-bold mb-3" style={{ color: NAVY }}>Live Open Pipeline — Branch Open Tab</div>
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase text-slate-500">
                      <tr>
                        <th className="text-left pb-2">Branch</th>
                        <th className="text-right pb-2">Walk-in</th>
                        <th className="text-right pb-2" style={{ color: AMBER }}>DM</th>
                        <th className="text-right pb-2">Referral</th>
                        <th className="text-right pb-2 font-bold">Total</th>
                        <th className="text-right pb-2">Rev (DM)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.branchOpenPipeline.map(b => (
                        <tr key={b.branch} className="border-t border-slate-100">
                          <td className="py-1.5 font-medium">{b.branch}</td>
                          <td className="text-right tabular-nums">{b.directWalkin||"—"}</td>
                          <td className="text-right tabular-nums font-bold" style={{ color: AMBER }}>{b.dm||"—"}</td>
                          <td className="text-right tabular-nums">{b.referral||"—"}</td>
                          <td className="text-right tabular-nums font-black" style={{ color: BLUE }}>{b.total}</td>
                          <td className="text-right tabular-nums text-xs" style={{ color: GREEN }}>{b.dm ? fmtL(b.dm * feeFor(b.branch)) : "—"}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-300 font-bold">
                        <td className="py-1.5">Total</td>
                        <td className="text-right">{d.branchOpenPipeline.reduce((s,b)=>s+b.directWalkin,0)}</td>
                        <td className="text-right" style={{ color: AMBER }}>{d.branchOpenPipeline.reduce((s,b)=>s+b.dm,0)}</td>
                        <td className="text-right">{d.branchOpenPipeline.reduce((s,b)=>s+b.referral,0)}</td>
                        <td className="text-right" style={{ color: BLUE }}>{d.branchOpenPipeline.reduce((s,b)=>s+b.total,0)}</td>
                        <td />
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* MIS Progress */}
          {d.misHistory.length > 0 && (
            <div>
              <SectionTitle sub="Cumulative running totals from MIS Dashboard tab">MIS Progress Tracker</SectionTitle>
              <ChartCard title="Cumulative Walkins & Admissions Over Time">
                <LineChart data={d.misHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(d.misHistory.length/8)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="walkins"    stroke={BLUE}  name="Total Walkins"    dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="admissions" stroke={GREEN} name="Total Admissions" dot={false} strokeWidth={2} />
                </LineChart>
              </ChartCard>
            </div>
          )}
        </>}

        {/* ══ COUNSELORS ══════════════════════════════════════════════════════ */}
        {activeTab === "counselors" && <>
          {d.dmPipeline.counselors.length > 0 && (
            <div>
              <SectionTitle sub="DM Tracker · top 12 by admissions · with avg conversion days">DM Counsellor Performance</SectionTitle>
              <div className="flex justify-end mb-2">
                <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                  onClick={() => csvDownload("rps-dm-counselors.csv",
                    ["Counsellor","Open","Admitted","Closed","Total","Conv%","Avg Conv Days"],
                    d.dmPipeline.counselors.map(c => [c.counselor,c.open,c.admitted,c.closed,c.total,c.conv,c.avgConvDays]))}>
                  ↓ CSV
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto mb-5">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4">Counsellor</th>
                      <th className="text-right py-3 px-3" style={{ color: GREEN }}>Admitted</th>
                      <th className="text-right py-3 px-3" style={{ color: BLUE }}>Open</th>
                      <th className="text-right py-3 px-3" style={{ color: RED }}>Closed</th>
                      <th className="text-right py-3 px-3">Total</th>
                      <th className="text-right py-3 px-3">Conv%</th>
                      <th className="text-right py-3 px-3" style={{ color: AMBER }}>Avg Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.dmPipeline.counselors.map((c, i) => (
                      <tr key={i} className={`border-t border-slate-100 ${i===0?"bg-amber-50":"hover:bg-slate-50"}`}>
                        <td className="py-2.5 px-4 font-semibold">{c.counselor}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums font-bold" style={{ color: GREEN }}>{c.admitted}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: BLUE }}>{c.open}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: RED }}>{c.closed}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums">{c.total}</td>
                        <td className="text-right py-2.5 px-3 tabular-nums font-bold"
                          style={{ color: c.conv>=50?GREEN:c.conv>=30?AMBER:RED }}>{c.conv}%</td>
                        <td className="text-right py-2.5 px-3 tabular-nums" style={{ color: AMBER }}>{c.avgConvDays||"—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {d.counselorFunnel.length > 0 && (
            <div>
              <SectionTitle sub="Enquiries → Counselled → School Tour → Admission">Conversion Funnel by Counsellor</SectionTitle>
              <ChartCard title="Stage-by-stage funnel — top 12 by admissions" height={320}
                action={<button className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                  onClick={() => csvDownload("rps-funnel.csv",
                    ["Counsellor","Enquiries","Counselled","School Tour","Admitted","Conv%"],
                    d.counselorFunnel.map(c => [c.counselor,c.enquiries,c.counselled,c.toured,c.admitted,
                      c.enquiries?Math.round(c.admitted/c.enquiries*100):0]))}>↓ CSV</button>}>
                <BarChart data={d.counselorFunnel} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="counselor" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enquiries"  fill="#dbeafe" name="Enquiries"   radius={[0,3,3,0]} />
                  <Bar dataKey="counselled" fill={CYAN}    name="Counselled"  radius={[0,3,3,0]} />
                  <Bar dataKey="toured"     fill={PURPLE}  name="School Tour" radius={[0,3,3,0]} />
                  <Bar dataKey="admitted"   fill={GREEN}   name="Admitted"    radius={[0,3,3,0]} />
                </BarChart>
              </ChartCard>
            </div>
          )}

          {(monthLB ?? d.counselorLeaderboard).length > 0 && (
            <div>
              <div className="flex items-end justify-between mb-3">
                <div>
                  <SectionTitle sub={monthLB ? `${monthDet!.label} · enquiries assigned to counsellor · sorted by admissions` : "From Walkin Data · every enquiry row · sorted by admissions"}>
                    Full Counsellor Leaderboard{monthLB ? ` · ${monthDet!.label}` : ""}
                  </SectionTitle>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Conv% = Admissions ÷ Total Enquiries &nbsp;·&nbsp; Total Enquiries = all leads assigned to counsellor
                    {monthLB && <span className="ml-2 px-1.5 py-0.5 rounded text-amber-700 font-semibold" style={{ background: AMBER + "22" }}>Filtered: {monthDet!.label}</span>}
                  </p>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                  onClick={() => csvDownload("rps-leaderboard.csv",
                    ["#","Counsellor","Admissions","Closed","Open","In Progress","Total Leads","Conv%"],
                    (monthLB ?? d.counselorLeaderboard).map((c,i) => [i+1,c.counselor,c.admDone+c.admRIS,c.closed,c.open,c.inProcess,c.total,c.conversion]))}>
                  ↓ Download CSV
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: NAVY }} className="text-white text-xs uppercase">
                    <tr>
                      <th className="text-center py-3 px-3 w-10">#</th>
                      <th className="text-left py-3 px-4">Counsellor</th>
                      <th className="text-right py-3 px-3">Admissions</th>
                      <th className="text-right py-3 px-3">Closed</th>
                      <th className="text-right py-3 px-3">Open</th>
                      <th className="text-right py-3 px-3">In Progress</th>
                      <th className="text-right py-3 px-3">Total Leads</th>
                      <th className="text-right py-3 px-3 min-w-[120px]">Conv%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(monthLB ?? d.counselorLeaderboard).map((c, i) => {
                      const totalAdm = c.admDone + c.admRIS;
                      const convColor = c.conversion >= 50 ? GREEN : c.conversion >= 30 ? AMBER : RED;
                      const rankEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                      return (
                        <tr key={i} className={`border-t border-slate-100 ${i===0?"bg-amber-50":i<3?"bg-green-50/40":"hover:bg-slate-50"}`}>
                          <td className="text-center py-3 px-3 text-slate-400 font-bold text-xs">
                            {rankEmoji ?? <span className="text-slate-300">{i+1}</span>}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{c.counselor}</td>
                          <td className="text-right py-3 px-3 tabular-nums">
                            <span className="inline-flex items-center gap-1 font-black text-base" style={{ color: GREEN }}>
                              {totalAdm}
                            </span>
                            {c.admDone > 0 && c.admRIS > 0 && (
                              <div className="text-[10px] text-slate-400 text-right">
                                RPS {c.admDone} · RIS {c.admRIS}
                              </div>
                            )}
                          </td>
                          <td className="text-right py-3 px-3 tabular-nums font-semibold" style={{ color: RED }}>{c.closed || "—"}</td>
                          <td className="text-right py-3 px-3 tabular-nums font-semibold" style={{ color: BLUE }}>{c.open || "—"}</td>
                          <td className="text-right py-3 px-3 tabular-nums font-semibold" style={{ color: AMBER }}>{c.inProcess || "—"}</td>
                          <td className="text-right py-3 px-3 tabular-nums text-slate-500">{c.total}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.min(c.conversion, 100)}%`, background: convColor }} />
                              </div>
                              <span className="tabular-nums font-bold text-xs min-w-[38px] text-right" style={{ color: convColor }}>
                                {pct(c.conversion)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>}

        {/* ══ RECENT LEADS ════════════════════════════════════════════════════ */}
        {activeTab === "leads" && (
          <div>
            {selectedMonth && monthDet && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold mb-4" style={{ background: AMBER + "22", color: AMBER }}>
                <span>📅 Showing enquiries for <strong>{monthDet.label}</strong> · {filtLeads.length} records</span>
                <button onClick={() => setSelectedMonth(null)} className="ml-auto text-xs underline opacity-70 hover:opacity-100">Clear filter</button>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <SectionTitle sub={selectedMonth ? `${monthDet?.label ?? ""} · ${filtLeads.length} enquiries` : "20 most recent · sorted by date"}>Recent Enquiries</SectionTitle>
              <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                onClick={() => csvDownload("rps-recent-leads.csv",
                  ["Date","Student","Grade","Branch","Counsellor","Source","Status"],
                  filtLeads.map(e => [e.date,e.name,e.grade,e.branch,e.counselor,e.source,e.status]))}>
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
                  {filtLeads.map((e, i) => (
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

        <div className="text-center text-xs text-slate-400 pb-6">
          Auto-refreshes every 5 min · v2.5 · Month filter · Real marketing spend · Generated {d.generatedAt ? new Date(d.generatedAt).toLocaleString("en-IN") : "—"}
        </div>
      </div>
    </div>
  );
}
