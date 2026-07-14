"use client";

import { useEffect, useState } from "react";
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

export default function AnalyticsPage() {
  const [monthlyIssues, setMonthlyIssues] = useState<
    { _id: { year: number; month: number }; count: number }[]
  >([]);
  const [avgResolutionHours, setAvgResolutionHours] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/dashboard/admin-analytics");
        setMonthlyIssues(res.data.monthlyIssues);
        setAvgResolutionHours(res.data.avgResolutionHours);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const maxCount = Math.max(...monthlyIssues.map((m) => m.count), 1);

  return (
    <div className="analytics-page">
      <h1 className="analytics-title">Analytics</h1>
      <p className="analytics-subtitle">Trends over the last 6 months</p>

      {loading ? (
        <p className="analytics-loading">Loading analytics...</p>
      ) : (
        <>
          <div className="analytics-card">
            <h3>Average Resolution Time</h3>
            <p className="analytics-big-number">
              {avgResolutionHours.toFixed(1)} hrs
            </p>
          </div>

          <div className="analytics-card">
            <h3>Issues Reported Per Month</h3>
            <div className="bar-chart">
              {monthlyIssues.map((m, i) => (
                <div className="bar-chart-col" key={i}>
                  <div
                    className="bar-chart-bar"
                    style={{ height: `${(m.count / maxCount) * 160}px` }}
                  >
                    <span className="bar-chart-value">{m.count}</span>
                  </div>
                  <span className="bar-chart-label">
                    {MONTH_NAMES[m._id.month - 1]}
                  </span>
                </div>
              ))}
              {monthlyIssues.length === 0 && (
                <p className="analytics-empty">No issue data yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
