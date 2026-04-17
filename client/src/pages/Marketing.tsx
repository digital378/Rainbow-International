import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, FunnelChart, Funnel,
  LabelList, Cell, PieChart, Pie
} from "recharts";

const LAST_UPDATED = "April 16, 2026";

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;

const pct = (n: number) => `${n}%`;
const num = (n: number) => n.toLocaleString("en-IN");

/* ─────────── DATA ─────────── */

const MONTHLY_COMBINED = [
  { month: "Dec", leads: 455, admissions: 23, spend: 178604, meta: 100231, google: 78373, cpl: 393, cpa: 7765, roi: 1059, walkins: 71, bookings: 93 },
  { month: "Jan", leads: 895, admissions: 27, spend: 459906, meta: 248585, google: 211321, cpl: 514, cpa: 17034, roi: 428, walkins: 125, bookings: 171 },
  { month: "Feb", leads: 418, admissions: 24, spend: 179377, meta: 58885, google: 120492, cpl: 429, cpa: 7474, roi: 1104, walkins: 94, bookings: 115 },
  { month: "Mar", leads: 498, admissions: 47, spend: 194500, meta: 61121, google: 133379, cpl: 391, cpa: 4138, roi: 2075, walkins: 121, bookings: 196 },
  { month: "Apr*", leads: 213, admissions: 18, spend: 101168, meta: 30624, google: 70544, cpl: 475, cpa: 5620, roi: 1501, walkins: 58, bookings: 85 },
];

const TOTAL = {
  leads: 2451, admissions: 160, spend: 1113555, meta: 630269, google: 886599,
  cpl: 454, cpa: 6960, roi: 1193, walkins: 550, bookings: 658,
};

const APRIL_WEEKLY = [
  { week: "01–04 Apr", risLeads: 18, risAdm: 3, risWalk: 6, rpsLeads: 36, rpsAdm: 3, rpsWalk: 12 },
  { week: "05–11 Apr", risLeads: 37, risAdm: 3, risWalk: 11, rpsLeads: 60, rpsAdm: 4, rpsWalk: 15 },
  { week: "12–18 Apr", risLeads: 35, risAdm: 2, risWalk: 8, rpsLeads: 27, rpsAdm: 3, rpsWalk: 6 },
];

const APRIL_RIS = { leads: 90, closed: 32, bookings: 32, walkins: 25, admissions: 8, meta: 10733 + 12042 + 7849, google: 28112 + 28112 + 14320 };
const APRIL_RPS = { leads: 123, closed: 35, bookings: 53, walkins: 33, admissions: 10, meta: 308064 - 173236 - 10733 - 12042 - 7849, google: 320635 - 244486 - 28112 - 28112 - 14320 };

const SOCIAL_RIS = { instaFollowers: 9842, fbFollowers: 9862, ytViews: 145009, ytClicks: 3780, impressions: 481881, websiteClicks: 454 };
const SOCIAL_RPS = { instaFollowers: 12947, fbFollowers: 12964, ytViews: 138364, ytClicks: 1066, impressions: 307620, websiteClicks: 159 };

const FUNNEL_DATA = [
  { name: "Total Leads", ris: 90, rps: 123 },
  { name: "Closed Leads", ris: 32, rps: 35 },
  { name: "Walk-ins", ris: 25, rps: 33 },
  { name: "Admissions", ris: 8, rps: 10 },
];

const ROI_DATA = [
  { month: "Dec", roi: 1059, income: 2070000, spend: 178604 },
  { month: "Jan", roi: 428, income: 2430000, spend: 459906 },
  { month: "Feb", roi: 1104, income: 2160000, spend: 179377 },
  { month: "Mar", roi: 2075, income: 4230000, spend: 194500 },
  { month: "Apr*", roi: 1501, income: 1620000, spend: 101168 },
];

const PLATFORM_DATA = [
  { month: "Dec", metaLeads: 201, googleLeads: 60, metaSpend: 100231, googleSpend: 78373 },
  { month: "Jan", metaLeads: 340, googleLeads: 159, metaSpend: 248585, googleSpend: 211321 },
  { month: "Feb", metaLeads: 285, googleLeads: 133, metaSpend: 58885, googleSpend: 120492 },
  { month: "Mar", metaLeads: 327, googleLeads: 171, metaSpend: 61121, googleSpend: 133379 },
  { month: "Apr*", metaLeads: 145, googleLeads: 68, metaSpend: 30624, googleSpend: 70544 },
];

const NAVY = "#091a4f";
const AMBER = "#f59e0b";
const GREEN = "#10b981";
const RED = "#ef4444";
const BLUE = "#3b82f6";
const PURPLE = "#8b5cf6";
const CYAN = "#06b6d4";

/* ─────────── COMPONENTS ─────────── */

function KpiCard({ label, value, sub, color = NAVY, icon }: { label: string; value: string; sub?: string; color?: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-black mt-1" style={{ color }}>{value}</div>
      {sub && <div className="text-xs text-gray-500">{sub}</div>}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-black text-[#091a4f]">{title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function BranchBadge({ branch }: { branch: "RIS" | "RPS" | "Combined" }) {
  const colors: Record<string, string> = { RIS: "#091a4f", RPS: "#0d3b86", Combined: "#6b7280" };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ background: colors[branch] }}>
      {branch}
    </span>
  );
}

const TICK = { fontSize: 11, fill: "#6b7280" };
const CURRENCY_TOOLTIP = (v: number) => fmt(v);

export default function Marketing() {
  const [activeTab, setActiveTab] = useState<"combined" | "ris" | "rps">("combined");
  const [chartTab, setChartTab] = useState<"leads" | "spend" | "roi">("leads");

  useEffect(() => {
    document.title = "Marketing Dashboard | Rainbow International School";
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) meta.setAttribute("content", "noindex, nofollow");
    else {
      const m = document.createElement("meta");
      m.name = "robots"; m.content = "noindex, nofollow";
      document.head.appendChild(m);
    }
  }, []);

  const aprilRIS = APRIL_RIS;
  const aprilRPS = APRIL_RPS;

  return (
    <div className="min-h-screen" style={{ background: "#f1f5f9" }}>
      {/* ── Top Bar ── */}
      <div className="text-white py-4 px-6 flex flex-wrap items-center justify-between gap-3" style={{ background: NAVY }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-[#091a4f] font-black text-sm">RIS</div>
          <div>
            <div className="font-black text-lg leading-tight">Marketing Performance Dashboard</div>
            <div className="text-xs text-blue-200">Rainbow International School — Internal Use Only</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-blue-200">Academic Year</div>
            <div className="font-bold text-sm">2026 – 27</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200">Last Updated</div>
            <div className="font-bold text-sm">{LAST_UPDATED}</div>
          </div>
          <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">🔒 CONFIDENTIAL</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ── YTD KPIs ── */}
        <div>
          <SectionTitle title="Year-to-Date Overview (Dec 2025 – Apr 2026)" sub="Combined RIS + RPS | All channels" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Total Leads" value={num(TOTAL.leads)} sub="Across all months" icon="📋" />
            <KpiCard label="Total Admissions" value={num(TOTAL.admissions)} sub={`CPA: ₹${TOTAL.cpa.toLocaleString("en-IN")}`} icon="🎓" color={GREEN} />
            <KpiCard label="Total Spend" value={fmt(TOTAL.spend)} sub={`Meta + Google`} icon="💰" color={RED} />
            <KpiCard label="Overall ROI" value={pct(TOTAL.roi)} sub="Min. revenue basis" icon="📈" color={GREEN} />
            <KpiCard label="Total Walk-ins" value={num(TOTAL.walkins)} sub={`CPW: ₹${TOTAL.cpl.toLocaleString("en-IN")}`} icon="🚶" color={BLUE} />
            <KpiCard label="Avg. CPL" value={`₹${TOTAL.cpl}`} sub="Cost per lead" icon="🎯" color={PURPLE} />
          </div>
        </div>

        {/* ── April 2026 Focus ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* April KPIs */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle title="April 2026 — Current Month" sub="Up to April 16" />
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">In Progress</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Total Leads", value: num(MONTHLY_COMBINED[4].leads), icon: "📋" },
                { label: "Admissions", value: num(MONTHLY_COMBINED[4].admissions), icon: "🎓" },
                { label: "Walk-ins", value: num(MONTHLY_COMBINED[4].walkins), icon: "🚶" },
                { label: "Total Spend", value: fmt(MONTHLY_COMBINED[4].spend), icon: "💰" },
                { label: "CPL", value: `₹${MONTHLY_COMBINED[4].cpl}`, icon: "🎯" },
                { label: "ROI %", value: pct(MONTHLY_COMBINED[4].roi), icon: "📈" },
              ].map(k => (
                <div key={k.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="text-xl">{k.icon}</span>
                  <div>
                    <div className="text-xs text-gray-400 font-medium">{k.label}</div>
                    <div className="text-base font-black text-[#091a4f]">{k.value}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Platform split */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 text-white" style={{ background: "#1877f2" }}>
                <div className="text-xs font-semibold opacity-80 mb-1">META Spend</div>
                <div className="text-xl font-black">{fmt(MONTHLY_COMBINED[4].meta)}</div>
                <div className="text-xs opacity-70 mt-0.5">{num(PLATFORM_DATA[4].metaLeads)} leads</div>
              </div>
              <div className="rounded-xl p-3 text-white" style={{ background: "#4285f4" }}>
                <div className="text-xs font-semibold opacity-80 mb-1">GOOGLE Spend</div>
                <div className="text-xl font-black">{fmt(MONTHLY_COMBINED[4].google)}</div>
                <div className="text-xs opacity-70 mt-0.5">{num(PLATFORM_DATA[4].googleLeads)} leads</div>
              </div>
            </div>
          </div>

          {/* Branch comparison April */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle title="April 2026 — Branch Comparison" sub="RIS vs RPS performance" />
            <div className="space-y-3">
              {[
                { label: "Total Leads", ris: aprilRIS.leads, rps: aprilRPS.leads, max: 130 },
                { label: "Closed Leads", ris: aprilRIS.closed, rps: aprilRPS.closed, max: 70 },
                { label: "Walk-ins", ris: aprilRIS.walkins, rps: aprilRPS.walkins, max: 50 },
                { label: "Admissions", ris: aprilRIS.admissions, rps: aprilRPS.admissions, max: 15 },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{row.label}</span>
                    <span className="flex gap-4">
                      <span className="font-bold" style={{ color: NAVY }}>RIS: {row.ris}</span>
                      <span className="font-bold" style={{ color: "#0d3b86" }}>RPS: {row.rps}</span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-5">
                    <div className="rounded-l-full" style={{ width: `${(row.ris / row.max) * 48}%`, background: NAVY, minWidth: 2 }} />
                    <div className="rounded-r-full" style={{ width: `${(row.rps / row.max) * 48}%`, background: CYAN, minWidth: 2 }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Conversion Rates */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl bg-[#091a4f]/5 p-3 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">RIS Conv. Rate</div>
                <div className="text-2xl font-black" style={{ color: NAVY }}>
                  {((aprilRIS.admissions / aprilRIS.leads) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">{aprilRIS.admissions} adm / {aprilRIS.leads} leads</div>
              </div>
              <div className="rounded-xl bg-cyan-50 p-3 text-center">
                <div className="text-xs text-gray-500 font-medium mb-1">RPS Conv. Rate</div>
                <div className="text-2xl font-black" style={{ color: CYAN }}>
                  {((aprilRPS.admissions / aprilRPS.leads) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">{aprilRPS.admissions} adm / {aprilRPS.leads} leads</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Monthly Trend Charts ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <SectionTitle title="Monthly Trend Analysis" />
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
              {(["leads", "spend", "roi"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setChartTab(t)}
                  className={`px-4 py-2 font-semibold capitalize ${chartTab === t ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={chartTab === t ? { background: NAVY } : {}}
                >{t === "roi" ? "ROI %" : t === "spend" ? "Ad Spend" : "Leads & Admissions"}</button>
              ))}
            </div>
          </div>

          {chartTab === "leads" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_COMBINED} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis tick={TICK} />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Total Leads" fill={NAVY} radius={[4, 4, 0, 0]} />
                <Bar dataKey="walkins" name="Walk-ins" fill={CYAN} radius={[4, 4, 0, 0]} />
                <Bar dataKey="admissions" name="Admissions" fill={GREEN} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartTab === "spend" && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_COMBINED} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis tick={TICK} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={CURRENCY_TOOLTIP} />
                <Legend />
                <Bar dataKey="meta" name="Meta Spend" fill="#1877f2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="google" name="Google Spend" fill="#4285f4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {chartTab === "roi" && (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ROI_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis yAxisId="left" tick={TICK} tickFormatter={(v) => `${v}%`} />
                <YAxis yAxisId="right" orientation="right" tick={TICK} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="roi" name="ROI %" stroke={GREEN} strokeWidth={3} dot={{ r: 5, fill: GREEN }} />
                <Line yAxisId="right" type="monotone" dataKey="income" name="Revenue (₹)" stroke={AMBER} strokeWidth={2} dot={{ r: 4, fill: AMBER }} />
                <Line yAxisId="right" type="monotone" dataKey="spend" name="Ad Spend (₹)" stroke={RED} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: RED }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── April Weekly Breakdown ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <SectionTitle title="April 2026 — Weekly Breakdown" sub="RIS vs RPS week-by-week" />
            <div className="flex rounded-xl overflow-hidden border border-gray-200 text-sm">
              {(["combined", "ris", "rps"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 font-bold uppercase ${activeTab === t ? "text-white" : "text-gray-500 hover:bg-gray-50"}`}
                  style={activeTab === t ? { background: t === "rps" ? CYAN : NAVY } : {}}
                >{t}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-semibold">Week</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Leads</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Walk-ins</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Admissions</th>
                  <th className="text-center py-2 px-3 text-gray-500 font-semibold">Conv. %</th>
                </tr>
              </thead>
              <tbody>
                {APRIL_WEEKLY.map((w, i) => {
                  const leads = activeTab === "ris" ? w.risLeads : activeTab === "rps" ? w.rpsLeads : w.risLeads + w.rpsLeads;
                  const walk = activeTab === "ris" ? w.risWalk : activeTab === "rps" ? w.rpsWalk : w.risWalk + w.rpsWalk;
                  const adm = activeTab === "ris" ? w.risAdm : activeTab === "rps" ? w.rpsAdm : w.risAdm + w.rpsAdm;
                  const conv = leads > 0 ? ((adm / leads) * 100).toFixed(1) : "—";
                  return (
                    <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                      <td className="py-3 px-3 font-semibold text-gray-700">{w.week}</td>
                      <td className="py-3 px-3 text-center font-bold" style={{ color: NAVY }}>{leads}</td>
                      <td className="py-3 px-3 text-center font-bold text-cyan-600">{walk}</td>
                      <td className="py-3 px-3 text-center font-bold text-green-600">{adm}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${parseFloat(conv) > 5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {conv}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* Totals row */}
                <tr className="font-black border-t-2 border-gray-200" style={{ background: `${NAVY}08` }}>
                  <td className="py-3 px-3">April Total</td>
                  <td className="py-3 px-3 text-center" style={{ color: NAVY }}>
                    {activeTab === "ris" ? aprilRIS.leads : activeTab === "rps" ? aprilRPS.leads : aprilRIS.leads + aprilRPS.leads}
                  </td>
                  <td className="py-3 px-3 text-center text-cyan-600">
                    {activeTab === "ris" ? aprilRIS.walkins : activeTab === "rps" ? aprilRPS.walkins : aprilRIS.walkins + aprilRPS.walkins}
                  </td>
                  <td className="py-3 px-3 text-center text-green-600">
                    {activeTab === "ris" ? aprilRIS.admissions : activeTab === "rps" ? aprilRPS.admissions : aprilRIS.admissions + aprilRPS.admissions}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {(() => {
                        const l = activeTab === "ris" ? aprilRIS.leads : activeTab === "rps" ? aprilRPS.leads : aprilRIS.leads + aprilRPS.leads;
                        const a = activeTab === "ris" ? aprilRIS.admissions : activeTab === "rps" ? aprilRPS.admissions : aprilRIS.admissions + aprilRPS.admissions;
                        return `${((a / l) * 100).toFixed(1)}%`;
                      })()}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Lead Funnel + Platform ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Funnel chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle title="April 2026 — Lead Funnel" sub="RIS vs RPS conversion journey" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={FUNNEL_DATA} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={TICK} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#374151" }} width={90} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ris" name="RIS" fill={NAVY} radius={[0, 4, 4, 0]} />
                <Bar dataKey="rps" name="RPS" fill={CYAN} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform performance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <SectionTitle title="Platform Performance — Leads" sub="Meta vs Google monthly" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PLATFORM_DATA} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={TICK} />
                <YAxis tick={TICK} />
                <Tooltip />
                <Legend />
                <Bar dataKey="metaLeads" name="Meta Leads" fill="#1877f2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="googleLeads" name="Google Leads" fill="#ea4335" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Social Media ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Social Media Performance" sub="As of April 2026 — RIS vs RPS" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { platform: "Instagram", icon: "📸", risVal: num(SOCIAL_RIS.instaFollowers), rpsVal: num(SOCIAL_RPS.instaFollowers), label: "Followers", color: "#e1306c" },
              { platform: "Facebook", icon: "👥", risVal: num(SOCIAL_RIS.fbFollowers), rpsVal: num(SOCIAL_RPS.fbFollowers), label: "Followers", color: "#1877f2" },
              { platform: "YouTube", icon: "▶️", risVal: num(SOCIAL_RIS.ytViews), rpsVal: num(SOCIAL_RPS.ytViews), label: "Total Views", color: "#ff0000" },
              { platform: "Website", icon: "🌐", risVal: num(SOCIAL_RIS.websiteClicks), rpsVal: num(SOCIAL_RPS.websiteClicks), label: "GSC Clicks (Apr W2)", color: "#10b981" },
            ].map(s => (
              <div key={s.platform} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <div className="font-bold text-sm">{s.platform}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: NAVY }}>RIS</span>
                    <span className="font-black text-sm" style={{ color: s.color }}>{s.risVal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: CYAN }}>RPS</span>
                    <span className="font-black text-sm" style={{ color: s.color }}>{s.rpsVal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Monthly Summary Table ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Full Monthly Summary (Combined RIS + RPS)" sub="Dec 2025 – Apr 2026" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: NAVY }} className="text-white">
                  {["Month", "Leads", "Bookings", "Walk-ins", "Admissions", "Meta Spend", "Google Spend", "Total Spend", "CPL", "CPA", "ROI %"].map(h => (
                    <th key={h} className="py-3 px-3 text-left font-semibold text-xs whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MONTHLY_COMBINED.map((r, i) => (
                  <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""}`}>
                    <td className="py-3 px-3 font-bold text-[#091a4f]">{r.month}</td>
                    <td className="py-3 px-3">{num(r.leads)}</td>
                    <td className="py-3 px-3">{num(r.bookings)}</td>
                    <td className="py-3 px-3">{num(r.walkins)}</td>
                    <td className="py-3 px-3 font-bold text-green-600">{r.admissions}</td>
                    <td className="py-3 px-3 text-blue-600">{fmt(r.meta)}</td>
                    <td className="py-3 px-3 text-blue-400">{fmt(r.google)}</td>
                    <td className="py-3 px-3 font-bold text-red-500">{fmt(r.spend)}</td>
                    <td className="py-3 px-3">₹{r.cpl}</td>
                    <td className="py-3 px-3">₹{r.cpa.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.roi >= 1000 ? "bg-green-100 text-green-700" : r.roi >= 500 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                        {r.roi}%
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Totals */}
                <tr className="font-black border-t-2 border-gray-300" style={{ background: `${NAVY}10` }}>
                  <td className="py-3 px-3" style={{ color: NAVY }}>TOTAL</td>
                  <td className="py-3 px-3">{num(TOTAL.leads)}</td>
                  <td className="py-3 px-3">{num(TOTAL.bookings)}</td>
                  <td className="py-3 px-3">{num(TOTAL.walkins)}</td>
                  <td className="py-3 px-3 text-green-600">{TOTAL.admissions}</td>
                  <td className="py-3 px-3 text-blue-600">{fmt(TOTAL.meta)}</td>
                  <td className="py-3 px-3 text-blue-400">{fmt(TOTAL.google)}</td>
                  <td className="py-3 px-3 text-red-500">{fmt(TOTAL.spend)}</td>
                  <td className="py-3 px-3">₹{TOTAL.cpl}</td>
                  <td className="py-3 px-3">₹{TOTAL.cpa.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">{TOTAL.roi}%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Insights & Suggestions ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <SectionTitle title="Performance Insights & Recommendations" sub="Auto-generated from current data" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "🏆", color: "green", title: "March was the Best Month",
                body: "March 2026 achieved the highest ROI at 2,075% with 47 admissions on ₹1.95L spend. Meta CPL was lowest at ₹391.",
              },
              {
                icon: "⚠️", color: "amber", title: "January Spike in Spend",
                body: "January saw 2.4× higher spend (₹4.6L) vs other months with only 27 admissions. Review campaign targeting and bidding strategy.",
              },
              {
                icon: "📉", color: "amber", title: "April Walk-in Conversion Dip",
                body: "April conversion rate is 8.5% (18 adm / 213 leads). Walk-in to admission conversion needs attention — follow-up quality check recommended.",
              },
              {
                icon: "💡", color: "blue", title: "Google Dominates Spend",
                body: `Google accounts for ${Math.round((TOTAL.google / (TOTAL.meta + TOTAL.google)) * 100)}% of total ad budget. Review if Meta (lower CPL historically) can absorb more budget for better CPL.`,
              },
              {
                icon: "📱", color: "purple", title: "RPS Social Media Stronger",
                body: "RPS leads on Instagram (12,947 vs 9,842) and Facebook (12,964 vs 9,862). RPS social content engagement is consistently higher — replicate for RIS.",
              },
              {
                icon: "🎯", color: "green", title: "Strong Overall ROI",
                body: `YTD ROI of ${TOTAL.roi}% on ₹${fmt(TOTAL.spend)} spend generating ₹${fmt(TOTAL.admissions * 90000)} minimum revenue. Marketing is profitable.`,
              },
            ].map((ins, i) => (
              <div key={i} className={`rounded-xl p-4 border-l-4 ${ins.color === "green" ? "border-green-400 bg-green-50" : ins.color === "amber" ? "border-amber-400 bg-amber-50" : ins.color === "blue" ? "border-blue-400 bg-blue-50" : "border-purple-400 bg-purple-50"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{ins.icon}</span>
                  <div className="font-bold text-sm text-gray-800">{ins.title}</div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{ins.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-6">
          <div>🔒 This dashboard is strictly confidential — for internal management use only.</div>
          <div className="mt-1">Data sourced from DM Performance Tracker (Nabeel sub-sheet) · Last updated: {LAST_UPDATED}</div>
          <div className="mt-1">To update data, share a screenshot and we will refresh the numbers.</div>
        </div>
      </div>
    </div>
  );
}
