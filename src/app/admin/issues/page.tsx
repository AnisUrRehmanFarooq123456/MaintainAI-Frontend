"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSearch, FaPlus, FaFilter, FaTimes } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Issue } from "../../../utils/types";
import IssueStatusBadge from "../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import CreateIssueModal from "../../../components/issues/CreateIssueModal";
import "./issues.css";

// Fields available in the two-step filter. `getValue` pulls the display
// value used both for building the unique-value list and for matching rows.
const FILTER_FIELDS: {
  key: string;
  label: string;
  getValue: (issue: Issue) => string;
}[] = [
  {
    key: "issueNumber",
    label: "Issue Number",
    getValue: (i) => String(i.issueNumber ?? "—"),
  },
  { key: "asset", label: "Asset", getValue: (i) => i.asset?.name || "—" },
  { key: "title", label: "Title", getValue: (i) => i.title || "—" },
  {
    key: "reporter",
    label: "Reporter",
    getValue: (i) => i.reporterName || "Anonymous",
  },
  { key: "priority", label: "Priority", getValue: (i) => i.priority || "—" },
  { key: "status", label: "Status", getValue: (i) => i.status || "—" },
  {
    key: "technician",
    label: "Technician",
    getValue: (i) => i.assignedTechnician?.fullName || "Unassigned",
  },
];

export default function AdminIssuesPage() {
  const router = useRouter();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadIssues = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/issue/get-all-issues`);
      setIssues(res.data);
      setError("");
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

  // Unique values for whichever field is currently selected in step one.
  const uniqueValues = useMemo(() => {
    if (!filterField) return [];
    const field = FILTER_FIELDS.find((f) => f.key === filterField);
    if (!field) return [];
    const values = new Set(issues.map((i) => field.getValue(i)));
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [filterField, issues]);

  // Search reacts to every keystroke (typing or deleting) — no submit needed.
  const filteredIssues = useMemo(() => {
    const query = search.trim().toLowerCase();
    return issues.filter((issue) => {
      if (query && !issue.title?.toLowerCase().includes(query)) return false;
      if (filterField && filterValue) {
        const field = FILTER_FIELDS.find((f) => f.key === filterField);
        if (field && field.getValue(issue) !== filterValue) return false;
      }
      return true;
    });
  }, [issues, search, filterField, filterValue]);

  const handleFieldChange = (key: string) => {
    setFilterField(key);
    setFilterValue("");
  };

  const clearFilters = () => {
    setFilterField("");
    setFilterValue("");
  };

  const goToIssue = (id: string) => {
    router.push(`/admin/issues/${id}`);
  };

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div>
          <h1 className="issues-title">Issues</h1>
          <p className="issues-subtitle">
            All maintenance issues reported across assets
          </p>
        </div>
        <button
          className="issues-create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Create Issue
        </button>
      </div>

      <div className="issues-filters">
        <div className="issues-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="issues-filter-group">
          <FaFilter className="issues-filter-icon" />
          <select
            value={filterField}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="issues-filter-select"
          >
            <option value="">Filter by...</option>
            {FILTER_FIELDS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="issues-filter-select"
            disabled={!filterField}
          >
            <option value="">
              {filterField ? "All values" : "Select a filter first"}
            </option>
            {uniqueValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {(filterField || search) && (
            <button
              className="issues-clear-btn"
              onClick={clearFilters}
              type="button"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>
      </div>

      {loading && <p className="issues-loading">Loading issues...</p>}
      {error && <p className="issues-error">{error}</p>}

      {!loading && !error && (
        <div className="issues-table-wrap">
          <table className="issues-table">
            <thead>
              <tr>
                <th>Issue Number</th>
                <th>Asset</th>
                <th>Title</th>
                <th>Reporter</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="issues-col-technician">Technician</th>
                <th className="issues-col-action"></th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 && (
                <tr className="issues-empty-row">
                  <td colSpan={8} className="issues-empty">
                    No issues found
                  </td>
                </tr>
              )}
              {filteredIssues.map((issue) => (
                <tr
                  key={issue._id}
                  className="issues-row"
                  onClick={() => goToIssue(issue._id)}
                >
                  <td data-label="Issue Number">
                    <span className="issues-number">{issue.issueNumber}</span>
                  </td>
                  <td data-label="Asset">{issue.asset?.name || "—"}</td>
                  <td data-label="Title" className="issues-title-cell">
                    {issue.title}
                  </td>
                  <td data-label="Reporter">
                    {issue.reporterName || "Anonymous"}
                  </td>
                  <td data-label="Priority">
                    <PriorityBadge priority={issue.priority} />
                  </td>
                  <td data-label="Status">
                    <IssueStatusBadge status={issue.status} />
                  </td>
                  <td
                    data-label="Technician"
                    className="issues-col-technician issues-tech-cell"
                  >
                    {issue.assignedTechnician?.fullName || "Unassigned"}
                  </td>
                  <td data-label="" className="issues-col-action">
                    <Link
                      href={`/admin/issues/${issue._id}`}
                      className="issues-open-btn"
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

      {showCreateModal && (
        <CreateIssueModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadIssues}
        />
      )}
    </div>
  );
}
