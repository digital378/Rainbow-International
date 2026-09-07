import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const leadVolume = [
  { month: 'May-26', leads: 4 },
  { month: 'Jun-26', leads: 8 },
  { month: 'Jul-26', leads: 15 },
  { month: 'Aug-26', leads: 6 },
  { month: 'Sep-26', leads: 3 },
];

const statusData = [
  { name: 'Open', value: 28, color: '#5d817b' },
  { name: 'Walk-in Booked', value: 7, color: '#c89264' },
  { name: 'Walk-in Completed', value: 1, color: '#d8a39a' },
];

const kpis = [
  { label: 'Total Leads', value: '36', note: 'Across all channels', tone: 'sage' },
  { label: 'Walk-in Booked', value: '7', note: 'Visits scheduled', tone: 'ochre' },
  { label: 'Walk-in Done', value: '1', note: 'Completed visits', tone: 'terracotta' },
  { label: 'Admissions', value: '0', note: 'Enrolments this cycle', tone: 'slate' },
];

const styles = `
  .ss-shell {
    --ink: #263d3b;
    --muted: #71807c;
    --line: #e4e9e4;
    --canvas: #f5f4ef;
    --card: #fffefa;
    min-height: 100dvh;
    box-sizing: border-box;
    padding: 28px 34px 30px;
    color: var(--ink);
    background: var(--canvas);
    font-family: "DM Sans", "Avenir Next", sans-serif;
    font-size: 13px;
    letter-spacing: -0.01em;
  }
  .ss-header {
    max-width: 1160px;
    margin: 0 auto 22px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
  }
  .ss-eyebrow {
    margin: 0 0 8px;
    color: #8b9c95;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .16em;
    text-transform: uppercase;
  }
  .ss-title {
    margin: 0;
    color: #294541;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(25px, 3vw, 34px);
    font-weight: 400;
    letter-spacing: -.04em;
    line-height: 1.05;
  }
  .ss-subtitle {
    margin: 8px 0 0;
    color: var(--muted);
    font-size: 12px;
  }
  .ss-period {
    flex: 0 0 auto;
    padding: 9px 13px;
    border: 1px solid #dde6df;
    border-radius: 9px;
    color: #627a73;
    background: rgba(255, 255, 252, .55);
    font-size: 11px;
    font-weight: 600;
  }
  .ss-kpis {
    max-width: 1160px;
    margin: 0 auto 20px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }
  .ss-kpi, .ss-card {
    border: 1px solid var(--line);
    background: var(--card);
    box-shadow: 0 4px 16px rgba(46, 69, 61, .035);
  }
  .ss-kpi {
    min-height: 82px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
    padding: 14px 16px 13px;
    border-radius: 10px;
  }
  .ss-kpi::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #5d817b;
  }
  .ss-kpi.ochre::before { background: #c89264; }
  .ss-kpi.terracotta::before { background: #d8a39a; }
  .ss-kpi.slate::before { background: #9caea8; }
  .ss-kpi-label {
    color: #82908b;
    font-size: 11px;
    font-weight: 600;
  }
  .ss-kpi-value {
    margin-top: 3px;
    color: #294541;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 27px;
    line-height: 1;
  }
  .ss-kpi-note {
    margin-top: 7px;
    color: #9aa6a2;
    font-size: 10px;
  }
  .ss-charts {
    max-width: 1160px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.14fr) minmax(0, .86fr);
    gap: 16px;
  }
  .ss-card {
    min-width: 0;
    border-radius: 12px;
    padding: 18px 18px 14px;
  }
  .ss-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
  }
  .ss-card-title {
    margin: 0;
    color: #304b47;
    font-size: 13px;
    font-weight: 700;
  }
  .ss-card-caption {
    margin: 4px 0 0;
    color: #98a39f;
    font-size: 10px;
  }
  .ss-chart-wrap {
    height: 222px;
  }
  .ss-tooltip {
    padding: 8px 10px;
    border: 1px solid #e2e9e3;
    border-radius: 7px;
    background: #fffefa;
    box-shadow: 0 5px 18px rgba(46, 69, 61, .08);
  }
  .ss-tooltip-label {
    margin: 0 0 4px;
    color: #87928e;
    font-size: 10px;
  }
  .ss-tooltip-value {
    margin: 0;
    color: #345b55;
    font-weight: 700;
  }
  .ss-status-layout {
    height: 222px;
    display: grid;
    grid-template-columns: minmax(145px, 1fr) minmax(130px, .9fr);
    align-items: center;
    gap: 8px;
  }
  .ss-donut {
    position: relative;
    height: 190px;
  }
  .ss-donut-center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    pointer-events: none;
  }
  .ss-donut-total {
    color: #294541;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 27px;
    line-height: 1;
  }
  .ss-donut-label {
    margin-top: 5px;
    color: #9aa6a2;
    font-size: 10px;
  }
  .ss-legend {
    display: grid;
    gap: 13px;
  }
  .ss-legend-row {
    display: grid;
    grid-template-columns: 9px minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }
  .ss-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .ss-legend-name {
    color: #657570;
    font-size: 10px;
    line-height: 1.25;
  }
  .ss-legend-value {
    color: #38534e;
    font-size: 12px;
    font-weight: 700;
  }
  @media (max-width: 700px) {
    .ss-shell { padding: 22px 16px 24px; }
    .ss-header { align-items: flex-start; flex-direction: column; gap: 14px; margin-bottom: 18px; }
    .ss-period { align-self: flex-start; }
    .ss-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; margin-bottom: 14px; }
    .ss-kpi { min-height: 76px; padding: 12px 13px; }
    .ss-kpi-value { font-size: 24px; }
    .ss-charts { grid-template-columns: 1fr; gap: 12px; }
  }
  @media (max-width: 400px) {
    .ss-status-layout { grid-template-columns: 1fr 1fr; gap: 0; }
    .ss-card { padding: 15px 12px 12px; }
  }
`;

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ss-tooltip">
      <p className="ss-tooltip-label">{label}</p>
      <p className="ss-tooltip-value">{payload[0].value} leads</p>
    </div>
  );
}

export function SoftSage() {
  return (
    <main className="ss-shell">
      <style>{styles}</style>
      <header className="ss-header">
        <div>
          <p className="ss-eyebrow">Marketing · Staff overview</p>
          <h1 className="ss-title">Marketing AY 2027–28</h1>
          <p className="ss-subtitle">A clear view of enquiries and visits as the new cycle takes shape.</p>
        </div>
        <div className="ss-period">Reporting period&nbsp; · &nbsp;May–Sep 2026</div>
      </header>

      <section className="ss-kpis" aria-label="Marketing key performance indicators">
        {kpis.map((kpi) => (
          <article className={`ss-kpi ${kpi.tone}`} key={kpi.label}>
            <div className="ss-kpi-label">{kpi.label}</div>
            <div className="ss-kpi-value">{kpi.value}</div>
            <div className="ss-kpi-note">{kpi.note}</div>
          </article>
        ))}
      </section>

      <section className="ss-charts" aria-label="Marketing charts">
        <article className="ss-card">
          <div className="ss-card-head">
            <div>
              <h2 className="ss-card-title">Monthly lead volume</h2>
              <p className="ss-card-caption">New enquiries received by month</p>
            </div>
          </div>
          <div className="ss-chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadVolume} margin={{ top: 8, right: 8, bottom: 4, left: -22 }}>
                <CartesianGrid vertical={false} stroke="#edf0ec" strokeDasharray="2 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#92a09b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a3ada9', fontSize: 10 }} domain={[0, 16]} ticks={[0, 4, 8, 12, 16]} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#d9e4dc', strokeDasharray: '3 3' }} />
                <Line type="monotone" dataKey="leads" stroke="#5d817b" strokeWidth={2.5} dot={{ r: 4, fill: '#fffefa', stroke: '#5d817b', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#5d817b', stroke: '#fffefa', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="ss-card">
          <div className="ss-card-head">
            <div>
              <h2 className="ss-card-title">Lead status breakdown</h2>
              <p className="ss-card-caption">Where each enquiry sits today</p>
            </div>
          </div>
          <div className="ss-status-layout">
            <div className="ss-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="86%" paddingAngle={3} stroke="#fffefa" strokeWidth={3}>
                    {statusData.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="ss-donut-center">
                <span className="ss-donut-total">36</span>
                <span className="ss-donut-label">total leads</span>
              </div>
            </div>
            <div className="ss-legend">
              {statusData.map((item) => (
                <div className="ss-legend-row" key={item.name}>
                  <span className="ss-legend-dot" style={{ background: item.color }} />
                  <span className="ss-legend-name">{item.name}</span>
                  <span className="ss-legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default SoftSage;