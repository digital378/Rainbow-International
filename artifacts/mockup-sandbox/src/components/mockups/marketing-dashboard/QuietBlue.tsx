import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const monthlyLeads = [
  { month: "May-26", leads: 4 },
  { month: "Jun-26", leads: 8 },
  { month: "Jul-26", leads: 15 },
  { month: "Aug-26", leads: 6 },
  { month: "Sep-26", leads: 3 },
];

const statusData = [
  { name: "Open", value: 28, color: "#314d70" },
  { name: "Walk-in Booked", value: 7, color: "#7893ae" },
  { name: "Walk-in Completed", value: 1, color: "#c99a70" },
];

const kpis = [
  { label: "Total Leads", value: "36", hint: "All enquiries" },
  { label: "Walk-in Booked", value: "7", hint: "Appointments set" },
  { label: "Walk-in Done", value: "1", hint: "Completed visits" },
  { label: "Admissions", value: "0", hint: "This academic year" },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="qb-tooltip">
      <span>{label}</span>
      <strong>{payload[0].value} leads</strong>
    </div>
  );
}

export function QuietBlue() {
  return (
    <main className="quiet-blue">
      <style>{`
        .quiet-blue {
          --ink: #243852;
          --muted: #77889c;
          --line: #dfe6ec;
          --mist: #f2f6f9;
          min-height: 100dvh;
          box-sizing: border-box;
          padding: 33px 38px 36px;
          color: var(--ink);
          background: #f0f5f8;
          font-family: "Avenir Next", "Segoe UI", sans-serif;
          letter-spacing: .01em;
        }
        .qb-shell { max-width: 1100px; margin: 0 auto; }
        .qb-topline { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 24px; }
        .qb-kicker { margin: 0 0 7px; color: #7890a7; font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
        .qb-title { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(27px, 3vw, 35px); font-weight: 400; letter-spacing: -.035em; line-height: 1.08; }
        .qb-period { display: flex; align-items: center; gap: 9px; margin-top: 8px; color: var(--muted); font-size: 12px; }
        .qb-period-dot { width: 7px; height: 7px; border-radius: 50%; background: #c99a70; box-shadow: 0 0 0 4px #ebdfd5; }
        .qb-date { padding-top: 8px; color: #91a0af; font-size: 11px; white-space: nowrap; }
        .qb-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
        .qb-card { background: rgba(255,255,255,.93); border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 2px 10px rgba(42,65,88,.035); }
        .qb-kpi { min-height: 88px; padding: 16px 17px 14px; box-sizing: border-box; }
        .qb-label { color: #8191a3; font-size: 11px; font-weight: 600; }
        .qb-number { margin: 9px 0 5px; color: #304b6d; font-size: 27px; font-weight: 650; letter-spacing: -.045em; line-height: 1; }
        .qb-hint { color: #a4afbb; font-size: 10px; }
        .qb-charts { display: grid; grid-template-columns: 1.08fr .92fr; gap: 18px; }
        .qb-chart-card { min-height: 342px; padding: 21px 21px 16px; box-sizing: border-box; }
        .qb-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
        .qb-chart-title { margin: 0; font-family: Georgia, "Times New Roman", serif; color: #304863; font-size: 18px; font-weight: 400; letter-spacing: -.02em; }
        .qb-chart-subtitle { margin: 5px 0 0; color: #94a1af; font-size: 10px; }
        .qb-total-badge { padding: 5px 8px; border: 1px solid #e2e8ee; border-radius: 5px; color: #71869d; font-size: 10px; }
        .qb-area { height: 245px; margin: 20px -7px 0 -15px; }
        .qb-donut-wrap { display: flex; align-items: center; gap: 18px; height: 236px; margin-top: 11px; }
        .qb-donut { width: 56%; height: 100%; }
        .qb-legend { flex: 1; display: grid; gap: 13px; }
        .qb-legend-row { display: grid; grid-template-columns: 8px 1fr auto; align-items: center; gap: 8px; min-width: 0; }
        .qb-swatch { width: 7px; height: 7px; border-radius: 2px; }
        .qb-legend-name { color: #71849a; font-size: 10px; line-height: 1.25; }
        .qb-legend-value { color: #344d6c; font-size: 13px; font-weight: 650; }
        .qb-footnote { display: flex; align-items: center; gap: 6px; margin: 0; color: #9aa8b5; font-size: 10px; }
        .qb-footline { width: 15px; height: 1px; background: #c99a70; }
        .qb-tooltip { padding: 9px 11px; border: 1px solid #e2e8ee; border-radius: 6px; background: #fff; box-shadow: 0 5px 15px rgba(38,60,82,.09); font-size: 10px; }
        .qb-tooltip span, .qb-tooltip strong { display: block; }
        .qb-tooltip span { color: #91a0af; margin-bottom: 4px; }
        .qb-tooltip strong { color: #304b6d; font-weight: 650; }
        @media (max-width: 720px) {
          .quiet-blue { padding: 24px 18px; }
          .qb-topline { margin-bottom: 18px; }
          .qb-date { display: none; }
          .qb-kpis { grid-template-columns: repeat(2, 1fr); }
          .qb-charts { grid-template-columns: 1fr; }
        }
        @media (max-width: 430px) {
          .qb-kpis { gap: 8px; }
          .qb-kpi { padding: 13px; }
          .qb-chart-card { padding: 17px 14px 14px; }
          .qb-donut-wrap { gap: 8px; }
          .qb-donut { width: 52%; }
        }
      `}</style>
      <section className="qb-shell">
        <header className="qb-topline">
          <div>
            <p className="qb-kicker">Marketing overview</p>
            <h1 className="qb-title">AY 2027–28 dashboard</h1>
            <div className="qb-period"><span className="qb-period-dot" /> Lead activity, at a glance</div>
          </div>
          <div className="qb-date">Updated 08 Sep 2026</div>
        </header>

        <section className="qb-kpis" aria-label="Key metrics">
          {kpis.map((item) => (
            <article className="qb-card qb-kpi" key={item.label}>
              <div className="qb-label">{item.label}</div>
              <div className="qb-number">{item.value}</div>
              <div className="qb-hint">{item.hint}</div>
            </article>
          ))}
        </section>

        <section className="qb-charts" aria-label="Lead analytics">
          <article className="qb-card qb-chart-card">
            <div className="qb-card-head">
              <div>
                <h2 className="qb-chart-title">Monthly lead volume</h2>
                <p className="qb-chart-subtitle">New enquiries by month</p>
              </div>
              <div className="qb-total-badge">36 total</div>
            </div>
            <div className="qb-area">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyLeads} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="quietArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7893ae" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7893ae" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#91a0af", fontSize: 10 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1adb8", fontSize: 10 }} width={23} domain={[0, 16]} ticks={[0, 4, 8, 12, 16]} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#d6e0e8", strokeDasharray: "3 3" }} />
                  <Area type="monotone" dataKey="leads" stroke="#4e6d90" strokeWidth={2.2} fill="url(#quietArea)" dot={{ r: 3.5, fill: "#f8fbfc", stroke: "#4e6d90", strokeWidth: 2 }} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="qb-footnote"><span className="qb-footline" /> July was the busiest month</p>
          </article>

          <article className="qb-card qb-chart-card">
            <div className="qb-card-head">
              <div>
                <h2 className="qb-chart-title">Lead status</h2>
                <p className="qb-chart-subtitle">Where enquiries are today</p>
              </div>
              <div className="qb-total-badge">36 leads</div>
            </div>
            <div className="qb-donut-wrap">
              <div className="qb-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="59%" outerRadius="82%" paddingAngle={3} stroke="#fff" strokeWidth={3}>
                      {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="qb-legend">
                {statusData.map((item) => (
                  <div className="qb-legend-row" key={item.name}>
                    <span className="qb-swatch" style={{ background: item.color }} />
                    <span className="qb-legend-name">{item.name}</span>
                    <span className="qb-legend-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="qb-footnote"><span className="qb-footline" /> 78% of leads remain open</p>
          </article>
        </section>
      </section>
    </main>
  );
}
