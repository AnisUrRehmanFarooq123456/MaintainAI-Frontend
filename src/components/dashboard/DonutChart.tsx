"use client";

import "./DonutChart.css";

type Segment = { label: string; value: number; color: string };

export default function DonutChart({
  title,
  segments,
}: {
  title: string;
  segments: Segment[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulative = 0;
  const gradientParts = segments.map((s) => {
    const start = total === 0 ? 0 : (cumulative / total) * 360;
    cumulative += s.value;
    const end = total === 0 ? 0 : (cumulative / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  });

  const background =
    total === 0 ? "#e2e8f0" : `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="donut-card">
      <h3 className="donut-title">{title}</h3>
      <div className="donut-body">
        <div className="donut-chart" style={{ background }}>
          <div className="donut-hole">
            <span className="donut-total">{total}</span>
            <span className="donut-total-label">Total</span>
          </div>
        </div>
        <div className="donut-legend">
          {segments.map((s, i) => (
            <div className="donut-legend-item" key={i}>
              <span
                className="donut-dot"
                style={{ background: s.color }}
              ></span>
              <span className="donut-legend-label">{s.label}</span>
              <span className="donut-legend-value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
