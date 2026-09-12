import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import FriendshipQRTab from "./FriendshipQRTab";
import { matchesParentAdvocacyFilters } from "@shared/parentAdvocacyPac";

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
  sno: string; referringParent: string; branch: string; wardClass: string;
  fatherName: string; motherName: string; contactNumber: string;
  referredFamily: string; gradeApplying: string; status: string;
  dateReferred: string; lastUpdate: string; incentiveGiven: string;
  partnerStatus: string;
  pacAttendance: Record<string, string>;
}
interface PacMeeting { key: string; label: string; date: string; attendedCount: number; }
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
  paPartnerStatuses: string[];
  partnerStatusCounts: { accepted: number; pending: number; rejected: number; notReached: number; };
  pacMeetings: PacMeeting[];
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
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/alliances/verify-passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: code }),
        credentials: "same-origin",
      });
      if (res.ok) {
        onSuccess();
      } else {
        setError(true); setShake(true); setCode("");
        setTimeout(() => setShake(false), 500);
      }
    } catch {
      setError(true); setShake(true); setCode("");
      setTimeout(() => setShake(false), 500);
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-[#091a4f] flex items-center justify-center p-4">
      <form onSubmit={submit}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm"
        style={{ animation: shake ? "shake 0.4s ease" : "none" }}>
        <div className="flex items-center gap-3 mb-6">
          <img src="/images/rainbow-group-logo.png" alt="Rainbow Group" className="h-10 w-auto object-contain" />
        </div>
        <div className="mb-5">
          <div className="font-black text-lg text-[#091a4f] leading-tight">Alliances Dashboard</div>
          <div className="text-xs text-slate-500">Strategic Alliances & Branding · Internal</div>
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
        <button type="submit" disabled={loading} data-testid="button-unlock"
          className="mt-5 w-full py-3 rounded-lg bg-[#091a4f] text-white font-bold hover:bg-[#0b2168] transition disabled:opacity-60">
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

// ── Shared helpers ─────────────────────────────────────────────
function StageBadge({ stage, palette, label }: { stage: string; palette: Record<string, string>; label?: string }) {
  const cls = palette[stage] ?? "bg-slate-100 text-slate-600";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{label ?? stage ?? "—"}</span>;
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

// ── Colour tokens ────────────────────────────────────────────
const C = {
  navy:   "#091a4f", amber:  "#f59e0b", green:  "#22c55e",
  blue:   "#3b82f6", indigo: "#6366f1", purple: "#a855f7",
  red:    "#ef4444", slate:  "#94a3b8", teal:   "#14b8a6",
  orange: "#f97316",
};
const STAGE_COLOR_HEX: Record<string, string> = {
  "Not Contacted": C.slate, "Initial Discussion": C.blue,
  "Touchbase Done": C.indigo, "Waiting for Revert": C.amber,
  "MOU Sent": C.orange, "MOU Signing Pending": C.purple,
  "MOU Done": C.green, "Not Interested / Dropped": C.red,
  // PA ambassador statuses
  "Accepted": C.green, "To be Decided": C.amber,
  "Not yet reached": C.slate, "Rejected": C.red,
};

// ── useCountUp: animates 0 → target over ~1.1 s ──────────────
function useCountUp(target: number, duration = 1100) {
  const [val, setVal] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return val;
}

// ── AnimatedNumber ────────────────────────────────────────────
function AN({ value, className = "" }: { value: number; className?: string }) {
  const n = useCountUp(value);
  return <span className={className}>{n.toLocaleString()}</span>;
}

// ── AnimatedRing: SVG circular progress with big number ───────
function AnimatedRing({
  value, max, size = 120, stroke = 10, color, label, sub,
  suffix = "",
}: {
  value: number; max: number; size?: number; stroke?: number;
  color: string; label: string; sub?: string; suffix?: string;
}) {
  const n = useCountUp(value);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  const [dash, setDash] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDash(pct * circ));
    return () => cancelAnimationFrame(id);
  }, [pct, circ]);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="#f1f5f9" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - dash}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-black text-xl leading-none" style={{ color }}>
            {n.toLocaleString()}{suffix}
          </span>
          {max !== value && (
            <span className="text-[10px] text-slate-400 mt-0.5">/ {max.toLocaleString()}</span>
          )}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-[#091a4f]">{label}</div>
        {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

// ── AnimatedBar row ────────────────────────────────────────────
function AnimatedBarRow({
  label, value, max, color, rank,
}: { label: string; value: number; max: number; color: string; rank?: number }) {
  const n = useCountUp(value);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setWidth(max > 0 ? (value / max) * 100 : 0));
    return () => cancelAnimationFrame(id);
  }, [value, max]);
  return (
    <div className="flex items-center gap-3">
      {rank !== undefined && (
        <div className="w-5 text-center text-[10px] font-bold text-slate-300 shrink-0">
          #{rank + 1}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-600 truncate pr-2">{label}</span>
          <span className="text-xs font-black shrink-0" style={{ color }}>
            {n.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full"
            style={{
              width: `${width}%`, background: color,
              transition: "width 1.1s cubic-bezier(0.34,1.0,0.64,1)",
            }} />
        </div>
      </div>
    </div>
  );
}

// ── Stage tile ─────────────────────────────────────────────────
function StageTile({ stage, count, delay = 0 }: { stage: string; count: number; delay?: number }) {
  const n = useCountUp(count);
  const color = STAGE_COLOR_HEX[stage] ?? C.slate;
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center gap-1.5 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <div className="text-3xl font-black" style={{ color }}>{n}</div>
      <div className="text-[10px] text-slate-500 text-center leading-tight">{stage}</div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────
type VerticalKey = "all" | "brandPartners" | "corporates" | "friendshipSchools" | "parentAdvocacy";
const VERTICAL_OPTS: { key: VerticalKey; label: string; color: string }[] = [
  { key: "all",              label: "All Verticals",    color: C.navy  },
  { key: "brandPartners",    label: "Brand Partners",   color: C.navy  },
  { key: "corporates",       label: "Corporates",       color: C.blue  },
  { key: "friendshipSchools",label: "Friendship Schools",color: C.teal },
  { key: "parentAdvocacy",   label: "Parent Advocacy",  color: C.amber },
];

function OverviewTab({ data }: { data: AlliancesData }) {
  const { kpi, funnel, ownerLeaderboard, categoryBreakdown, pipelineStages } = data;

  // ── Filter state ──────────────────────────────────────────
  const [filterVertical, setFilterVertical] = useState<VerticalKey>("all");
  const [filterBPCat, setFilterBPCat]       = useState("");

  // Reset sub-filter when vertical changes
  useEffect(() => { setFilterBPCat(""); }, [filterVertical]);

  const bpCategories = useMemo(
    () => [...new Set(data.brandPartners.map(b => b.category).filter(Boolean))].sort(),
    [data.brandPartners],
  );

  // ── Derive filtered rows (or null = "all") ────────────────
  const filteredRows = useMemo(() => {
    if (filterVertical === "brandPartners") {
      const rows = filterBPCat
        ? data.brandPartners.filter(b => b.category === filterBPCat)
        : data.brandPartners;
      return { rows, source: "bp" as const };
    }
    if (filterVertical === "corporates")
      return { rows: data.corporates, source: "corp" as const };
    if (filterVertical === "friendshipSchools")
      return { rows: data.friendshipSchools, source: "fs" as const };
    if (filterVertical === "parentAdvocacy")
      return { rows: data.parentAdvocacy, source: "pa" as const };
    return null;
  }, [filterVertical, filterBPCat, data]);

  // ── Derived KPI numbers ───────────────────────────────────
  const stats = useMemo(() => {
    if (!filteredRows) {
      const mouDone   = (funnel.brandPartners["MOU Done"] ?? 0) + (funnel.corporates["MOU Done"] ?? 0) + (funnel.friendshipSchools["MOU Done"] ?? 0);
      const mouSent   = (funnel.brandPartners["MOU Sent"] ?? 0) + (funnel.corporates["MOU Sent"] ?? 0) + (funnel.friendshipSchools["MOU Sent"] ?? 0);
      const dropped   = (funnel.brandPartners["Not Interested / Dropped"] ?? 0) + (funnel.corporates["Not Interested / Dropped"] ?? 0) + (funnel.friendshipSchools["Not Interested / Dropped"] ?? 0);
      const total     = kpi.totalProspects + data.parentAdvocacy.length;
      return { total, mouDone, mouSent, dropped, inPipeline: total - mouDone - dropped, admissions: kpi.totalAdmissions };
    }
    const { rows, source } = filteredRows;
    if (source === "pa") {
      const onboarded = rows.filter((r: any) => r.partnerStatus?.toLowerCase().includes("accept")).length;
      const dropped   = rows.filter((r: any) => r.status === "Not Interested").length;
      const confirmed = rows.filter((r: any) => r.status === "Admission Confirmed").length;
      return { total: rows.length, mouDone: onboarded, mouSent: 0, dropped, inPipeline: rows.length - onboarded - dropped, admissions: confirmed };
    }
    const mouDone   = rows.filter((r: any) => r.stage === "MOU Done").length;
    const mouSent   = rows.filter((r: any) => r.stage === "MOU Sent").length;
    const dropped   = rows.filter((r: any) => r.stage === "Not Interested / Dropped").length;
    const admissions = rows.reduce((s: number, r: any) => s + (r.admissionsReferred ?? r.totalAdm ?? 0), 0);
    return { total: rows.length, mouDone, mouSent, dropped, inPipeline: rows.length - mouDone - dropped, admissions };
  }, [filteredRows, funnel, kpi]);

  // ── Derived stage counts ──────────────────────────────────
  const stageCounts = useMemo(() => {
    if (!filteredRows) {
      return Object.fromEntries(pipelineStages.map(st => [
        st,
        (funnel.brandPartners[st] ?? 0) + (funnel.corporates[st] ?? 0) + (funnel.friendshipSchools[st] ?? 0),
      ]));
    }
    if (filteredRows.source === "pa") {
      // Use partnerStatus (ambassador recruitment status), blank → "Not yet reached"
      const psc = data.partnerStatusCounts;
      return {
        "Accepted":       psc.accepted,
        "To be Decided":  psc.pending,
        "Not yet reached": psc.notReached,
        "Rejected":       psc.rejected,
      };
    }
    const counts: Record<string, number> = {};
    filteredRows.rows.forEach((r: any) => {
      const s = r.stage;
      if (s) counts[s] = (counts[s] ?? 0) + 1;
    });
    return counts;
  }, [filteredRows, funnel, pipelineStages]);

  // ── PA branch-wise ambassador distribution ─────────────────
  const paBranchStats = useMemo(() => {
    const map: Record<string, { accepted: number; pending: number; notReached: number; rejected: number; total: number }> = {};
    data.parentAdvocacy.forEach((p: any) => {
      const br = (p.branch ?? "").trim() || "Unassigned";
      if (!map[br]) map[br] = { accepted: 0, pending: 0, notReached: 0, rejected: 0, total: 0 };
      const ps = (p.partnerStatus ?? "").trim().toLowerCase();
      if (ps.includes("accept"))                          map[br].accepted++;
      else if (ps.includes("reject") || ps.includes("declin")) map[br].rejected++;
      else if (ps)                                        map[br].pending++;
      else                                                map[br].notReached++;
      map[br].total++;
    });
    return Object.entries(map)
      .map(([branch, c]) => ({ branch, ...c }))
      .sort((a, b) => b.total - a.total);
  }, [data.parentAdvocacy]);

  // ── Verticals for conversion rings ────────────────────────
  const allVerticals = [
    { name: "Brand Partners",    label: "BP",   total: data.brandPartners.length,    mou: funnel.brandPartners["MOU Done"] ?? 0,    color: C.navy },
    { name: "Corporates",        label: "Corp", total: data.corporates.length,        mou: funnel.corporates["MOU Done"] ?? 0,        color: C.blue },
    { name: "Friendship Schools",label: "FS",   total: data.friendshipSchools.length, mou: funnel.friendshipSchools["MOU Done"] ?? 0, color: C.teal },
    { name: "Parent Advocacy",   label: "PA",   total: data.parentAdvocacy.length,   mou: data.parentAdvocacy.filter(p => p.partnerStatus?.toLowerCase().includes("accept")).length, color: C.amber },
  ].map(v => ({ ...v, rate: v.total > 0 ? Math.round((v.mou / v.total) * 100) : 0 }));

  const verticals = filterVertical === "all" ? allVerticals
    : allVerticals.filter(v =>
        (filterVertical === "brandPartners"    && v.name === "Brand Partners") ||
        (filterVertical === "corporates"       && v.name === "Corporates") ||
        (filterVertical === "friendshipSchools"&& v.name === "Friendship Schools"),
      );
  const vertMax = Math.max(...allVerticals.map(v => v.total), 1);

  // ── Category + owner lists ────────────────────────────────
  const topCats = useMemo(() => {
    if (filterVertical === "brandPartners" && filterBPCat) return [];
    return categoryBreakdown.slice(0, 12);
  }, [categoryBreakdown, filterVertical, filterBPCat]);
  const catMax = topCats[0]?.total ?? 1;
  const topOwners = ownerLeaderboard.filter(o => o.name.trim()).slice(0, 10);
  const ownerMax = topOwners[0]?.total ?? 1;

  const isFiltered = filterVertical !== "all" || filterBPCat !== "";
  const activeColor = VERTICAL_OPTS.find(o => o.key === filterVertical)?.color ?? C.navy;

  return (
    <div className="space-y-8">

      {/* ── Filter bar ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">View by</span>
          <div className="flex flex-wrap gap-2">
            {VERTICAL_OPTS.map(opt => (
              <button key={opt.key}
                onClick={() => setFilterVertical(opt.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  filterVertical === opt.key
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
                style={filterVertical === opt.key ? { background: opt.color } : {}}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* BP category chips — only when Brand Partners selected */}
          {filterVertical === "brandPartners" && (
            <div className="mt-2 w-full max-w-xs">
              <select
                value={filterBPCat}
                onChange={e => setFilterBPCat(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#091a4f]/20 focus:border-[#091a4f]"
              >
                <option value="">All Categories</option>
                {bpCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 1: Hero KPI rings ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {filterBPCat ? `${filterBPCat} · Brand Partners` : VERTICAL_OPTS.find(o => o.key === filterVertical)?.label} Snapshot
          </div>
          {isFiltered && (
            <button onClick={() => { setFilterVertical("all"); setFilterBPCat(""); }}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 border border-slate-200 rounded-full px-2 py-0.5 transition-colors">
              ✕ Reset
            </button>
          )}
        </div>
        {filterVertical === "parentAdvocacy" ? (
          /* PA-specific recruitment rings */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
            <AnimatedRing value={stats.total} max={stats.total || 1}
              color={C.amber} label="Total" sub="Ambassadors targeted" size={110} />
            <AnimatedRing value={data.partnerStatusCounts.accepted} max={stats.total || 1}
              color={C.green} label="Accepted" sub="Onboarded as ambassador" size={110} />
            <AnimatedRing value={data.partnerStatusCounts.pending} max={stats.total || 1}
              color={C.orange} label="To be Decided" sub="Considering" size={110} />
            <AnimatedRing value={data.partnerStatusCounts.notReached} max={stats.total || 1}
              color={C.slate} label="Not Yet Reached" sub="Pending outreach" size={110} />
            <AnimatedRing value={data.partnerStatusCounts.rejected} max={stats.total || 1}
              color={C.red} label="Rejected" sub="Declined" size={110} />
            <AnimatedRing value={data.kpi.paAdmissions} max={stats.total || 1}
              color={C.teal} label="Admission Done" sub="Referrals admitted" size={110} />
          </div>
        ) : (
          /* Standard MOU pipeline rings */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
            <AnimatedRing value={stats.total} max={stats.total || 1}
              color={activeColor} label="Total" sub={filterBPCat || (filterVertical !== "all" ? VERTICAL_OPTS.find(o => o.key === filterVertical)?.label : undefined) || "Targeted Entities"} size={110} />
            <AnimatedRing value={stats.mouDone} max={stats.total || 1}
              color={C.green} label="MOU Done" sub="Tie-ups signed" size={110} />
            <AnimatedRing value={stats.mouSent} max={stats.total || 1}
              color={C.purple} label="MOU Sent" sub="Awaiting signature" size={110} />
            <AnimatedRing value={stats.inPipeline} max={stats.total || 1}
              color={C.blue} label="In Pipeline" sub="Active pursuit" size={110} />
            <AnimatedRing value={stats.dropped} max={stats.total || 1}
              color={C.red} label="Dropped" sub="Not interested" size={110} />
            <AnimatedRing value={stats.admissions} max={stats.admissions || 1}
              color={C.amber} label="Admissions" sub="Referred till date" size={110} />
          </div>
        )}
      </div>

      {/* ── Row 2: Vertical rings + stage tiles ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Vertical MOU conversion rings — hidden for PA view */}
        {filterVertical !== "parentAdvocacy" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
            Conversion by Vertical
          </div>
          <div className="flex justify-around items-start flex-wrap gap-6">
            {verticals.map(v => (
              <AnimatedRing key={v.name}
                value={v.rate} max={100} suffix="%" size={120} stroke={11}
                color={v.color} label={v.name}
                sub={v.name === "Parent Advocacy" ? `${v.mou} of ${v.total} Onboarded` : `${v.mou} of ${v.total} MOUs`} />
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            {verticals.map(v => (
              <AnimatedBarRow key={v.name}
                label={v.name} value={v.total} max={vertMax} color={v.color} />
            ))}
          </div>
        </div>
        )}

        {/* Stage tiles grid */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${filterVertical === "parentAdvocacy" ? "lg:col-span-5" : "lg:col-span-3"}`}>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
            {filterVertical === "parentAdvocacy" ? "Ambassador Status Distribution" : "Pipeline Stage Distribution"}
          </div>
          {filterVertical === "parentAdvocacy" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["Accepted", "To be Decided", "Not yet reached", "Rejected"] as const).map((st, i) => (
                <StageTile key={st} stage={st} count={stageCounts[st] ?? 0} delay={i * 60} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {pipelineStages.map((st, i) => (
                <StageTile key={st} stage={st} count={stageCounts[st] ?? 0} delay={i * 60} />
              ))}
            </div>
          )}
          {/* Per-vertical mini breakdown — only in "all" mode */}
          {filterVertical === "all" && (
            <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-x-8 gap-y-5 text-xs">
              {/* MOU-based verticals */}
              {([ 
                { name: "Brand Partners",     f: funnel.brandPartners     },
                { name: "Corporates",         f: funnel.corporates        },
                { name: "Friendship Schools", f: funnel.friendshipSchools },
              ] as const).map(v => (
                <div key={v.name}>
                  <div className="font-bold text-[#091a4f] mb-2">{v.name}</div>
                  {(["MOU Done","MOU Sent","Touchbase Done","Initial Discussion"] as const).map(st => (
                    <div key={st} className="flex justify-between py-0.5">
                      <span className="text-slate-500 truncate pr-1">{st}</span>
                      <span className="font-black shrink-0" style={{ color: STAGE_COLOR_HEX[st] ?? C.slate }}>
                        <AN value={v.f[st] ?? 0} />
                      </span>
                    </div>
                  ))}
                </div>
              ))}
              {/* Parent Advocacy — ambassador statuses, not MOU stages */}
              <div>
                <div className="font-bold text-[#091a4f] mb-2">Parent Advocacy</div>
                {([
                  { label: "Accepted",        value: data.partnerStatusCounts.accepted,   color: C.green },
                  { label: "To be Decided",   value: data.partnerStatusCounts.pending,    color: C.amber },
                  { label: "Not Yet Reached", value: data.partnerStatusCounts.notReached, color: C.slate },
                  { label: "Rejected",        value: data.partnerStatusCounts.rejected,   color: C.red   },
                ] as const).map(s => (
                  <div key={s.label} className="flex justify-between py-0.5">
                    <span className="text-slate-500 truncate pr-1">{s.label}</span>
                    <span className="font-black shrink-0" style={{ color: s.color }}><AN value={s.value} /></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PA Branch Distribution — only for PA view ─────── */}
      {filterVertical === "parentAdvocacy" && paBranchStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
            Branch-wise Ambassador Distribution
          </div>
          <div className="space-y-4">
            {paBranchStats.map(b => {
              const total = b.total || 1;
              return (
                <div key={b.branch}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700 capitalize">{b.branch.charAt(0) + b.branch.slice(1).toLowerCase()}</span>
                    <span className="text-xs text-slate-400 font-medium">{b.total} ambassadors</span>
                  </div>
                  {/* Segmented bar */}
                  <div className="flex h-2.5 rounded-full overflow-hidden gap-px bg-slate-100">
                    {b.accepted  > 0 && <div style={{ width: `${(b.accepted  / total) * 100}%`, background: C.green  }} title={`Accepted: ${b.accepted}`} />}
                    {b.pending   > 0 && <div style={{ width: `${(b.pending   / total) * 100}%`, background: C.amber  }} title={`To be Decided: ${b.pending}`} />}
                    {b.notReached> 0 && <div style={{ width: `${(b.notReached/ total) * 100}%`, background: C.slate  }} title={`Not Yet Reached: ${b.notReached}`} />}
                    {b.rejected  > 0 && <div style={{ width: `${(b.rejected  / total) * 100}%`, background: C.red    }} title={`Rejected: ${b.rejected}`} />}
                  </div>
                  {/* Count pills */}
                  <div className="flex gap-4 mt-1.5 text-[11px] font-semibold">
                    {b.accepted   > 0 && <span style={{ color: C.green  }}>✓ {b.accepted} Accepted</span>}
                    {b.pending    > 0 && <span style={{ color: C.amber  }}>◷ {b.pending} To be Decided</span>}
                    {b.notReached > 0 && <span style={{ color: C.slate  }}>· {b.notReached} Not Yet Reached</span>}
                    {b.rejected   > 0 && <span style={{ color: C.red    }}>✕ {b.rejected} Rejected</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
}

// ── Tab Summary Infographic ───────────────────────────────────
function TabSummary({
  stats, pipelineStages, stageCounts, topOwners,
}: {
  stats: Array<{ label: string; value: number | string; color: string; bold?: boolean }>;
  pipelineStages: string[];
  stageCounts: Record<string, number>;
  topOwners: Array<{ name: string; count: number }>;
}) {
  const total = pipelineStages.reduce((s, st) => s + (stageCounts[st] ?? 0), 0) || 1;
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
      {/* Stat tiles */}
      <div className="flex flex-wrap gap-3">
        {stats.map(s => (
          <div key={s.label}
            className="flex flex-col items-center bg-slate-50 rounded-xl px-5 py-3 min-w-[88px] border border-slate-100">
            <div className="text-2xl font-black leading-none" style={{ color: s.color }}>
              {typeof s.value === "number" ? <AN value={s.value} /> : s.value}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Segmented stage bar */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stage Breakdown</div>
        <div className="flex h-3 rounded-full overflow-hidden">
          {pipelineStages.map(st => {
            const cnt = stageCounts[st] ?? 0;
            if (!cnt) return null;
            return (
              <div key={st} title={`${st}: ${cnt}`}
                style={{ width: `${(cnt / total) * 100}%`, background: STAGE_COLOR_HEX[st] ?? C.slate }} />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {pipelineStages.filter(st => (stageCounts[st] ?? 0) > 0).map(st => (
            <div key={st} className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0"
                style={{ background: STAGE_COLOR_HEX[st] ?? C.slate }} />
              <span className="text-slate-500">{st}</span>
              <span className="font-black text-slate-800">{stageCounts[st]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top owners */}
      {topOwners.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Owners</span>
          {topOwners.map((o, i) => (
            <span key={o.name}
              className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
              {i === 0 && <span className="text-amber-500">★</span>}
              <span className="text-slate-700 font-semibold">{o.name.split(" ")[0]}</span>
              <span className="font-black text-[#091a4f]">{o.count}</span>
            </span>
          ))}
        </div>
      )}
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

  const mouDone   = rows.filter(b => b.stage === "MOU Done").length;
  const mouSent   = rows.filter(b => b.stage === "MOU Sent").length;
  const mouPending = rows.filter(b => b.stage === "MOU Signing Pending").length;
  const totalAdm  = rows.reduce((s, b) => s + b.admissionsReferred, 0);
  const closedDropped = rows.filter(b => b.stage === "Not Interested / Dropped").length;
  const bpStageCounts: Record<string, number> = {};
  rows.forEach(b => { if (b.stage) bpStageCounts[b.stage] = (bpStageCounts[b.stage] ?? 0) + 1; });
  const bpOwnerCounts: Record<string, number> = {};
  rows.forEach(b => { if (b.owner) bpOwnerCounts[b.owner] = (bpOwnerCounts[b.owner] ?? 0) + 1; });
  const bpTopOwners = Object.entries(bpOwnerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-4">
      <TabSummary
        stats={[
          { label: "Brands Targeted", value: rows.length, color: C.navy },
          { label: "MOU Done ✓", value: mouDone, color: C.green },
          { label: "MOU Sent", value: mouSent, color: C.purple },
          { label: "MOU Pending", value: mouPending, color: C.orange },
          { label: "Closed / Dropped", value: closedDropped, color: C.red },
          { label: "Admissions", value: totalAdm, color: C.amber },
          { label: "Categories", value: cats.length, color: C.slate },
        ]}
        pipelineStages={data.pipelineStages}
        stageCounts={bpStageCounts}
        topOwners={bpTopOwners}
      />
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search brands…" />
        <Select value={filterCat} onChange={setFilterCat} options={cats} placeholder="All categories" />
        <Select value={filterStage} onChange={setFilterStage} options={data.pipelineStages} placeholder="All stages" />
        <Select value={filterOwner} onChange={setFilterOwner} options={owners} placeholder="All owners" />
        <div className="ml-auto flex gap-4 text-sm">
          <span className="text-slate-500">{rows.length} shown</span>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[62vh]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
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

  const corpMouDone = rows.filter(c => c.stage === "MOU Done").length;
  const corpMouSent = rows.filter(c => c.stage === "MOU Sent").length;
  const corpMouPending = rows.filter(c => c.stage === "MOU Signing Pending").length;
  const corpAdm = rows.reduce((s, c) => s + c.admissionsReferred, 0);
  const corpClosedDropped = rows.filter(c => c.stage === "Not Interested / Dropped").length;
  const corpStageCounts: Record<string, number> = {};
  rows.forEach(c => { if (c.stage) corpStageCounts[c.stage] = (corpStageCounts[c.stage] ?? 0) + 1; });
  const corpOwnerCounts: Record<string, number> = {};
  rows.forEach(c => { if (c.owner) corpOwnerCounts[c.owner] = (corpOwnerCounts[c.owner] ?? 0) + 1; });
  const corpTopOwners = Object.entries(corpOwnerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-4">
      <TabSummary
        stats={[
          { label: "Corporates Targeted", value: rows.length, color: C.navy },
          { label: "MOU Done ✓", value: corpMouDone, color: C.green },
          { label: "MOU Sent", value: corpMouSent, color: C.purple },
          { label: "MOU Pending", value: corpMouPending, color: C.orange },
          { label: "Closed / Dropped", value: corpClosedDropped, color: C.red },
          { label: "Admissions", value: corpAdm, color: C.amber },
        ]}
        pipelineStages={data.pipelineStages}
        stageCounts={corpStageCounts}
        topOwners={corpTopOwners}
      />
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search corporates…" />
        <Select value={filterStage} onChange={setFilterStage} options={data.pipelineStages} placeholder="All stages" />
        <Select value={filterOwner} onChange={setFilterOwner} options={owners} placeholder="All owners" />
        <div className="ml-auto text-sm text-slate-500">{rows.length} shown</div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[62vh]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
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
  const fsMouDone = rows.filter(s => s.stage === "MOU Done").length;
  const fsMouSent = rows.filter(s => s.stage === "MOU Sent").length;
  const fsMouPending = rows.filter(s => s.stage === "MOU Signing Pending").length;
  const fsClosedDropped = rows.filter(s => s.stage === "Not Interested / Dropped").length;
  const fsTotalAdm = rows.reduce((s, r) => s + r.totalAdm, 0);
  const fsStageCounts: Record<string, number> = {};
  rows.forEach(s => { if (s.stage) fsStageCounts[s.stage] = (fsStageCounts[s.stage] ?? 0) + 1; });
  const fsOwnerCounts: Record<string, number> = {};
  rows.forEach(s => { if (s.owner) fsOwnerCounts[s.owner] = (fsOwnerCounts[s.owner] ?? 0) + 1; });
  const fsTopOwners = Object.entries(fsOwnerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-4">
      <TabSummary
        stats={[
          { label: "Preschools Targeted", value: rows.length, color: C.navy },
          { label: "MOU Done ✓", value: fsMouDone, color: C.green },
          { label: "MOU Sent", value: fsMouSent, color: C.purple },
          { label: "MOU Pending", value: fsMouPending, color: C.orange },
          { label: "Closed / Dropped", value: fsClosedDropped, color: C.red },
          { label: "Total Adm", value: fsTotalAdm, color: C.amber },
        ]}
        pipelineStages={data.pipelineStages}
        stageCounts={fsStageCounts}
        topOwners={fsTopOwners}
      />
      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search schools…" />
        <Select value={filterStage} onChange={setFilterStage} options={data.pipelineStages} placeholder="All stages" />
        <div className="ml-auto flex gap-4 text-sm">
          <span className="text-slate-500">{rows.length} shown</span>
          {totalAdm > 0 && <span className="text-amber-600 font-semibold">{totalAdm} total admissions</span>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[62vh]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
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
  const [filterPartnerStatus, setFilterPartnerStatus] = useState("");
  const [filterPac, setFilterPac] = useState("");
  const [filterPacAttendance, setFilterPacAttendance] = useState("");

  // partnerStatus filter options (including a synthetic "Not yet reached" for blank rows)
  const PA_PARTNER_STATUS_OPTIONS = ["Accepted", "To be Decided", "Rejected", "Not yet reached"];

  const rows = data.parentAdvocacy.filter(p => matchesParentAdvocacyFilters(p, {
    partnerStatus: filterPartnerStatus,
    pacKey: filterPac,
    pacAttendance: filterPacAttendance as "Attended" | "Not attended" | "",
    search,
  }));

  // Ambassador acceptance rate: Accepted ÷ (Accepted + Rejected) — excludes still-pending
  const psc = data.partnerStatusCounts;
  const totalTargeted = psc.accepted + psc.pending + psc.rejected + psc.notReached;
  const acceptanceRate = totalTargeted > 0
    ? Math.round((psc.accepted / totalTargeted) * 100) : 0;

  // Referral pipeline funnel — driven purely by status col K (may all be zero currently)
  const PA_STATUSES = ["Enquired", "Campus Visit Scheduled", "Application Submitted", "Admission Confirmed", "Not Interested"];
  const PA_DISPLAY_LABEL: Record<string, string> = { "Enquired": "Referred" };
  const displayLabel = (st: string) => PA_DISPLAY_LABEL[st] ?? st;
  const PA_HEX: Record<string, string> = {
    "Enquired": C.blue,
    "Campus Visit Scheduled": C.indigo,
    "Application Submitted": C.amber,
    "Admission Confirmed": C.green,
    "Not Interested": C.red,
  };

  const paFunnel: Record<string, number> = {};
  for (const st of PA_STATUSES) paFunnel[st] = 0;
  for (const p of data.parentAdvocacy) {
    if (p.status && paFunnel[p.status] !== undefined) paFunnel[p.status]++;
  }
  const hasReferrals = Object.values(paFunnel).some(v => v > 0);

  // Branch-wise breakdown
  const branchMap: Record<string, { targeted: number; onBoard: number }> = {};
  for (const p of data.parentAdvocacy) {
    const br = p.branch?.trim() || "Unknown";
    if (!branchMap[br]) branchMap[br] = { targeted: 0, onBoard: 0 };
    branchMap[br].targeted++;
    if (p.partnerStatus?.toLowerCase().includes("accept")) branchMap[br].onBoard++;
  }
  const branches = Object.entries(branchMap).sort((a, b) => b[1].targeted - a[1].targeted);

  const total = data.parentAdvocacy.length || 1;

  return (
    <div className="space-y-4">
      {/* PA Summary */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-5">

        {/* ── Section 1: Ambassador Recruitment ── */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ambassador Recruitment</div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Total Targeted",    value: data.parentAdvocacy.length, color: C.navy  },
              { label: "Accepted",          value: psc.accepted,               color: C.green },
              { label: "Pending Decision",  value: psc.pending,                color: C.amber },
              { label: "Not Yet Reached",   value: psc.notReached,             color: C.slate },
              { label: "Rejected",          value: psc.rejected,               color: C.red   },
              { label: "Acceptance Rate",   value: `${acceptanceRate}%`,       color: C.amber },
              { label: "Admission Done",    value: data.kpi.paAdmissions,      color: C.teal  },
            ].map(s => (
              <div key={s.label}
                className="flex flex-col items-center bg-slate-50 rounded-xl px-5 py-3 min-w-[90px] border border-slate-100">
                <div className="text-2xl font-black leading-none" style={{ color: s.color }}>
                  {typeof s.value === "number" ? <AN value={s.value} /> : s.value}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment progress bar */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Recruitment Progress</div>
          <div className="flex h-3 rounded-full overflow-hidden gap-[1px]">
            {[
              { key: "accepted",   label: "Accepted",         count: psc.accepted,   color: C.green  },
              { key: "pending",    label: "Pending Decision",  count: psc.pending,    color: C.amber  },
              { key: "notReached", label: "Not Yet Reached",   count: psc.notReached, color: "#e2e8f0" },
              { key: "rejected",   label: "Rejected",          count: psc.rejected,   color: C.red    },
            ].filter(s => s.count > 0).map(s => (
              <div key={s.key} title={`${s.label}: ${s.count}`}
                style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
                className="transition-all duration-1000" />
            ))}
          </div>
          <div className="flex gap-4 mt-1.5 flex-wrap">
            {[
              { label: "Accepted",         color: C.green   },
              { label: "Pending",          color: C.amber   },
              { label: "Not yet reached",  color: "#e2e8f0" },
              { label: "Rejected",         color: C.red     },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1 text-[10px] text-slate-500">
                <div className="w-2.5 h-2.5 rounded-sm border border-slate-200" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: Referral Pipeline (conditional) ── */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Parent Ambassador Circle Meetings</div>
          {data.pacMeetings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {data.pacMeetings.map(meeting => {
                const eligible = data.parentAdvocacy.length;
                const rate = eligible > 0 ? Math.round((meeting.attendedCount / eligible) * 100) : 0;
                return (
                  <div key={meeting.key} className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-[#091a4f]">{meeting.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{meeting.date || "Meeting date not recorded"}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-black" style={{ color: C.amber }}><AN value={meeting.attendedCount} /></div>
                        <div className="text-[10px] text-slate-500">attended</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-white overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(rate, 100)}%` }} />
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">{rate}% of targeted parents</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-0.5">
              No PAC meetings have been recorded yet
            </p>
          )}
        </div>

        {/* ── Section 3: Referral Pipeline (conditional) ── */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Referral Pipeline</div>
          {hasReferrals ? (
            <div className="flex flex-wrap gap-3">
              {PA_STATUSES.map(st => (
                <div key={st}
                  className="flex flex-col items-center bg-slate-50 rounded-xl px-4 py-3 min-w-[88px] border border-slate-100">
                  <div className="text-2xl font-black leading-none" style={{ color: PA_HEX[st] ?? C.slate }}>
                    <AN value={paFunnel[st] ?? 0} />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{displayLabel(st)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-0.5">
              No referrals yet — will populate as ambassadors send leads
            </p>
          )}
        </div>

        {/* Branch-wise breakdown */}
        {branches.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">By Branch</div>
            <div className="flex flex-wrap gap-2">
              {branches.map(([br, { targeted, onBoard }]) => (
                <div key={br}
                  className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{br}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">{targeted} targeted</span>
                  <span className="text-slate-300">·</span>
                  <span className="font-semibold" style={{ color: C.blue }}>{onBoard} on board</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search families…" />
        <Select value={filterPartnerStatus} onChange={setFilterPartnerStatus}
          options={PA_PARTNER_STATUS_OPTIONS} placeholder="All ambassador statuses" />
        {data.pacMeetings.length > 0 && (
          <>
            <Select value={filterPac} onChange={v => {
              setFilterPac(v);
              if (!v) setFilterPacAttendance("");
            }} options={data.pacMeetings.map(meeting => meeting.key)} placeholder="All PAC meetings" />
            <Select value={filterPacAttendance} onChange={setFilterPacAttendance}
              options={["Attended", "Not attended"]} placeholder="Any attendance"
            />
          </>
        )}
        <div className="ml-auto text-sm text-slate-500">{rows.length} shown</div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[62vh]">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Student Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Ambassador Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 min-w-[180px]">PAC Attendance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Referred Family</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Grade Applying</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Referral Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Date Referred</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">Referral Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((p, i) => (
                <tr key={p.sno + i} className={`hover:bg-slate-50 transition ${p.status === "Admission Confirmed" ? "bg-green-50/40" : ""}`}>
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{p.sno}</td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800">{p.referringParent}</div>
                    <div className="text-xs text-slate-400">{[p.branch?.trim(), p.wardClass].filter(Boolean).join(" · ") || "—"}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    {p.partnerStatus ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.partnerStatus.toLowerCase().includes("accept") ? "bg-green-100 text-green-700" :
                        p.partnerStatus.toLowerCase().includes("reject") || p.partnerStatus.toLowerCase().includes("declin") ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{p.partnerStatus}</span>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    {data.pacMeetings.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {data.pacMeetings.map(meeting => {
                          const attendedDate = p.pacAttendance?.[meeting.key];
                          return (
                            <span
                              key={meeting.key}
                              title={attendedDate ? `${meeting.label}: attended ${attendedDate}` : `${meeting.label}: not attended`}
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                attendedDate ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {meeting.label}{attendedDate ? ` · ${attendedDate}` : " · —"}
                            </span>
                          );
                        })}
                      </div>
                    ) : <span className="text-slate-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{p.referredFamily || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{p.contactNumber || "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{p.gradeApplying || "—"}</td>
                  <td className="px-4 py-2.5">
                    <StageBadge stage={p.status} palette={PA_COLOR} label={displayLabel(p.status)} />
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{p.dateReferred || "—"}</td>
                  <td className="px-4 py-2.5">
                    {p.incentiveGiven === "Paid"
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Paid</span>
                      : p.incentiveGiven === "Pending"
                      ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Pending</span>
                      : <span className="text-slate-400 text-xs">—</span>}
                  </td>
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

// ── Main Dashboard ─────────────────────────────────────────────
type TabKey = "overview" | "brandPartners" | "corporates" | "friendshipSchools" | "parentAdvocacy" | "fsLeads";
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "brandPartners", label: "Brand Partners" },
  { key: "corporates", label: "Corporates" },
  { key: "friendshipSchools", label: "Friendship Schools" },
  { key: "parentAdvocacy", label: "Parent Advocacy" },
  { key: "fsLeads", label: "FS Leads" },
];

function AlliancesDashboard() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [fetchKey, setFetchKey] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data, isLoading, isError, dataUpdatedAt } = useQuery<AlliancesData>({
    queryKey: ["alliances-live", fetchKey],
    queryFn: () => fetch("/api/alliances/live").then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const syncTime = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : null;

  const tabCount = (key: TabKey) => {
    if (!data) return null;
    if (key === "brandPartners") return data.brandPartners.length;
    if (key === "corporates") return data.corporates.length;
    if (key === "friendshipSchools") return data.friendshipSchools.length;
    if (key === "parentAdvocacy") return data.parentAdvocacy.length;
    return null;
  };
  const activeLabel = TABS.find(t => t.key === tab)?.label ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-30 shadow-sm border-b border-slate-200/80"
        style={{ background: "linear-gradient(135deg, #ffffff 0%, #f4f7fb 55%, #e8eef8 100%)" }}>
        {/* Top bar */}
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src="/images/rainbow-group-logo.png"
              alt="Rainbow Group of Companies"
              className="h-8 sm:h-9 w-auto shrink-0 object-contain"
            />
            <div className="hidden sm:block w-px h-7 bg-slate-300/70 shrink-0" />
            <div className="min-w-0 hidden sm:block">
              <div className="text-[#091a4f] font-black text-sm leading-tight truncate">Strategic Alliances Dashboard</div>
              <div className="text-slate-500 text-xs truncate">
                {syncTime ? <>Live · synced {syncTime}</> : "Loading…"}
              </div>
            </div>
          </div>
          {/* Refresh */}
          <button
            onClick={() => setFetchKey(k => k + 1)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#091a4f] text-white text-xs sm:text-sm font-bold hover:bg-[#0b2168] transition disabled:opacity-60 shrink-0"
            data-testid="button-refresh"
          >
            <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">REFRESH</span>
          </button>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="md:hidden flex flex-col items-center justify-center gap-1 w-8 h-8 rounded-lg hover:bg-slate-100 transition shrink-0"
            aria-label="Open menu"
            data-testid="button-hamburger"
          >
            {menuOpen ? (
              <svg className="w-5 h-5 text-[#091a4f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <>
                <span className="block w-5 h-0.5 bg-[#091a4f] rounded" />
                <span className="block w-5 h-0.5 bg-[#091a4f] rounded" />
                <span className="block w-5 h-0.5 bg-[#091a4f] rounded" />
              </>
            )}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 pb-3">
            {TABS.map(t => {
              const cnt = tabCount(t.key);
              return (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg my-0.5 text-sm font-semibold transition ${tab === t.key ? "bg-[#091a4f]/10 text-[#091a4f]" : "text-slate-600 hover:bg-slate-50 hover:text-[#091a4f]"}`}
                  data-testid={`tab-mobile-${t.key}`}
                >
                  <span>{t.label}</span>
                  {cnt !== null && <span className="text-xs opacity-60 bg-slate-100 px-2 py-0.5 rounded-full">{cnt}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Desktop tab bar — hidden on mobile */}
        <div className="hidden md:block max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            {TABS.map(t => {
              const cnt = tabCount(t.key);
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${tab === t.key ? "text-[#091a4f] border-[#091a4f]" : "text-slate-500 border-transparent hover:text-[#091a4f]"}`}
                  data-testid={`tab-${t.key}`}>
                  {t.label}
                  {cnt !== null && <span className="ml-1.5 text-xs opacity-60">{cnt}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile active tab indicator */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-200">
          <span className="text-[#091a4f] text-sm font-semibold">{activeLabel}</span>
          <span className="text-slate-500 text-xs">tap ☰ to switch</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        {tab === "fsLeads" ? (
          <FriendshipQRTab refreshKey={fetchKey} />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

// ── Page entry point ───────────────────────────────────────────
export default function Alliances() {
  // Prevent search engines from indexing this internal tool
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

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
