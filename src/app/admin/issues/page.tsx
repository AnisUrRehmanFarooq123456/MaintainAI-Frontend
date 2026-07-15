"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch, FaPlus } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Issue } from "../../../utils/types";
import IssueStatusBadge from "../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import CreateIssueModal from "../../../components/issues/CreateIssueModal";
import "./issues.css";

const STATUSES = ["Reported", "Assigned", "Inspection Started", "Maintenance In Progress", "Waiting for Parts", "Resolved", "Closed", "Reopened"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];

export default function AdminIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (search) params.append("search", search);
      const res = await apiFetch(`/api/issue/get-all-issues?${params.toString()}`);
      setIssues(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadIssues();
  };

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div>
          <h1 className="issues-title">Issues</h1>
          <p className="issues-subtitle">All maintenance issues reported across assets</p>
        </div>
        <button className="issues-create-btn" onClick={() => setShowCreateModal(true)}>
          <FaPlus /> Create Issue
        </button>
      </div>

      <div className="issues-filters">
        <form className="issues-search" onSubmit={handleSearchSubmit}>
          <FaSearch />
          <input type="text" placeholder="Search by title..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="issues-filter-select">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="issues-filter-select">
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading && <p className="issues-loading">Loading issues...</p>}
      {error && <p className="issues-error">{error}</p>}

      {!loading && !error && (
        <div className="issues-table-wrap">
          <table className="issues-table">
            <thead>
              <tr>
                <th>Issue Number</th><th>Asset</th><th>Title</th><th>Reporter</th><th>Priority</th><th>Status</th><th>Assigned Technician</th><th>Reported Time</th><th>Last Updated</th><th></th>
              </tr>
            </thead>
            <tbody>
              {issues.length === 0 && (
                <tr><td colSpan={10} className="issues-empty">No issues found</td></tr>
              )}
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td className="issues-number">{issue.issueNumber}</td>
                  <td>{issue.asset?.name || "—"}</td>
                  <td className="issues-title-cell">{issue.title}</td>
                  <td>{issue.reporterName || "Anonymous"}</td>
                  <td><PriorityBadge priority={issue.priority} /></td>
                  <td><IssueStatusBadge status={issue.status} /></td>
                  <td>{issue.assignedTechnician?.fullName || "Unassigned"}</td>
                  <td className="issues-date">{new Date(issue.createdAt).toLocaleDateString()}</td>
                  <td className="issues-date">{new Date(issue.updatedAt).toLocaleDateString()}</td>
                  <td><Link href={`/admin/issues/${issue._id}`} className="issues-open-btn">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <CreateIssueModal onClose={() => setShowCreateModal(false)} onCreated={loadIssues} />
      )}
    </div>
  );
}