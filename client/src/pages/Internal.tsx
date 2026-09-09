import { useState, useEffect, useRef } from "react";

/* ── Constants ───────────────────────────────────────────────────────────────── */
const PASSCODE = "MAIN";
const AUTH_KEY = "ris_internal_auth";
const NAVY     = "#091a4f";

function isAuthed(): boolean {
  try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
}

/* ── Types ───────────────────────────────────────────────────────────────────── */
type Dashboard = {
  name: string;
  url: string;
  passcode: string;
  who: string;
  description: string;
  accent: string;
  open?: boolean;
  envVar?: boolean;
  adminToken?: boolean;
};

type FlowStep = {
  step: number;
  label: string;
  sub: string;
  items?: { label: string; url?: string }[];
  url?: string;
  terminal?: boolean;
};

/* ── AY 26-27 data ───────────────────────────────────────────────────────────── */
const FLOW_2627: FlowStep[] = [
  {
    step: 1,
    label: "Lead Sources",
    sub: "Campaigns & partnerships generate enquiries",
    items: [
      { label: "Marketing Ads", url: "/marketing" },
      { label: "Alliances Referrals", url: "/alliances" },
    ],
  },
  {
    step: 2,
    label: "Enquiry Pool",
    sub: "Inbound leads captured via website, walk-in, or referral",
  },
  {
    step: 3,
    label: "Sales Counselling",
    sub: "Counselors manage the lead, book walk-ins, and track status",
    items: [
      { label: "RIS Sales", url: "/sales" },
      { label: "RPS Sales", url: "/rps-sales" },
    ],
  },
  {
    step: 4,
    label: "Walk-in → Admission",
    sub: "Walk-in confirmed, admission secured",
    terminal: true,
  },
];

const DASHBOARDS_2627: Dashboard[] = [
  {
    name: "Marketing Dashboard",
    url: "/marketing",
    passcode: "8888",
    who: "Marketing Team",
    description:
      "Combined RIS + RPS ad spend (Meta + Google), CPL, CPB, true CPA, month-over-month and year-over-year comparisons, weekly breakdown, and projected month-end forecasts.",
    accent: "#2563eb",
  },
  {
    name: "RIS Sales Dashboard",
    url: "/sales",
    passcode: "RIS8",
    who: "RIS Counselors",
    description:
      "RIS walk-in enquiries with counselor leaderboard, lead → booking → walk-in → admission funnel, monthly targets, and what-if calculator.",
    accent: "#059669",
  },
  {
    name: "RPS Sales Dashboard",
    url: "/rps-sales",
    passcode: "RPS8",
    who: "RPS Counselors",
    description:
      "RPS branch-wise CRM pipeline, lead status breakdown, monthly performance vs targets, and closed-reason analysis across all centres.",
    accent: "#7c3aed",
  },
];

/* ── AY 27-28 data ───────────────────────────────────────────────────────────── */
const FLOW_2728: FlowStep[] = [
  {
    step: 1,
    label: "Infrastructure Setup",
    sub: "Admin configures kiosks and deploys QR codes to branches",
    items: [{ label: "Admin Panel", url: "/admin/walkin-2728" }],
  },
  {
    step: 2,
    label: "Walk-in Capture",
    sub: "Visitors scan branch QR code and fill kiosk form on-site",
  },
  {
    step: 3,
    label: "Leads CRM",
    sub: "All captured leads in one filterable, editable list",
    items: [{ label: "Leads CRM", url: "/leads" }],
  },
  {
    step: 4,
    label: "Sales Counselling",
    sub: "Counselors follow up, schedule walk-ins, and update conversion status",
    items: [
      { label: "RIS Sales 27-28", url: "/sales-27-28" },
      { label: "RPS Sales 27-28", url: "/rps-sales-27-28" },
    ],
  },
  {
    step: 5,
    label: "Reporting & Oversight",
    sub: "Leadership reviews pipeline health and marketing efficiency",
    items: [
      { label: "Group Overview", url: "/overview-27-28" },
      { label: "Marketing 27-28", url: "/marketing-27-28" },
    ],
    terminal: true,
  },
];

const DASHBOARDS_2728: Dashboard[] = [
  {
    name: "Group Overview",
    url: "/overview-27-28",
    passcode: "Staff passcode",
    who: "All Stakeholders",
    description:
      "High-level walk-in pipeline across all RIS and RPS branches — total leads, walk-ins, and admissions for AY 27-28.",
    accent: "#475569",
  },
  {
    name: "Marketing Dashboard",
    url: "/marketing-27-28",
    passcode: "Staff passcode",
    who: "Marketing Team",
    description:
      "AY 27-28 marketing performance — campaign spend (Meta + Google), CPL, CPB, combined RIS + RPS brand view, and weekly trends.",
    accent: "#2563eb",
  },
  {
    name: "RIS Sales Dashboard",
    url: "/sales-27-28",
    passcode: "Staff passcode",
    who: "RIS Counselors",
    description:
      "AY 27-28 RIS live lead funnel — walk-in captures from kiosk, counselor assignments, booking and admission tracking.",
    accent: "#059669",
  },
  {
    name: "RPS Sales Dashboard",
    url: "/rps-sales-27-28",
    passcode: "Staff passcode",
    who: "RPS Counselors",
    description:
      "AY 27-28 RPS live lead funnel by branch — CRM status, pipeline health, conversion metrics, and branch-wise breakdown.",
    accent: "#7c3aed",
  },
  {
    name: "Alliances Dashboard",
    url: "/alliances",
    passcode: "ALLIANCES_PASSCODE",
    envVar: true,
    who: "Alliances Team",
    description:
      "Brand Partners, Corporate tie-ups, Friendship Schools, and Parent Advocacy — referral lead pipeline, MOU status, monthly targets, and CRM sync.",
    accent: "#d97706",
  },
  {
    name: "Leads CRM",
    url: "/leads",
    passcode: "Admin token",
    adminToken: true,
    who: "Admin / Staff",
    description:
      "Full AY 27-28 walk-in lead list — filter by brand, branch, and status; edit entries; track counselling progress; and export data.",
    accent: "#dc2626",
  },
  {
    name: "Admin Panel",
    url: "/admin/walkin-2728",
    passcode: "Admin token",
    adminToken: true,
    who: "Admin",
    description:
      "Branch kiosk setup, QR code generation for branch-specific URLs, Google Sheets sync management, and walk-in infrastructure control.",
    accent: "#ea580c",
  },
];

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function PasscodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode]   = useState("");
  const [error, setError] = useState(false);
  const inputRef          = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (code.trim() === PASSCODE) {
      try { sessionStorage.setItem(AUTH_KEY, "1"); } catch {}
      onSuccess();
    } else {
      setError(true);
      setCode("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", background: NAVY }}
      className="flex items-center justify-center px-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: NAVY }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">Internal Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Rainbow International School · Staff only</p>
        </div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Access passcode</label>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          value={code}
          onChange={e => { setCode(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && submit()}
          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter passcode"
          autoFocus
        />
        {error && (
          <p className="text-red-500 text-xs mt-1.5 text-center">Incorrect passcode</p>
        )}
        <button
          onClick={submit}
          style={{ background: NAVY }}
          className="mt-4 w-full text-white text-sm font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Access Dashboard Directory
        </button>
      </div>
    </div>
  );
}

function FlowDiagram({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">
        Dashboard Journey &amp; Flow
      </p>
      <div className="flex items-stretch gap-0 min-w-max">
        {steps.map((step, i) => (
          <div key={i} className="flex items-stretch">
            {/* Step card */}
            <div className="flex flex-col items-center w-40">
              {/* Step number */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold mb-2 flex-shrink-0"
                style={{ background: step.terminal ? "#059669" : NAVY }}
              >
                {step.step}
              </div>
              {/* Box */}
              <div
                className="w-full flex-1 rounded-lg px-3 py-2.5 text-center"
                style={{
                  background: step.terminal ? "#f0fdf4" : "#f8fafc",
                  border: `1px solid ${step.terminal ? "#bbf7d0" : "#e2e8f0"}`,
                }}
              >
                <div className="text-slate-800 text-xs font-bold leading-tight">{step.label}</div>
                <div className="text-slate-500 text-[10px] mt-1 leading-snug">{step.sub}</div>
                {step.items && (
                  <div className="mt-2 flex flex-col gap-1">
                    {step.items.map((item, j) => (
                      <a
                        key={j}
                        href={item.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                        onClick={e => !item.url && e.preventDefault()}
                      >
                        {item.label} ↗
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            {i < steps.length - 1 && (
              <div className="flex items-center px-2 flex-shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-0.5 bg-slate-300" />
                  <svg className="w-3 h-3 text-slate-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PasscodeBadge({ d }: { d: Dashboard }) {
  if (d.open) return (
    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-50 border border-green-200 text-green-700">
      🔓 No passcode
    </span>
  );
  if (d.adminToken) return (
    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-orange-50 border border-orange-200 text-orange-700">
      🔑 Admin token (env)
    </span>
  );
  if (d.envVar) return (
    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-700">
      🔐 {d.passcode} (env secret)
    </span>
  );
  return (
    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-white tracking-widest font-mono">
      {d.passcode}
    </span>
  );
}

function DashCard({ d }: { d: Dashboard }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1" style={{ background: d.accent }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <h3 className="text-slate-800 font-bold text-base leading-tight">{d.name}</h3>
            <p className="text-slate-400 text-xs mt-0.5">{d.who}</p>
          </div>
          <a
            href={d.url}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80 whitespace-nowrap"
            style={{ background: d.accent }}
          >
            Open ↗
          </a>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mt-3 mb-4">{d.description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="text-[11px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-500 font-mono">
            {d.url}
          </code>
          <PasscodeBadge d={d} />
        </div>
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────────── */
export default function Internal() {
  const [authed, setAuthed] = useState(isAuthed);

  // Inject noindex so search engines never index this page
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name    = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    // Also set page title
    const prev = document.title;
    document.title = "Internal Directory · RIS";
    return () => {
      try { document.head.removeChild(meta); } catch {}
      document.title = prev;
    };
  }, []);

  if (!authed) {
    return <PasscodeGate onSuccess={() => setAuthed(true)} />;
  }

  const lock = () => {
    try { sessionStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9" }}>

      {/* ── Header ── */}
      <div style={{ background: NAVY }} className="px-6 py-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                Internal · Not indexed
              </span>
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              Dashboard Directory
            </h1>
            <p className="text-white/50 text-sm mt-0.5">
              Rainbow International School · Passcode-protected · Staff use only
            </p>
          </div>
          <button
            onClick={lock}
            className="text-white/70 hover:text-white text-sm border border-white/20 rounded-lg px-4 py-2 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Lock
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-14">

        {/* ════ AY 2026-27 ════ */}
        <section>
          <div className="flex items-center gap-3 mb-7">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: "#2563eb" }}>
              AY 2026–27
            </span>
            <h2 className="text-slate-800 text-xl font-bold">Academic Year 2026–27</h2>
            <span className="text-slate-400 text-sm">(current running year)</span>
          </div>

          <FlowDiagram steps={FLOW_2627} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {DASHBOARDS_2627.map(d => <DashCard key={d.url} d={d} />)}
          </div>
        </section>

        <div className="border-t-2 border-dashed border-slate-300" />

        {/* ════ AY 2027-28 ════ */}
        <section>
          <div className="flex items-center gap-3 mb-7">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-emerald-600">
              AY 2027–28
            </span>
            <h2 className="text-slate-800 text-xl font-bold">Academic Year 2027–28</h2>
            <span className="text-slate-400 text-sm">(next year · kiosk-based capture)</span>
          </div>

          <FlowDiagram steps={FLOW_2728} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {DASHBOARDS_2728.map(d => <DashCard key={d.url} d={d} />)}
          </div>
        </section>

        {/* ── Passcodes ── */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Dashboard Passcodes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {[
              ["Internal Directory", "/internal", PASSCODE],
              ["Marketing 2026–27", "/marketing", "8888"],
              ["RIS Sales 2026–27", "/sales", "RIS8"],
              ["RPS Sales 2026–27", "/rps-sales", "RPS8"],
              ["Marketing 2027–28", "/marketing-27-28", "Staff passcode"],
              ["RIS Sales 2027–28", "/sales-27-28", "Staff passcode"],
              ["RPS Sales 2027–28", "/rps-sales-27-28", "Staff passcode"],
              ["Group Overview", "/overview-27-28", "Staff passcode"],
            ].map(([label, slug, code]) => (
              <div key={label} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <span>
                  <span className="block text-slate-600">{label}</span>
                  <code className="block text-[10px] text-slate-400 mt-0.5">{slug}</code>
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-white font-mono font-bold tracking-wider">{code}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <span>
                <span className="block text-amber-800">Alliances</span>
                <code className="block text-[10px] text-amber-600 mt-0.5">/alliances</code>
              </span>
              <span className="font-semibold text-amber-700">🔐 Ask admin</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
              <span>
                <span className="block text-orange-800">Leads CRM &amp; Admin Panel</span>
                <code className="block text-[10px] text-orange-600 mt-0.5">/leads · /admin/walkin-2728</code>
              </span>
              <span className="font-semibold text-orange-700">🔑 Admin token</span>
            </div>
          </div>
        </div>

        <footer className="text-center text-slate-400 text-xs pb-4">
          Internal use only · Do not share this URL externally ·{" "}
          {new Date().getFullYear()} Rainbow International School, Thane
        </footer>
      </div>
    </div>
  );
}
