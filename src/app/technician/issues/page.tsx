"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaFilter,
  FaTimes,
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

// Fields the user can filter by — mirrors the table headings.
const FILTER_FIELDS: { key: string; label: string }[] = [
  { key: "asset", label: "Asset" },
  { key: "title", label: "Title" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
];

const getFieldValue = (issue: Issue, fieldKey: string): string => {
  switch (fieldKey) {
    case "asset":
      return issue.asset?.name || "Unassigned";
    case "title":
      return issue.title || "";
    case "priority":
      return issue.priority || "";
    case "status":
      return issue.status || "";
    default:
      return "";
  }
};

export default function TechnicianIssuesPage() {
  const router = useRouter();
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
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

  // Distinct values available for whichever field is currently selected,
  // e.g. selecting "Asset" surfaces every unique asset name in the list.
  const filterValueOptions = useMemo(() => {
    if (!filterField) return [];
    const values = new Set<string>();
    allIssues.forEach((issue) => {
      const value = getFieldValue(issue, filterField);
      if (value) values.add(value);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [allIssues, filterField]);

  // Live filtering: re-runs on every keystroke (including deletions) and
  // whenever either dropdown changes.
  useEffect(() => {
    let filtered = allIssues;

    if (filterField && filterValue) {
      filtered = filtered.filter(
        (issue) => getFieldValue(issue, filterField) === filterValue,
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((issue) => {
        const title = issue.title?.toLowerCase() || "";
        const asset = issue.asset?.name?.toLowerCase() || "";
        return title.includes(q) || asset.includes(q);
      });
    }

    setIssues(filtered);
  }, [allIssues, search, filterField, filterValue]);

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

  const handleFieldChange = (value: string) => {
    setFilterField(value);
    setFilterValue("");
  };

  const handleClearFilters = () => {
    setFilterField("");
    setFilterValue("");
    setSearch("");
  };

  const hasActiveFilters = Boolean(search || filterField);

  const handleRowClick = (id: string) => {
    router.push(`/technician/issues/${id}`);
  };

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
            placeholder="Search by title or asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tech-issues-filter-group">
          <FaFilter className="tech-issues-filter-icon" />

          <select
            value={filterField}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="tech-issues-filter-select"
          >
            <option value="">Filter By...</option>
            {FILTER_FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="tech-issues-filter-select"
            disabled={!filterField}
          >
            <option value="">
              {filterField
                ? `All ${FILTER_FIELDS.find((f) => f.key === filterField)?.label}`
                : "Select a field first"}
            </option>
            {filterValueOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="tech-issues-clear-btn"
              onClick={handleClearFilters}
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>
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
              {issues.map((issue, index) => (
                <tr
                  key={issue._id}
                  onClick={() => handleRowClick(issue._id)}
                  style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
                >
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
                      onClick={(e) => e.stopPropagation()}
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
