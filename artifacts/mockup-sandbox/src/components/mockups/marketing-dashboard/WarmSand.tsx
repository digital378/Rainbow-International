import type { CSSProperties } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const leadVolume = [
  { month: "May-26", leads: 4 },
  { month: "Jun-26", leads: 8 },
  { month: "Jul-26", leads: 15 },
  { month: "Aug-26", leads: 6 },
  { month: "Sep-26", leads: 3 },
];

const statusBreakdown = [
  { name: "Open", value: 28, color: "#8b9173" },
  { name: "Walk-in Booked", value: 7, color: "#c79b5b" },
  { name: "Walk-in Completed", value: 1, color: "#b86f5e" },
];

const kpis = [
  { label: "Total Leads", value: "36", note: "Across all sources", tone: "olive" },
  { label: "Walk-in Booked", value: "7", note: "Visits scheduled", tone: "ochre" },
  { label: "Walk-in Done", value: "1", note: "Completed visits", tone: "clay" },
  { label: "Admissions", value: "0", note: "This academic year", tone: "stone" },
];

const tooltipStyle = {
  backgroundColor: "#fffdf8",
  border: "1px solid #e5dfd1",
  borderRadius: 8,
  boxShadow: "0 5px 18px rgba(92, 76, 51, .08)",
  color: "#48483e",
  fontSize: 12,
};

export function WarmSand() {
  return (
    <main className="warm-sand-dashboard">
      <style>{`
        .warm-sand-dashboard {
          --sand: #f2eee5;
          --ivory: #fffdf8;
          --ink: #48483e;
          --muted: #888579;
          --line: #e5dfd1;
          --olive: #8b9173;
          --ochre: #c79b5b;
          --clay: #b86f5e;
          --stone: #aaa496;
          min-height: 100%;
          box-sizing: border-box;
          padding: 34px 38px 42px;
          background: var(--sand);
          color: var(--ink);
          font-family: "DM Sans", "Avenir Next", sans-serif;
        }
        .warm-sand-dashboard *, .warm-sand-dashboard *::before, .warm-sand-dashboard *::after { box-sizing: border-box; }
        .warm-sand-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 25px;
          gap: 18px;
        }
        .warm-sand-eyebrow {
          margin: 0 0 8px;
          color: #a09580;
          font-family: "Space Mono", monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .warm-sand-title {
          margin: 0;
          color: #48483e;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(28px, 4vw, 35px);
          font-weight: 400;
          letter-spacing: -.035em;
          line-height: 1.05;
        }
        .warm-sand-date {
          color: #9a9587;
          font-size: 11px;
          letter-spacing: .01em;
          white-space: nowrap;
          padding-bottom: 3px;
        }
        .warm-sand-kpis {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 14px;
        }
        .warm-sand-card {
          background: var(--ivory);
          border: 1px solid var(--line);
          border-radius: 10px;
          box-shadow: 0 3px 12px rgba(102, 83, 53, .035);
        }
        .warm-sand-kpi {
          position: relative;
          min-height: 112px;
          padding: 17px 18px 16px;
          overflow: hidden;
        }
        .warm-sand-kpi::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--tone);
        }
        .warm-sand-kpi-label {
          color: #8b887d;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: .015em;
        }
        .warm-sand-kpi-value {
          margin-top: 8px;
          color: #545648;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 29px;
          line-height: 1;
        }
        .warm-sand-kpi-note {
          margin-top: 11px;
          color: #ada79a;
          font-size: 10px;
        }
        .warm-sand-charts {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
          gap: 14px;
        }
        .warm-sand-chart-card {
          min-width: 0;
          height: 330px;
          padding: 21px 20px 17px;
        }
        .warm-sand-card-heading {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 5px;
        }
        .warm-sand-card-title {
          margin: 0;
          color: #56574b;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 17px;
          font-weight: 400;
          letter-spacing: -.015em;
        }
        .warm-sand-card-subtitle {
          color: #aaa496;
          font-size: 10px;
          white-space: nowrap;
        }
        .warm-sand-chart-wrap {
          height: 260px;
          margin-top: 11px;
        }
        .warm-sand-donut-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(110px, .95fr);
          align-items: center;
          height: 260px;
          gap: 8px;
        }
        .warm-sand-donut {
          height: 220px;
          min-width: 0;
        }
        .warm-sand-legend {
          display: grid;
          gap: 14px;
          padding-right: 5px;
        }
        .warm-sand-legend-item {
          display: grid;
          grid-template-columns: 8px minmax(0, 1fr);
          column-gap: 9px;
          align-items: start;
        }
        .warm-sand-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 4px;
        }
        .warm-sand-legend-name {
          display: block;
          color: #777568;
          font-size: 10px;
          line-height: 1.3;
        }
        .warm-sand-legend-value {
          display: block;
          margin-top: 3px;
          color: #555648;
          font-family: "Space Mono", monospace;
          font-size: 13px;
        }
        @media (max-width: 720px) {
          .warm-sand-dashboard { padding: 25px 20px 30px; }
          .warm-sand-header { align-items: flex-start; flex-direction: column; gap: 8px; }
          .warm-sand-date { padding: 0; }
          .warm-sand-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .warm-sand-charts { grid-template-columns: 1fr; }
          .warm-sand-chart-card { height: 315px; }
        }
        @media (max-width: 420px) {
          .warm-sand-kpis { gap: 9px; }
          .warm-sand-kpi { padding-left: 14px; }
          .warm-sand-card-heading { display: block; }
          .warm-sand-card-subtitle { display: block; margin-top: 4px; }
          .warm-sand-donut-layout { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <header className="warm-sand-header">
        <div>
          <p className="warm-sand-eyebrow">Admissions / Marketing</p>
          <h1 className="warm-sand-title">AY 2027–28 overview</h1>
        </div>
        <div className="warm-sand-date">Updated 18 September 2026</div>
      </header>

      <section className="warm-sand-kpis" aria-label="Key metrics">
        {kpis.map((kpi) => (
          <article className="warm-sand-card warm-sand-kpi" style={{ "--tone": `var(--${kpi.tone})` } as CSSProperties} key={kpi.label}>
            <div className="warm-sand-kpi-label">{kpi.label}</div>
            <div className="warm-sand-kpi-value">{kpi.value}</div>
            <div className="warm-sand-kpi-note">{kpi.note}</div>
          </article>
        ))}
      </section>

      <section className="warm-sand-charts" aria-label="Lead analytics">
        <article className="warm-sand-card warm-sand-chart-card">
          <div className="warm-sand-card-heading">
            <h2 className="warm-sand-card-title">Monthly lead volume</h2>
            <span className="warm-sand-card-subtitle">May — Sep 2026</span>
          </div>
          <div className="warm-sand-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadVolume} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#ede8dc" strokeDasharray="2 3" />
                <XAxis dataKey="month" tick={{ fill: "#aaa496", fontSize: 9 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis allowDecimals={false} domain={[0, 16]} ticks={[0, 4, 8, 12, 16]} tick={{ fill: "#aaa496", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f7f3eb" }} contentStyle={tooltipStyle} formatter={(value) => [`${value} leads`, "Volume"]} />
                <Bar dataKey="leads" fill="#8b9173" radius={[4, 4, 1, 1]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="warm-sand-card warm-sand-chart-card">
          <div className="warm-sand-card-heading">
            <h2 className="warm-sand-card-title">Lead status</h2>
            <span className="warm-sand-card-subtitle">36 total leads</span>
          </div>
          <div className="warm-sand-donut-layout">
            <div className="warm-sand-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="84%" paddingAngle={3} stroke="none">
                    {statusBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="warm-sand-legend">
              {statusBreakdown.map((status) => (
                <div className="warm-sand-legend-item" key={status.name}>
                  <span className="warm-sand-legend-dot" style={{ backgroundColor: status.color }} />
                  <div>
                    <span className="warm-sand-legend-name">{status.name}</span>
                    <span className="warm-sand-legend-value">{status.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}