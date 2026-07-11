import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar,
  CartesianGrid, LabelList,
} from "recharts";

const PIN = "ALL8";
const AUTH_KEY = "alliances_auth_v1";

// ── Types ──────────────────────────────────────────────────────
interface BrandPartner {
  sno: string; name: string; category: string; discount: string;
  owner: string; stage: string; dateApproached: string; lastUpdate: string;
  mouDoneDate: string; hasBanner: boolean; hasWebsite: boolean;
  hasBrochure: boolean; admissionsReferred: number; daysSinceUpdate: number;
  followUpNeeded: boolean;
}
interface Corporate {
  sno: string; name: string; size: string; industry: string; location: string;
  owner: string; stage: string; dateApproached: string; lastUpdate: string;
  mouDoneDate: string; admissionsReferred: number; daysSinceUpdate: number;
  followUpNeeded: boolean; remarks: string;
}
interface FriendshipSchool {
  sno: string; name: string; location: string; owner: string; stage: string;
  dateApproached: string; lastUpdate: string; mouDoneDate: string;
  admJrKg: number; admSrKg: number; totalAdm: number; contractType: string; strength: string;
}
interface ParentAdvocacy {
  sno: string; referringParent: string; wardClass: string; referredFamily: string;
  gradeApplying: string; status: string; dateReferred: string; lastUpdate: string;
  owner: string; incentiveGiven: string; remarks: string;
}
interface OwnerEntry { name: string; total: number; mouDone: number; admissions: number; followUp: number; }
interface CategoryEntry { name: string; total: number; mouDone: number; admissions: number; }
interface AlliancesData {
  generatedAt: string;
  kpi: { totalProspects: number; totalMouDone: number; totalAdmissions: number; totalFollowUp: number; paReferrals: number; paAdmissions: number; };
  funnel: {
    brandPartners: Record<string, number>;
    corporates: Record<string, number>;
    friendshipSchools: Record<string, number>;
    parentAdvocacy: Record<string, number>;
  };
  brandPartners: BrandPartner[];
  corporates: Corporate[];
  friendshipSchools: FriendshipSchool[];
  parentAdvocacy: ParentAdvocacy[];
  ownerLeaderboard: OwnerEntry[];
  categoryBreakdown: CategoryEntry[];
  pipelineStages: string[];
  paStatuses: string[];
}

// ── Stage colours ──────────────────────────────────────────────
const STAGE_COLOR: Record<string, string> = {
  "Not Contacted": "bg-slate-100 text-slate-600",
  "Initial Discussion": "bg-blue-100 text-blue-700",
  "Touchbase Done": "bg-indigo-100 text-indigo-700",
  "Waiting for Revert": "bg-yellow-100 text-yellow-700",
  "MOU Sent": "bg-orange-100 text-orange-700",
  "MOU Signing Pending": "bg-amber-100 text-amber-700",
  "MOU Done": "bg-green-100 text-green-700",
  "Not Interested / Dropped": "bg-red-100 text-red-500",
};
const PA_COLOR: Record<string, string> = {
  "Enquired": "bg-blue-100 text-blue-700",
  "Campus Visit Scheduled": "bg-indigo-100 text-indigo-700",
  "Application Submitted": "bg-amber-100 text-amber-700",
  "Admission Confirmed": "bg-green-100 text-green-700",
  "Not Interested": "bg-red-100 text-red-500",
};

// ── Passcode gate ──────────────────────────────────────────────
function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PIN) { onSuccess(); }
    else {
      setError(true); setShake(true); setCode("");
      setTimeout(() => setShake(false), 500);
    }
  };
  return (
    <div className="min-h-screen bg-[#091a4f] flex items-center justify-center p-4">
      <form onSubmit={submit}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm"
        style={{ animation: shake ? "shake 0.4s ease" : "none" }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-sm">RIS</div>
          <div>
            <div className="font-black text-lg text-[#091a4f] leading-tight">Alliances Dashboard</div>
            <div className="text-xs text-slate-500">Strategic Alliances & Branding · Internal</div>
          </div>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Enter passcode</label>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          value={code}
          onChange={e => { setCode(e.target.value); setError(false); }}
          className={`w-full px-4 py-3 rounded-lg border-2 text-lg tracking-[0.5em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 ${error ? "border-red-400 bg-red-50" : "border-slate-200"}`}
          placeholder="••••"
          data-testid="input-passcode"
        />
        {error && <div className="mt-2 text-sm text-red-600 text-center">Incorrect passcode</div>}
        <button type="submit" data-testid="button-unlock"
          className="mt-5 w-full py-3 rounded-lg bg-[#091a4f] text-white font-bold hover:bg-[#0b2168] transition">
          Unlock
        </button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────
function StageBadge({ stage, palette }: { stage: string; palette: Record<string, string> }) {
  const cls = palette[stage] ?? "bg-slate-100 text-slate-600";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{stage || "—"}</span>;
}
function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-3xl font-black ${accent ?? "text-[#091a4f]"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
function FunnelBar({ stages, counts, palette }: { stages: string[]; counts: Record<string, number>; palette: Record<string, string> }) {
  const total = stages.reduce((s, st) => s + (counts[st] ?? 0), 0) || 1;
  return (
    <div className="space-y-1.5">
      {stages.map(st => {
        const cnt = counts[st] ?? 0;
        const pct = Math.round((cnt / total) * 100);
        const cls = (palette[st] ?? "bg-slate-200").split(" ")[0];
        return (
          <div key={st} className="flex items-center gap-2 text-xs">
            <div className="w-36 text-right text-slate-600 truncate">{st}</div>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${cls}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="w-8 text-slate-700 font-bold">{cnt}</div>
          </div>
        );
      })}
    </div>
  );
}
function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder ?? "Search…"}
      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 w-48" />
  );
}
function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
      <option value="">{placeholder ?? "All"}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Chart colour palette ──────────────────────────────────────
const C = {
  navy:   "#091a4f",
  amber:  "#f59e0b",
  green:  "#22c55e",
  blue:   "#3b82f6",
  indigo: "#6366f1",
  purple: "#a855f7",
  red:    "#ef4444",
  slate:  "#94a3b8",
  teal:   "#14b8a6",
  orange: "#f97316",
};

const STAGE_CHART_COLOR: Record<string, string> = {
  "Not Contacted":          C.slate,
  "Initial Discussion":     C.blue,
  "Touchbase Done":         C.indigo,
  "Waiting for Revert":     C.amber,
  "MOU Sent":               C.orange,
  "MOU Signing Pending":    C.purple,
  "MOU Done":               C.green,
  "Not Interested / Dropped": C.red,
};

const SHORT_STAGE: Record<string, string> = {
  "Not Contacted":           "Not Contacted",
  "Initial Discussion":      "Initial Disc.",
  "Touchbase Done":          "Touchbase",
  "Waiting for Revert":      "Waiting",
  "MOU Sent":                "MOU Sent",
  "MOU Signing Pending":     "MOU Pending",
  "MOU Done":                "MOU Done ✓",
  "Not Interested / Dropped":"Dropped",
};

// Custom tooltip wrapper
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-lg rounded-lg px-3 py-2 text-xs">
      <div className="font-bold text-slate-700 mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.fill ?? p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────
function OverviewTab({ data }: { data: AlliancesData }) {
  const { kpi, funnel, ownerLeaderboard, categoryBreakdown, pipelineStages } = data;

  // ── Chart data derivations ──────────────────────────────────

  // 1. Grouped bar: stages × verticals
  const stageChartData = pipelineStages.map(st => ({
    stage: SHORT_STAGE[st] ?? st,
    "Brand Partners":    funnel.brandPartners[st] ?? 0,
    "Corporates":        funnel.corporates[st] ?? 0,
    "Friend. Schools":   funnel.friendshipSchools[st] ?? 0,
  }));

  // 2. Donut: overall status split
  const mouDoneTotal = (funnel.brandPartners["MOU Done"] ?? 0)
    + (funnel.corporates["MOU Done"] ?? 0)
    + (funnel.friendshipSchools["MOU Done"] ?? 0);
  const droppedTotal = (funnel.brandPartners["Not Interested / Dropped"] ?? 0)
    + (funnel.corporates["Not Interested / Dropped"] ?? 0)
    + (funnel.friendshipSchools["Not Interested / Dropped"] ?? 0);
  const inPipeline = kpi.totalProspects - mouDoneTotal - droppedTotal;
  const donutData = [
    { name: "MOU Done",    value: mouDoneTotal, color: C.green  },
    { name: "In Pipeline", value: inPipeline,   color: C.blue   },
    { name: "Dropped",     value: droppedTotal, color: C.red    },
  ];

  // 3. Horizontal bar: top categories (total vs MOU done)
  const catChartData = categoryBreakdown
    .slice(0, 12)
    .map(c => ({ name: c.name.length > 22 ? c.name.slice(0, 20) + "…" : c.name, Total: c.total, "MOU Done": c.mouDone }))
    .reverse();

  // 4. Horizontal bar: team leaderboard
  const leaderData = ownerLeaderboard
    .filter(o => o.name.trim())
    .slice(0, 10)
    .map(o => ({ name: o.name.split(" ")[0], Total: o.total, "MOU Done": o.mouDone }))
    .reverse();

  // 5. PA funnel
  const paData = data.paStatuses.map(st => ({
    name: st, value: data.funnel.parentAdvocacy[st] ?? 0,
  }));
  const PA_COLORS = [C.blue, C.indigo, C.amber, C.green, C.red];

  // Vertical conversion rates for radial chart
  const verticals = [
    { name: "Brand Partners", total: data.brandPartners.length, mou: funnel.brandPartners["MOU Done"] ?? 0, fill: C.navy },
    { name: "Corporates",     total: data.corporates.length,    mou: funnel.corporates["MOU Done"] ?? 0,    fill: C.blue },
    { name: "Fr. Schools",    total: data.friendshipSchools.length, mou: funnel.friendshipSchools["MOU Done"] ?? 0, fill: C.teal },
  ].map(v => ({ ...v, rate: v.total > 0 ? Math.round((v.mou / v.total) * 100) : 0 }));

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Total Prospects" value={kpi.totalProspects} sub="All verticals" />
        <KpiCard label="Active MOUs" value={kpi.totalMouDone} sub="Tie-ups live" accent="text-green-600" />
        <KpiCard label="Total Admissions" value={kpi.totalAdmissions} sub="Referred till date" accent="text-amber-600" />
        <KpiCard label="Follow-up Needed" value={kpi.totalFollowUp} sub="> 7 days stale" accent={kpi.totalFollowUp > 0 ? "text-red-600" : "text-slate-400"} />
        <KpiCard label="PA Referrals" value={kpi.paReferrals} sub="Parent advocacy" />
        <KpiCard label="PA Conversions" value={kpi.paAdmissions} sub="Admissions confirmed" accent="text-green-600" />
      </div>

      {/* Row 1: Pipeline bar chart + MOU donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stacked pipeline bar — spans 2 cols */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 lg:col-span-2">
          <div className="font-bold text-sm text-[#091a4f] mb-4">Pipeline Stage Distribution — All Verticals</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stageChartData} margin={{ top: 4, right: 12, left: -10, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "#64748b" }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar dataKey="Brand Partners"   fill={C.navy}  radius={[3,3,0,0]} />
              <Bar dataKey="Corporates"       fill={C.blue}  radius={[3,3,0,0]} />
              <Bar dataKey="Friend. Schools"  fill={C.teal}  radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* MOU conversion donut */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col">
          <div className="font-bold text-sm text-[#091a4f] mb-2">Overall Prospect Status</div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: any, n: any) => [v, n]} contentStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 w-full mt-1">
              {donutData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Conversion rates per vertical */}
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase">MOU Conversion Rate</div>
            {verticals.map(v => (
              <div key={v.name} className="flex items-center gap-2 text-xs">
                <div className="w-24 text-slate-600 truncate">{v.name}</div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${v.rate}%`, background: v.fill }} />
                </div>
                <div className="w-8 text-right font-bold text-slate-700">{v.rate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Category chart + Team leaderboard chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top categories horizontal bar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="font-bold text-sm text-[#091a4f] mb-4">Top Brand Partner Categories</div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={catChartData} layout="vertical" margin={{ top: 0, right: 40, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "#64748b" }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Total"    fill={C.navy}  radius={[0,3,3,0]}>
                <LabelList dataKey="Total" position="right" style={{ fontSize: 10, fill: "#64748b" }} />
              </Bar>
              <Bar dataKey="MOU Done" fill={C.green} radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Team leaderboard horizontal bar */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="font-bold text-sm text-[#091a4f] mb-4">Team Leaderboard — Prospects Owned</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={leaderData} layout="vertical" margin={{ top: 0, right: 40, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#334155" }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Total"    fill={C.navy}  radius={[0,3,3,0]}>
                <LabelList dataKey="Total" position="right" style={{ fontSize: 10, fill: "#64748b" }} />
              </Bar>
              <Bar dataKey="MOU Done" fill={C.green} radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>

          {/* PA funnel compact below leaderboard */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="font-bold text-sm text-[#091a4f] mb-3">Parent Advocacy Funnel</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={paData} margin={{ top: 0, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} width={20} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="value" radius={[3,3,0,0]}>
                  {paData.map((_, i) => <Cell key={i} fill={PA_COLORS[i % PA_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Stage breakdown text cards (quick reference) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Brand Partners", counts: funnel.brandPartners, total: data.brandPartners.length },
          { title: "Corporate Tie-ups", counts: funnel.corporates, total: data.corporates.length },
          { title: "Friendship Schools", counts: funnel.friendshipSchools, total: data.friendshipSchools.length },
        ].map(({ title, counts, total }) => (
          <div key={title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-sm text-[#091a4f]">{title}</div>
              <div className="text-xs text-slate-400">{total} total</div>
            </div>
            <FunnelBar stages={pipelineStages} counts={counts} palette={STAGE_COLOR} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Brand Partners Tab ────────────────────────────────────────
function BrandPartnersTab({ data }: { data: AlliancesData }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterOwner, setFilterOwner] = useState("");

  const cats = [...new Set(data.brandPartners.map(b => b.category).filter(Boolean))].sort();
  const owners = [...new Set(data.brandPartners.map(b => b.owner).filter(Boolean))].sort();

  const rows = data.brandPartners.filter(b => {
    if (filterCat && b.category !== filterCat) return false;
    if (filterStage && b.stage !== filterStage) return false;
    if (filterOwner && b.owner !== filterOwner) return false;
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const mouDone = rows.filter(b => b.stage === "MOU Done").length;
  const totalAdm = rows.reduce((s, b) => s + b.admissionsReferred, 0);
  const needsFU = rows.filter(b => b.followUpNeeded).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search brands…" />
        <Select value={filterCat} onChange={setFilterCat} options={cats} placeholder="All categories" />
        <Select value={filterStage} onChange={setFilterStage} options={data.pipelineStages} placeholder="All stages" />
        <Select value={filterOwner} onChange={setFilterOwner} options={owners} placeholder="All owners" />
        <div className="ml-auto flex gap-4 text-sm">
          <span className="text-slate-500">{rows.length} shown</span>
          <span className="text-green-600 font-semibold">{mouDone} MOU Done</span>
          {totalAdm > 0 && <span className="text-amber-600 font-semibold">{totalAdm} admissions</span>}
          {needsFU > 0 && <span className="text-red-500 font-semibold">{needsFU} follow-up needed</span>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Brand Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">MOU Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Adm</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Days</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Assets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((b, i) => (
                <tr key={b.sno + i} className={`hover:bg-slate-50 transition ${b.followUpNeeded ? "bg-red-50/40" : ""}`}>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{b.sno}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[200px]">
                    <div className="truncate">{b.name}</div>
                    {b.discount && <div className="text-xs text-slate-400 truncate max-w-[180px]">{b.discount}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{b.category || "—"}</td>
                  <td className="px-4 py-2.5"><StageBadge stage={b.stage} palette={STAGE_COLOR} /></td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{b.owner || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{b.mouDoneDate || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-amber-600">{b.admissionsReferred > 0 ? b.admissionsReferred : "—"}</td>
                  <td className={`px-4 py-2.5 text-right text-xs font-semibold ${b.daysSinceUpdate > 7 ? "text-red-500" : "text-slate-400"}`}>
                    {b.daysSinceUpdate > 0 ? b.daysSinceUpdate : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      {b.hasBanner && <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">Banner</span>}
                      {b.hasWebsite && <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Web</span>}
                      {b.hasBrochure && <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">Brochure</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Corporates Tab ────────────────────────────────────────────
function CorporatesTab({ data }: { data: AlliancesData }) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("");
  const [filterOwner, setFilterOwner] = useState("");

  const owners = [...new Set(data.corporates.map(c => c.owner).filter(Boolean))].sort();

  const rows = data.corporates.filter(c => {
    if (filterStage && c.stage !== filterStage) return false;
    if (filterOwner && c.owner !== filterOwner) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.industry.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search corporates…" />
        <Select value={filterStage} onChange={setFilterStage} options={data.pipelineStages} placeholder="All stages" />
        <Select value={filterOwner} onChange={setFilterOwner} options={owners} placeholder="All owners" />
        <div className="ml-auto text-sm text-slate-500">{rows.length} shown</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Corporate</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Industry</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">MOU Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Adm</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Days</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((c, i) => (
                <tr key={c.sno + i} className={`hover:bg-slate-50 transition ${c.followUpNeeded ? "bg-red-50/40" : ""}`}>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{c.sno}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">
                    <div className="truncate max-w-[180px]">{c.name}</div>
                    {c.location && <div className="text-xs text-slate-400">{c.location}</div>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs max-w-[140px]"><div className="truncate">{c.industry || "—"}</div></td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{c.size || "—"}</td>
                  <td className="px-4 py-2.5"><StageBadge stage={c.stage} palette={STAGE_COLOR} /></td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{c.owner || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{c.mouDoneDate || "—"}</td>
                  <td className="px-4 py-2.5 text-right font-bold text-amber-600">{c.admissionsReferred > 0 ? c.admissionsReferred : "—"}</td>
                  <td className={`px-4 py-2.5 text-right text-xs font-semibold ${c.daysSinceUpdate > 7 ? "text-red-500" : "text-slate-400"}`}>
                    {c.daysSinceUpdate > 0 ? c.daysSinceUpdate : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs max-w-[180px]"><div className="truncate">{c.remarks || "—"}</div></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Friendship Schools Tab ────────────────────────────────────
function FriendshipSchoolsTab({ data }: { data: AlliancesData }) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("");

  const rows = data.friendshipSchools.filter(s => {
    if (filterStage && s.stage !== filterStage) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.location.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalAdm = rows.reduce((s, r) => s + r.totalAdm, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search schools…" />
        <Select value={filterStage} onChange={setFilterStage} options={data.pipelineStages} placeholder="All stages" />
        <div className="ml-auto flex gap-4 text-sm">
          <span className="text-slate-500">{rows.length} shown</span>
          {totalAdm > 0 && <span className="text-amber-600 font-semibold">{totalAdm} total admissions</span>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">School Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Contract</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Stage</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Approached</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Jr KG</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Sr KG</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">Total Adm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((s, i) => (
                <tr key={s.sno + i} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{s.sno}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[200px]"><div className="truncate">{s.name}</div></td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{s.location || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{s.contractType || "—"}</td>
                  <td className="px-4 py-2.5"><StageBadge stage={s.stage} palette={STAGE_COLOR} /></td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{s.owner || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{s.dateApproached || "—"}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600 font-semibold">{s.admJrKg > 0 ? s.admJrKg : "—"}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600 font-semibold">{s.admSrKg > 0 ? s.admSrKg : "—"}</td>
                  <td className="px-4 py-2.5 text-right font-black text-amber-600">{s.totalAdm > 0 ? s.totalAdm : "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Parent Advocacy Tab ───────────────────────────────────────
function ParentAdvocacyTab({ data }: { data: AlliancesData }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const rows = data.parentAdvocacy.filter(p => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (search && !p.referringParent.toLowerCase().includes(search.toLowerCase()) && !p.referredFamily.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const confirmed = data.parentAdvocacy.filter(p => p.status === "Admission Confirmed").length;
  const conversion = data.parentAdvocacy.length > 0
    ? Math.round((confirmed / data.parentAdvocacy.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-2">
        {data.paStatuses.map(st => (
          <div key={st} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 text-center">
            <div className="text-xl font-black text-[#091a4f]">{data.funnel.parentAdvocacy[st] ?? 0}</div>
            <div className="text-xs text-slate-500 mt-0.5">{st}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span>Total: <strong>{data.parentAdvocacy.length}</strong></span>
        <span>Confirmed: <strong className="text-green-600">{confirmed}</strong></span>
        <span>Conversion: <strong className="text-amber-600">{conversion}%</strong></span>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search families…" />
        <Select value={filterStatus} onChange={setFilterStatus} options={data.paStatuses} placeholder="All statuses" />
        <div className="ml-auto text-sm text-slate-500">{rows.length} shown</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Referring Parent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Ward Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Referred Family</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Grade Applying</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date Referred</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Owner</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Incentive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((p, i) => (
                <tr key={p.sno + i} className={`hover:bg-slate-50 transition ${p.status === "Admission Confirmed" ? "bg-green-50/40" : ""}`}>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{p.sno}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{p.referringParent}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{p.wardClass || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-700">{p.referredFamily || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{p.gradeApplying || "—"}</td>
                  <td className="px-4 py-2.5"><StageBadge stage={p.status} palette={PA_COLOR} /></td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{p.dateReferred || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{p.owner || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{p.incentiveGiven || "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
type TabKey = "overview" | "brandPartners" | "corporates" | "friendshipSchools" | "parentAdvocacy";
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "brandPartners", label: "Brand Partners" },
  { key: "corporates", label: "Corporates" },
  { key: "friendshipSchools", label: "Friendship Schools" },
  { key: "parentAdvocacy", label: "Parent Advocacy" },
];

function AlliancesDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [fetchKey, setFetchKey] = useState(0);

  const { data, isLoading, isError, dataUpdatedAt } = useQuery<AlliancesData>({
    queryKey: ["alliances-live", fetchKey],
    queryFn: () => fetch("/api/alliances/live").then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const syncTime = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#091a4f] sticky top-0 z-30 shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-xs shrink-0">RIS</div>
            <div>
              <div className="text-white font-black text-base leading-tight">Strategic Alliances Dashboard</div>
              <div className="text-slate-400 text-xs">
                {syncTime ? <>Live from Google Sheets · synced {syncTime}</> : "Loading…"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setFetchKey(k => k + 1)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-[#091a4f] text-sm font-bold hover:bg-amber-300 transition disabled:opacity-60"
            data-testid="button-refresh"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            REFRESH
          </button>
        </div>
        {/* Tabs */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${tab === t.key ? "text-amber-400 border-amber-400" : "text-slate-400 border-transparent hover:text-white"}`}>
                {t.label}
                {t.key === "brandPartners" && data && <span className="ml-1.5 text-xs opacity-60">{data.brandPartners.length}</span>}
                {t.key === "corporates" && data && <span className="ml-1.5 text-xs opacity-60">{data.corporates.length}</span>}
                {t.key === "friendshipSchools" && data && <span className="ml-1.5 text-xs opacity-60">{data.friendshipSchools.length}</span>}
                {t.key === "parentAdvocacy" && data && <span className="ml-1.5 text-xs opacity-60">{data.parentAdvocacy.length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-32 text-slate-400">
            <svg className="w-6 h-6 animate-spin mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Fetching live data from Google Sheets…
          </div>
        )}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
            Failed to load data. Please click REFRESH to try again.
          </div>
        )}
        {data && !isLoading && (
          <>
            {tab === "overview" && <OverviewTab data={data} />}
            {tab === "brandPartners" && <BrandPartnersTab data={data} />}
            {tab === "corporates" && <CorporatesTab data={data} />}
            {tab === "friendshipSchools" && <FriendshipSchoolsTab data={data} />}
            {tab === "parentAdvocacy" && <ParentAdvocacyTab data={data} />}
          </>
        )}
      </div>
    </div>
  );
}

// ── Page entry point ───────────────────────────────────────────
export default function Alliances() {
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  const unlock = useCallback(() => {
    try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {}
    setAuthed(true);
  }, []);
  if (!authed) return <PasscodeGate onSuccess={unlock} />;
  return <AlliancesDashboard />;
}
