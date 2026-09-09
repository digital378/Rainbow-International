import { useCallback, useEffect, useRef, useState } from "react";

const NAVY = "#091a4f", AMBER = "#f59e0b", GREEN = "#059669", RED = "#dc2626";
const BLUE = "#2563eb", SLATE = "#64748b", GREY = "#94a3b8";
const PASSCODE = "OVER";
const AUTH_KEY = "walkin_overview_2728_auth";

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

const pct = (n: number) => `${n.toFixed(1)}%`;
const fmt = (n: number) => n.toLocaleString("en-IN");

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    if (code.trim().toUpperCase() === PASSCODE) {
      try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {}
      onSuccess();
      return;
    }
    setError(true);
    setCode("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: NAVY }} data-testid="passcode-gate">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-6 text-center">
          <img src="/images/rainbow-group-logo-2.jpg" alt="Rainbow Group" className="mx-auto mb-4 h-14 w-auto rounded-lg" />
          <h1 className="text-xl font-black text-slate-800">Group Overview</h1>
          <p className="mt-1 text-sm text-slate-500">AY 2027–28 · Staff access</p>
        </div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Enter passcode</label>
        <input
          type="password"
          autoComplete="off"
          value={code}
          onChange={event => { setCode(event.target.value); setError(false); }}
          onKeyDown={event => event.key === "Enter" && submit()}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
          data-testid="input-passcode"
        />
        {error && <div className="mt-2 text-center text-sm text-red-600">Incorrect passcode</div>}
        <button onClick={submit} className="mt-4 w-full rounded-lg py-2.5 font-bold text-white" style={{ background: NAVY }}>
          Open dashboard
        </button>
      </div>
    </div>
  );
}

function BrandCard({
  logo, brand, color, stats, loading,
}: {
  logo: string; brand: string; color: string; stats: Stats | null; loading: boolean;
}) {
  if (loading || !stats) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt={brand} style={{ height: 44, width: "auto", flexShrink: 0 }} />
          <div>
            <div className="font-black text-lg" style={{ color }}>{brand}</div>
            <div className="text-xs text-slate-400">AY 2027-28</div>
          </div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 rounded-full animate-spin" style={{ borderTopColor: color }} />
        </div>
      </div>
    );
  }

  const { kpis, statusBreakdown } = stats;
  const convPct = kpis.totalLeads > 0 ? (kpis.admissions / kpis.totalLeads) * 100 : 0;
  const walkInConvPct = kpis.walkins > 0 ? (kpis.admissions / kpis.walkins) * 100 : 0;
  const openLeads = statusBreakdown.filter(s => ["OPEN","FOLLOW-UP"].includes(s.status)).reduce((a,s) => a+s.cnt, 0);

  const metrics = [
    { label: "Total Leads", value: fmt(kpis.totalLeads), sub: "Walk-in enquiries captured" },
    { label: "Walk-ins Done", value: fmt(kpis.walkins), sub: "Completed school visits" },
    { label: "Admissions", value: fmt(kpis.admissions), sub: "Confirmed admissions", accent: GREEN },
    { label: "Conversion %", value: pct(convPct), sub: "Admissions / Total Leads", accent: AMBER },
    { label: "Walk-in Conv. %", value: pct(walkInConvPct), sub: "Admissions / Walk-ins done", accent: AMBER },
    { label: "Open Pipeline", value: fmt(openLeads), sub: "Open + Follow-up leads", accent: BLUE },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 flex flex-col gap-0 overflow-hidden" style={{ borderColor: color }}>
      {/* Brand header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: color }}>
        <div className="flex items-center gap-3">
          <img src={logo} alt={brand} style={{ height: 40, width: "auto", flexShrink: 0, borderRadius: 6, background: "rgba(255,255,255,0.15)", padding: 2 }} />
          <div>
            <div className="font-black text-lg text-white leading-tight">{brand}</div>
            <div className="text-xs text-white/70">AY 2027-28 · Walk-in Pipeline</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white">LIVE</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-slate-100">
        {metrics.map(m => (
          <div key={m.label} className="p-4 flex flex-col gap-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</div>
            <div className="text-2xl font-black" style={{ color: m.accent || NAVY }}>{m.value}</div>
            <div className="text-[11px] text-slate-500">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Status breakdown pills */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-100">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Status breakdown</div>
        <div className="flex flex-wrap gap-1.5">
          {statusBreakdown.length === 0 ? (
            <span className="text-xs text-slate-400">No leads yet</span>
          ) : statusBreakdown.map(s => (
            <span key={s.status} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: s.status === "CLOSED" ? "#fee2e2" : s.status.includes("FOLLOW") ? "#fef3c7" : "#e0f2fe", color: s.status === "CLOSED" ? RED : s.status.includes("FOLLOW") ? "#92400e" : BLUE }}>
              {s.status} · {s.cnt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function FunnelRow({ label, ris, rps }: { label: string; ris: number; rps: number }) {
  const total = ris + rps;
  const risPct = total > 0 ? Math.round(ris / total * 100) : 50;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs font-semibold text-slate-600 text-right">{label}</div>
      <div className="flex-1 flex rounded-full overflow-hidden h-7">
        <div className="flex items-center justify-center text-white text-xs font-bold"
          style={{ width: `${risPct}%`, background: NAVY, minWidth: ris > 0 ? 32 : 0 }}>
          {ris > 0 && fmt(ris)}
        </div>
        <div className="flex items-center justify-center text-white text-xs font-bold"
          style={{ width: `${100 - risPct}%`, background: RED, minWidth: rps > 0 ? 32 : 0 }}>
          {rps > 0 && fmt(rps)}
        </div>
      </div>
      <div className="w-14 text-xs font-black tabular-nums text-slate-700 text-right">{fmt(total)}</div>
    </div>
  );
}

function Dashboard({ onLock }: { onLock: () => void }) {
  const [risStats, setRisStats] = useState<Stats | null>(null);
  const [rpsStats, setRpsStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const cancelled = useRef(false);

  const fetchData = useCallback((bust = false) => {
    setLoading(true);
    const qs = bust ? "?brand=RIS&ay=2027-28&bust=1" : "?brand=RIS&ay=2027-28";
    const qsRps = bust ? "?brand=RPS&ay=2027-28&bust=1" : "?brand=RPS&ay=2027-28";
    Promise.all([
      fetch(`/api/walkin/crm-stats${qs}`).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
      fetch(`/api/walkin/crm-stats${qsRps}`).then(r => r.ok ? r.json() : Promise.reject(r.statusText)),
    ]).then(([ris, rps]: [Stats, Stats]) => {
      if (!cancelled.current) { setRisStats(ris); setRpsStats(rps); setError(null); setLastFetch(new Date()); }
    }).catch(e => { if (!cancelled.current) setError(String(e)); })
      .finally(() => { if (!cancelled.current) setLoading(false); });
  }, []);

  useEffect(() => {
    document.title = "Group Overview · AY 2027-28";
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) { meta = document.createElement("meta"); meta.name = "robots"; document.head.appendChild(meta); }
    meta.setAttribute("content", "noindex, nofollow");
    fetchData();
    const iv = setInterval(fetchData, 60_000);
    return () => { cancelled.current = true; clearInterval(iv); };
  }, [fetchData]);

  if (error && !risStats) return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#f8fafc" }}>
      <div className="bg-white rounded-xl p-8 max-w-md shadow border border-red-200">
        <div className="text-red-600 font-bold mb-2">Failed to load data</div>
        <div className="text-sm text-slate-600 mb-4">{error}</div>
        <button onClick={() => fetchData()} className="px-4 py-2 rounded-lg text-white font-semibold" style={{ background: NAVY }}>Retry</button>
      </div>
    </div>
  );

  const totalLeads = (risStats?.kpis.totalLeads || 0) + (rpsStats?.kpis.totalLeads || 0);
  const totalAdm = (risStats?.kpis.admissions || 0) + (rpsStats?.kpis.admissions || 0);
  const totalWalkins = (risStats?.kpis.walkins || 0) + (rpsStats?.kpis.walkins || 0);
  const groupConv = totalLeads > 0 ? (totalAdm / totalLeads) * 100 : 0;

  return (
    <div className="min-h-screen" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="py-5 px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/images/rainbow-group-logo-2.jpg" alt="Rainbow Group" style={{ height: 44, width: "auto", borderRadius: 8, flexShrink: 0 }} />
          <div>
            <div className="font-black text-xl leading-tight" style={{ color: NAVY }}>Group Overview · AY 2027-28</div>
            <div className="text-xs flex items-center gap-2" style={{ color: SLATE }}>
              Rainbow International School + Rainbow Preschool · Combined view
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />LIVE
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {lastFetch && `Updated: ${lastFetch.toLocaleTimeString()}`}
          {loading && " · refreshing…"}
          <button onClick={() => fetchData()} className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">↻ Refresh</button>
          <button onClick={onLock} className="px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50">Lock</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Group headline KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Group Leads", value: fmt(totalLeads), sub: "RIS + RPS combined", accent: NAVY },
            { label: "Walk-ins Done", value: fmt(totalWalkins), sub: "School visits completed", accent: BLUE },
            { label: "Total Admissions", value: fmt(totalAdm), sub: "Confirmed across group", accent: GREEN },
            { label: "Group Conversion", value: pct(groupConv), sub: "Admissions / Total Leads", accent: AMBER },
          ].map(m => (
            <div key={m.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{m.label}</div>
              <div className="text-3xl font-black mt-1" style={{ color: m.accent }}>{m.value}</div>
              <div className="text-xs mt-1 text-slate-500">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* RIS vs RPS side-by-side funnel bars */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5">
            <div className="text-sm font-black" style={{ color: NAVY }}>RIS vs RPS Funnel Comparison</div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: NAVY }} />RIS</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: RED }} />RPS</span>
            </div>
          </div>
          <div className="space-y-3">
            <FunnelRow label="Total Leads" ris={risStats?.kpis.totalLeads || 0} rps={rpsStats?.kpis.totalLeads || 0} />
            <FunnelRow label="Bookings" ris={risStats?.kpis.bookings || 0} rps={rpsStats?.kpis.bookings || 0} />
            <FunnelRow label="Walk-ins" ris={risStats?.kpis.walkins || 0} rps={rpsStats?.kpis.walkins || 0} />
            <FunnelRow label="Admissions" ris={risStats?.kpis.admissions || 0} rps={rpsStats?.kpis.admissions || 0} />
          </div>
          {totalLeads === 0 && (
            <div className="mt-4 text-center text-sm text-slate-400">No leads captured yet in AY 2027-28 — bars will populate as enquiries come in</div>
          )}
        </div>


        {/* Side-by-side brand cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <BrandCard logo="/images/ris-logo-2.png" brand="Rainbow International School (RIS)" color={NAVY} stats={risStats} loading={loading && !risStats} />
          <BrandCard logo="/images/rps-logo-2.png" brand="Rainbow Preschool (RPS)" color={RED} stats={rpsStats} loading={loading && !rpsStats} />
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <a href="/sales-27-28" className="px-4 py-2 rounded-lg font-semibold text-white" style={{ background: NAVY }}>RIS Sales Dashboard →</a>
          <a href="/rps-sales-27-28" className="px-4 py-2 rounded-lg font-semibold text-white" style={{ background: RED }}>RPS Sales Dashboard →</a>
          <a href="/marketing-27-28" className="px-4 py-2 rounded-lg font-semibold text-white" style={{ background: AMBER, color: NAVY }}>Marketing Dashboard →</a>
          <a href="/leads" className="px-4 py-2 rounded-lg font-semibold border border-slate-300 text-slate-600 bg-white">Manage Leads →</a>
        </div>

        <div className="text-center text-xs text-slate-400">
          AY 2027-28 · walkin_leads DB · auto-refreshes every 60 seconds · staff access only
        </div>
      </div>
    </div>
  );
}

export default function WalkinOverview2728() {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });

  if (!authed) return <PasscodeGate onSuccess={() => setAuthed(true)} />;

  return <Dashboard onLock={() => {
    try { sessionStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
  }} />;
}
