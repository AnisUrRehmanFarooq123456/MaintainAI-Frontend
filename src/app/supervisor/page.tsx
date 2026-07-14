"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaClipboardCheck, FaUsers, FaExclamationCircle } from "react-icons/fa";
import { apiFetch } from "../../utils/api";
import StatCard from "../../components/dashboard/StatCard";
import IssueStatusBadge from "../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import "./supervisor-dashboard.css";

type Issue = {
  _id: string;
  issueNumber: string;
  title: string;
  priority: string;
  status: string;
  asset: { name: string; assetCode: string };
};

export default function SupervisorDashboardPage() {
  const [pending, setPending] = useState<Issue[]>([]);
  const [openIssuesCount, setOpenIssuesCount] = useState(0);
  const [technicianCount, setTechnicianCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pendingRes, openRes, techRes] = await Promise.all([
          apiFetch("/api/issue/get-all-issues?status=Resolved"),
          apiFetch("/api/issue/get-all-issues"),
          apiFetch("/api/technicians/overview"),
        ]);
        setPending(pendingRes.data);
        setOpenIssuesCount(
          openRes.data.filter(
            (i: Issue) => !["Resolved", "Closed"].includes(i.status),
          ).length,
        );
        setTechnicianCount(techRes.data.length);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="sup-dash-loading">Loading dashboard...</p>;

  return (
    <div className="sup-dash-page">
      <h1 className="sup-dash-title">Supervisor Dashboard</h1>
      <p className="sup-dash-subtitle">
        Review completed work and monitor team activity
      </p>

      <div className="sup-stat-grid">
        <StatCard
          label="Pending Your Approval"
          value={pending.length}
          color="amber"
          icon={<FaClipboardCheck />}
        />
        <StatCard
          label="Currently Open Issues"
          value={openIssuesCount}
          color="red"
          icon={<FaExclamationCircle />}
        />
        <StatCard
          label="Active Technicians"
          value={technicianCount}
          color="teal"
          icon={<FaUsers />}
        />
      </div>

      <div className="sup-pending-card">
        <h3>Resolved Issues — Awaiting Your Review</h3>
        {pending.length === 0 && (
          <p className="sup-pending-empty">Nothing pending review right now</p>
        )}
        {pending.map((issue) => (
          <div className="sup-pending-row" key={issue._id}>
            <div>
              <Link
                href={`/supervisor/issues/${issue._id}`}
                className="sup-pending-title"
              >
                {issue.title}
              </Link>
              <p className="sup-pending-sub">
                {issue.issueNumber} · {issue.asset?.name}
              </p>
            </div>
            <div className="sup-pending-badges">
              <PriorityBadge priority={issue.priority} />
              <IssueStatusBadge status={issue.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
