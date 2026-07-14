"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Issue } from "../../../utils/types";
import IssueStatusBadge from "../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import "../../admin/issues/issues.css";

const STATUSES = [
  "Reported",
  "Assigned",
  "Inspection Started",
  "Maintenance In Progress",
  "Waiting for Parts",
  "Resolved",
  "Closed",
  "Reopened",
];

export default function SupervisorIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);
      const res = await apiFetch(
        `/api/issue/get-all-issues?${params.toString()}`,
      );
      setIssues(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div className="issues-page">
      <h1 className="issues-title">Issues</h1>
      <p className="issues-subtitle">
        All issues — review and approve resolved work
      </p>

      <div className="issues-filters">
        <form
          className="issues-search"
          onSubmit={(e) => {
            e.preventDefault();
            loadIssues();
          }}
        >
          <FaSearch />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="issues-filter-select"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="issues-loading">Loading issues...</p>}

      {!loading && (
        <div className="issues-table-wrap">
          <table className="issues-table">
            <thead>
              <tr>
                <th>Issue Number</th>
                <th>Asset</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Technician</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr>
                  <td colSpan={7} className="issues-empty">
                    No issues found
                  </td>
                </tr>
              )}
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td className="issues-number">{issue.issueNumber}</td>
                  <td>{issue.asset?.name || "—"}</td>
                  <td className="issues-title-cell">{issue.title}</td>
                  <td>
                    <PriorityBadge priority={issue.priority} />
                  </td>
                  <td>
                    <IssueStatusBadge status={issue.status} />
                  </td>
                  <td>{issue.assignedTechnician?.fullName || "Unassigned"}</td>
                  <td>
                    <Link
                      href={`/supervisor/issues/${issue._id}`}
                      className="issues-open-btn"
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
