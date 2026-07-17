"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./analytics.css";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type MonthlyIssue = { _id: { year: number; month: number }; count: number };

export default function AnalyticsPage() {
  const [monthlyIssues, setMonthlyIssues] = useState<MonthlyIssue[]>([]);
  const [avgResolutionHours, setAvgResolutionHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/dashboard/admin-analytics");
        setMonthlyIssues(res.data.monthlyIssues || []);
        setAvgResolutionHours(res.data.avgResolutionHours || 0);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Figure out which year to display — prefer the most recent year present
  // in the data, otherwise fall back to the current year.
  const activeYear = useMemo(() => {
    if (monthlyIssues.length === 0) return new Date().getFullYear();
    return Math.max(...monthlyIssues.map((m) => m._id.year));
  }, [monthlyIssues]);

  // Build a full 12-month grid for that year, filling in real counts
  // wherever we have them and leaving the rest at 0.
  const yearData = useMemo(() => {
    const lookup = new Map<number, number>();
    monthlyIssues
      .filter((m) => m._id.year === activeYear)
      .forEach((m) => lookup.set(m._id.month, m.count));

    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        month,
        label: MONTH_NAMES[i],
        count: lookup.get(month) ?? 0,
        hasData: lookup.has(month),
      };
    });
  }, [monthlyIssues, activeYear]);

  const maxCount = Math.max(...yearData.map((m) => m.count), 1);
  const totalIssues = yearData.reduce((sum, m) => sum + m.count, 0);
  const monthsWithData = yearData.filter((m) => m.hasData);
  const activeMonthsCount = monthsWithData.length;
  const peakMonth = monthsWithData.reduce(
    (best, m) => (m.count > (best?.count ?? -1) ? m : best),
    null as (typeof yearData)[number] | null,
  );
  const avgPerActiveMonth =
    activeMonthsCount > 0 ? totalIssues / activeMonthsCount : 0;

  // Coordinates for the trend line/area chart (SVG), based on the same
  // 12-month grid.
  const chartWidth = 640;
  const chartHeight = 160;
  const padding = 12;
  const points = yearData.map((m, i) => {
    const x =
      padding + (i * (chartWidth - padding * 2)) / (yearData.length - 1);
    const y =
      chartHeight -
      padding -
      (m.count / maxCount) * (chartHeight - padding * 2);
    return { x, y, ...m };
  });
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${
    chartHeight - padding
  } L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">
            Issue trends for{" "}
            <span className="analytics-year-pill">{activeYear}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="analytics-loading-wrap">
          <div className="analytics-spinner" />
          <p className="analytics-loading">Loading analytics...</p>
        </div>
      ) : error ? (
        <p className="analytics-empty">Couldn't load analytics right now.</p>
      ) : (
        <>
          {/* Summary stat cards */}
          <div className="analytics-stats-grid">
            
            <div className="analytics-card stat-card">
              <h3>Total Issues ({activeYear})</h3>
              <p className="analytics-big-number">{totalIssues}</p>
            </div>
            <div className="analytics-card stat-card">
              <h3>Busiest Month</h3>
              <p className="analytics-big-number">
                {peakMonth ? peakMonth.label : "—"}
                {peakMonth && (
                  <span className="analytics-unit">
                    {peakMonth.count} issues
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Full-year bar chart */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>Issues Reported — {activeYear}</h3>
              <span className="analytics-card-note">
                {activeMonthsCount > 0
                  ? `Data available for ${activeMonthsCount} month${
                      activeMonthsCount > 1 ? "s" : ""
                    }`
                  : "No data yet this year"}
              </span>
            </div>
            <div className="bar-chart">
              {yearData.map((m) => (
                <div className="bar-chart-col" key={m.month}>
                  <div className="bar-chart-track">
                    <div
                      className={`bar-chart-bar ${
                        m.hasData ? "has-data" : "no-data"
                      }`}
                      style={{
                        height: m.hasData
                          ? `${Math.max((m.count / maxCount) * 160, 4)}px`
                          : "4px",
                      }}
                    >
                      {m.hasData && (
                        <span className="bar-chart-value">{m.count}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`bar-chart-label ${m.hasData ? "active" : ""}`}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trend line chart */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>Trend Over the Year</h3>
              <span className="analytics-card-note">{activeYear}</span>
            </div>
            <svg
              className="trend-chart"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <line
                  key={f}
                  x1={padding}
                  x2={chartWidth - padding}
                  y1={padding + f * (chartHeight - padding * 2)}
                  y2={padding + f * (chartHeight - padding * 2)}
                  className="trend-gridline"
                />
              ))}
              <path d={areaPath} className="trend-area" />
              <path d={linePath} className="trend-line" />
              {points.map((p) => (
                <circle
                  key={p.month}
                  cx={p.x}
                  cy={p.y}
                  r={p.hasData ? 4 : 2.5}
                  className={`trend-dot ${p.hasData ? "active" : ""}`}
                >
                  <title>
                    {p.label} {activeYear}: {p.count} issue
                    {p.count !== 1 ? "s" : ""}
                  </title>
                </circle>
              ))}
            </svg>
            <div className="trend-chart-labels">
              {yearData.map((m) => (
                <span key={m.month} className={m.hasData ? "active" : ""}>
                  {m.label}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
