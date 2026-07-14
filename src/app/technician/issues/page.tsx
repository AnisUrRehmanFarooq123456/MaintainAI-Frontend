"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaSearch,
  FaClipboardList,
  FaSpinner,
  FaCheckCircle,
  FaFire,
} from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Issue } from "../../../utils/types";
import { getUser } from "../../../utils/auth";
import IssueStatusBadge from "../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import StatCard from "../../../components/dashboard/StatCard";
import "./issues.css";

const STATUSES = [
  "Assigned",
  "Inspection Started",
  "Maintenance In Progress",
  "Waiting for Parts",
  "Resolved",
  "Closed",
];

export default function TechnicianIssuesPage() {
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const user = getUser();

  const loadIssues = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/issue/get-all-issues?assignedTechnician=${user?.id || ""}`,
      );
      setAllIssues(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = allIssues;
    if (statusFilter)
      filtered = filtered.filter((i) => i.status === statusFilter);
    if (search)
      filtered = filtered.filter((i) =>
        i.title.toLowerCase().includes(search.toLowerCase()),
      );
    setIssues(filtered);
  }, [allIssues, statusFilter, search]);

  const inProgressCount = allIssues.filter((i) =>
    [
      "Inspection Started",
      "Maintenance In Progress",
      "Waiting for Parts",
    ].includes(i.status),
  ).length;
  const resolvedCount = allIssues.filter((i) =>
    ["Resolved", "Closed"].includes(i.status),
  ).length;
  const criticalCount = allIssues.filter(
    (i) =>
      i.priority === "Critical" && !["Resolved", "Closed"].includes(i.status),
  ).length;

  return (
    <div className="tech-issues-page">
      <h1 className="tech-issues-title">My Issues</h1>
      <p className="tech-issues-subtitle">
        All issues currently or previously assigned to you
      </p>

      <div className="tech-issues-stat-grid">
        <StatCard
          label="Total Assigned"
          value={allIssues.length}
          color="blue"
          icon={<FaClipboardList />}
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          color="teal"
          icon={<FaSpinner />}
        />
        <StatCard
          label="Resolved / Closed"
          value={resolvedCount}
          color="green"
          icon={<FaCheckCircle />}
        />
        <StatCard
          label="Critical Open"
          value={criticalCount}
          color="red"
          icon={<FaFire />}
        />
      </div>

      <div className="tech-issues-filters">
        <div className="tech-issues-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="tech-issues-filter-select"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="tech-issues-loading">Loading issues...</p>}
      {error && <p className="tech-issues-error">{error}</p>}

      {!loading && !error && (
        <div className="tech-issues-table-wrap">
          <table className="tech-issues-table">
            <thead>
              <tr>
                <th>Issue Number</th>
                <th>Asset</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr>
                  <td colSpan={7} className="tech-issues-empty">
                    No issues match your filters
                  </td>
                </tr>
              )}
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td className="tech-issues-number">{issue.issueNumber}</td>
                  <td>{issue.asset?.name || "—"}</td>
                  <td className="tech-issues-title-cell">{issue.title}</td>
                  <td>
                    <PriorityBadge priority={issue.priority} />
                  </td>
                  <td>
                    <IssueStatusBadge status={issue.status} />
                  </td>
                  <td className="tech-issues-date">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      href={`/technician/issues/${issue._id}`}
                      className="tech-issues-open-btn"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
