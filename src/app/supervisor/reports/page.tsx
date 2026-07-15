"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaClipboardList, FaCheckCircle, FaTrophy } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import IssueStatusBadge from "../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import "./team-reports.css";

type TechnicianOverview = {
  _id: string;
  fullName: string;
  specialization: string;
  assignedCount: number;
  completedCount: number;
};

type AssignedIssue = {
  _id: string;
  issueNumber: string;
  title: string;
  priority: string;
  status: string;
  asset: { name: string; assetCode: string };
  assignedTechnician: { _id: string; fullName: string } | null;
};

export default function SupervisorReportsPage() {
  const [technicians, setTechnicians] = useState<TechnicianOverview[]>([]);
  const [assignedIssues, setAssignedIssues] = useState<AssignedIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [techRes, issuesRes] = await Promise.all([
          apiFetch("/api/technicians/overview"),
          apiFetch("/api/issue/get-all-issues"),
        ]);

        setTechnicians(
          techRes.data.sort(
            (a: TechnicianOverview, b: TechnicianOverview) =>
              b.completedCount - a.completedCount,
          ),
        );

        const currentlyAssigned = issuesRes.data.filter(
          (i: AssignedIssue) =>
            i.assignedTechnician && !["Resolved", "Closed"].includes(i.status),
        );
        setAssignedIssues(currentlyAssigned);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalCompleted = technicians.reduce(
    (sum, t) => sum + t.completedCount,
    0,
  );
  const totalAssigned = technicians.reduce(
    (sum, t) => sum + t.assignedCount,
    0,
  );
  const maxCompleted = Math.max(...technicians.map((t) => t.completedCount), 1);

  if (loading) return <p className="tr-loading">Loading team performance...</p>;

  return (
    <div className="tr-page">
      <h1 className="tr-title">Team Performance</h1>
      <p className="tr-subtitle">
        Workload, active tasks, and completion across all technicians
      </p>

      <div className="tr-summary-row">
        <div className="tr-summary-card tr-summary-amber">
          <div className="tr-summary-icon">
            <FaClipboardList />
          </div>
          <span className="tr-summary-value">{totalAssigned}</span>
          <span className="tr-summary-label">Total Currently Assigned</span>
        </div>
        <div className="tr-summary-card tr-summary-green">
          <div className="tr-summary-icon">
            <FaCheckCircle />
          </div>
          <span className="tr-summary-value">{totalCompleted}</span>
          <span className="tr-summary-label">Total Completed (All Time)</span>
        </div>
      </div>

      <div className="tr-section-card">
        <h3>Currently Assigned Tasks</h3>
        {assignedIssues.length === 0 && (
          <p className="tr-empty">No active assignments right now</p>
        )}
        {assignedIssues.map((issue) => (
          <div className="tr-task-row" key={issue._id}>
            <div className="tr-task-main">
              <Link
                href={`/supervisor/issues/${issue._id}`}
                className="tr-task-title"
              >
                {issue.title}
              </Link>
              <p className="tr-task-sub">
                {issue.issueNumber} · {issue.asset?.name}
              </p>
            </div>
            <div className="tr-task-badges">
              <PriorityBadge priority={issue.priority} />
              <IssueStatusBadge status={issue.status} />
            </div>
            {issue.assignedTechnician && (
              <Link
                href={`/supervisor/issues?assignedTechnician=${issue.assignedTechnician._id}`}
                className="tr-task-technician"
              >
                {issue.assignedTechnician.fullName}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="tr-section-card">
        <h3>
          <FaTrophy className="tr-trophy" /> Ranked by Completed Work
        </h3>
        {technicians.length === 0 && (
          <p className="tr-empty">No technicians registered yet</p>
        )}
        {technicians.map((tech, i) => (
          <div className="tr-rank-row" key={tech._id}>
            <span
              className={`tr-rank-badge ${i === 0 ? "tr-rank-gold" : i === 1 ? "tr-rank-silver" : i === 2 ? "tr-rank-bronze" : ""}`}
            >
              #{i + 1}
            </span>
            <div className="tr-rank-info">
              <p className="tr-rank-name">{tech.fullName}</p>
              <p className="tr-rank-role">{tech.specialization}</p>
            </div>
            <div className="tr-rank-bar-wrap">
              <div
                className="tr-rank-bar"
                style={{
                  width: `${(tech.completedCount / maxCompleted) * 100}%`,
                }}
              ></div>
            </div>
            <span className="tr-rank-count">{tech.completedCount} done</span>
          </div>
        ))}
      </div>
    </div>
  );
}
