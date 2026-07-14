"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaBoxes,
  FaCheckCircle,
  FaTools,
  FaExclamationCircle,
  FaClock,
  FaClipboardCheck,
} from "react-icons/fa";
import { apiFetch } from "../../utils/api";
import StatCard from "../../components/dashboard/StatCard";
import DonutChart from "../../components/dashboard/DonutChart";
import "./dashboard.css";

type DashboardStats = {
  totalAssets: number;
  operationalAssets: number;
  underMaintenanceAssets: number;
  openIssues: number;
  overdueMaintenance: number;
  resolvedThisMonth: number;
  assetHealth: { Good: number; Fair: number; Poor: number; Unsafe: number };
  issuePriority: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  recentIssues: {
    _id: string;
    issueNumber: string;
    title: string;
    priority: string;
    asset: { name: string; assetCode: string };
  }[];
  upcomingMaintenance: {
    _id: string;
    name: string;
    assetCode: string;
    nextServiceDate: string;
  }[];
  mostFrequentAssets: {
    assetName: string;
    assetCode: string;
    issueCount: number;
  }[];
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/dashboard/admin-stats");
        setStats(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return <div className="dashboard-loading">Loading dashboard...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <p className="dashboard-subtitle">
        Overview of all assets and maintenance activity
      </p>

      <div className="stat-grid">
        <StatCard
          label="Total Assets"
          value={stats.totalAssets}
          color="blue"
          icon={<FaBoxes />}
        />
        <StatCard
          label="Operational Assets"
          value={stats.operationalAssets}
          color="green"
          icon={<FaCheckCircle />}
        />
        <StatCard
          label="Under Maintenance"
          value={stats.underMaintenanceAssets}
          color="teal"
          icon={<FaTools />}
        />
        <StatCard
          label="Open Issues"
          value={stats.openIssues}
          color="red"
          icon={<FaExclamationCircle />}
        />
        <StatCard
          label="Overdue Maintenance"
          value={stats.overdueMaintenance}
          color="amber"
          icon={<FaClock />}
        />
        <StatCard
          label="Resolved This Month"
          value={stats.resolvedThisMonth}
          color="green"
          icon={<FaClipboardCheck />}
        />
      </div>

      <div className="chart-grid">
        <DonutChart
          title="Asset Health"
          segments={[
            { label: "Good", value: stats.assetHealth.Good, color: "#16a34a" },
            { label: "Fair", value: stats.assetHealth.Fair, color: "#f59e0b" },
            { label: "Poor", value: stats.assetHealth.Poor, color: "#f97316" },
            {
              label: "Unsafe",
              value: stats.assetHealth.Unsafe,
              color: "#dc2626",
            },
          ]}
        />
        <DonutChart
          title="Issue Priority Distribution"
          segments={[
            {
              label: "Critical",
              value: stats.issuePriority.Critical,
              color: "#dc2626",
            },
            {
              label: "High",
              value: stats.issuePriority.High,
              color: "#f97316",
            },
            {
              label: "Medium",
              value: stats.issuePriority.Medium,
              color: "#f59e0b",
            },
            { label: "Low", value: stats.issuePriority.Low, color: "#16a34a" },
          ]}
        />
      </div>

      <div className="queue-grid">
        <div className="queue-card">
          <h3 className="queue-title">Live Queue — Recently Reported Issues</h3>
          {stats.recentIssues.length === 0 && (
            <p className="queue-empty">No issues reported yet</p>
          )}
          {stats.recentIssues.map((issue) => (
            <Link
              href={`/admin/issues/${issue._id}`}
              key={issue._id}
              className="queue-row"
            >
              <div>
                <p className="queue-row-title">{issue.title}</p>
                <p className="queue-row-sub">
                  {issue.issueNumber} · {issue.asset?.name}
                </p>
              </div>
              <span
                className={`priority-badge priority-${issue.priority.toLowerCase()}`}
              >
                {issue.priority}
              </span>
            </Link>
          ))}
        </div>

        <div className="queue-card">
          <h3 className="queue-title">Upcoming Maintenance</h3>
          {stats.upcomingMaintenance.length === 0 && (
            <p className="queue-empty">Nothing scheduled</p>
          )}
          {stats.upcomingMaintenance.map((asset) => (
            <Link
              href={`/admin/assets/${asset._id}`}
              key={asset._id}
              className="queue-row"
            >
              <div>
                <p className="queue-row-title">{asset.name}</p>
                <p className="queue-row-sub">{asset.assetCode}</p>
              </div>
              <span className="queue-date">
                {new Date(asset.nextServiceDate).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>

        <div className="queue-card">
          <h3 className="queue-title">Most Frequently Required Assets</h3>
          {stats.mostFrequentAssets.length === 0 && (
            <p className="queue-empty">No issue history yet</p>
          )}
          {stats.mostFrequentAssets.map((asset, i) => (
            <div className="queue-row" key={i}>
              <div>
                <p className="queue-row-title">{asset.assetName}</p>
                <p className="queue-row-sub">{asset.assetCode}</p>
              </div>
              <span className="queue-count">{asset.issueCount} issues</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
