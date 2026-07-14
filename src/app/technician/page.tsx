"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  FaClipboardList,
  FaFire,
  FaSpinner,
  FaCalendarDay,
} from "react-icons/fa";
import { apiFetch } from "../../utils/api";
import StatCard from "../../components/dashboard/StatCard";
import IssueStatusBadge from "../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import "./technician-dashboard.css";
import "../admin/dashboard.css"


const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Assigned: ["Inspection Started"],
  "Inspection Started": ["Maintenance In Progress", "Waiting for Parts"],
  "Maintenance In Progress": ["Waiting for Parts"],
  "Waiting for Parts": ["Maintenance In Progress"],
};

type AssignedIssue = {
  _id: string;
  issueNumber: string;
  title: string;
  priority: string;
  status: string;
  asset: { name: string; assetCode: string; location?: string };
  createdAt: string;
};

type DashboardStats = {
  totalAssigned: number;
  highPriority: number;
  inProgress: number;
  newToday: number;
  assignedIssues: AssignedIssue[];
};

export default function TechnicianDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const res = await apiFetch("/api/dashboard/technician-stats");
      setStats(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleStartProgress = async (
    issueId: string,
    currentStatus: string,
  ) => {
    const nextStatuses = ALLOWED_TRANSITIONS[currentStatus];
    if (!nextStatuses || nextStatuses.length === 0) return;
    const nextStatus = nextStatuses[0];

    setActionLoadingId(issueId);
    try {
      await apiFetch(`/api/issue/update-status/${issueId}`, {
        method: "PUT",
        body: { status: nextStatus },
      });
      Swal.fire({
        icon: "success",
        title: `Moved to ${nextStatus}`,
        showConfirmButton: false,
        timer: 1300,
      });
      loadStats();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) return <p className="tech-dash-loading">Loading dashboard...</p>;
  if (error) return <p className="tech-dash-error">{error}</p>;
  if (!stats) return null;

  return (
    <div className="tech-dash-page">
      <h1 className="tech-dash-title">My Dashboard</h1>
      <p className="tech-dash-subtitle">
        Your assigned issues and current workload
      </p>

      <div className="tech-stat-grid">
        <StatCard
          label="Assigned to Me"
          value={stats.totalAssigned}
          color="blue"
          icon={<FaClipboardList />}
        />
        <StatCard
          label="High Priority"
          value={stats.highPriority}
          color="red"
          icon={<FaFire />}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          color="teal"
          icon={<FaSpinner />}
        />
        <StatCard
          label="New Today"
          value={stats.newToday}
          color="amber"
          icon={<FaCalendarDay />}
        />
      </div>

      <div className="tech-task-card">
        <h3 className="tech-task-title">My Assigned Tasks</h3>
        {stats.assignedIssues.length === 0 && (
          <p className="tech-task-empty">No issues currently assigned to you</p>
        )}

        {stats.assignedIssues.map((issue) => {
          const nextStatuses = ALLOWED_TRANSITIONS[issue.status] || [];
          return (
            <div className="tech-task-row" key={issue._id}>
              <div className="tech-task-info">
                <Link
                  href={`/technician/issues/${issue._id}`}
                  className="tech-task-title-link"
                >
                  {issue.title}
                </Link>
                <p className="tech-task-sub">
                  {issue.issueNumber} · {issue.asset?.name} (
                  {issue.asset?.assetCode})
                </p>
              </div>
              <div className="tech-task-badges">
                <PriorityBadge priority={issue.priority} />
                <IssueStatusBadge status={issue.status} />
              </div>
              {nextStatuses.length > 0 && (
                <button
                  className="tech-task-action-btn"
                  disabled={actionLoadingId === issue._id}
                  onClick={() => handleStartProgress(issue._id, issue.status)}
                >
                  {issue.status === "Assigned"
                    ? "Start Inspection"
                    : `Move to ${nextStatuses[0]}`}
                </button>
              )}
              {issue.status !== "Assigned" && issue.status !== "Reported" && (
                <Link
                  href={`/technician/issues/${issue._id}`}
                  className="tech-task-action-btn tech-task-action-outline"
                >
                  View / Resolve
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
