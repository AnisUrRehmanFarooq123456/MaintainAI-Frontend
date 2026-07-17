"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaSearch, FaPlus, FaFilter, FaTimes } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Issue } from "../../../utils/types";
import IssueStatusBadge from "../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
import CreateIssueModal from "../../../components/issues/CreateIssueModal";
import "./issues.css";

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

// Adjust to match whatever values PriorityBadge / your API actually use.
const PRIORITIES = ["Critical", "High", "Medium", "Low"];

const FILTER_FIELDS = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
];

export default function SupervisorIssuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openOnly = searchParams.get("openOnly") === "true";

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState(
    searchParams.get("status") ? "status" : "",
  );
  const [filterValue, setFilterValue] = useState(
    searchParams.get("status") || "",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isFirstSearch = useRef(true);

  // Only "status" is filtered server-side (matches the existing API).
  // "priority" is filtered client-side against whatever the server returns,
  // exactly the way the Assets page filters category/condition.
  const statusParam = filterField === "status" ? filterValue : "";

  const loadIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusParam && !openOnly) params.append("status", statusParam);
      if (search) params.append("search", search);
      const res = await apiFetch(
        `/api/issue/get-all-issues?${params.toString()}`,
      );
      const data = openOnly
        ? res.data.filter(
            (i: Issue) => !["Resolved", "Closed"].includes(i.status),
          )
        : res.data;
      setIssues(data);
    } finally {
      setLoading(false);
    }
  };

  // Initial load + reload whenever the server-side status filter changes.
  useEffect(() => {
    loadIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam, openOnly]);

  // Live, debounced search — fires automatically as the user types,
  // same pattern as the Assets page.
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      loadIssues();
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const valueOptions = useMemo(() => {
    if (filterField === "status") return STATUSES;
    if (filterField === "priority") return PRIORITIES;
    return [];
  }, [filterField]);

  const displayedIssues = useMemo(() => {
    if (filterField === "priority" && filterValue) {
      return issues.filter((i) => i.priority === filterValue);
    }
    return issues;
  }, [issues, filterField, filterValue]);

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

  const goToIssue = (id: string) => {
    router.push(`/supervisor/issues/${id}`);
  };

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div>
          <h1 className="issues-title">Issues</h1>
          <p className="issues-subtitle">
            {openOnly
              ? "All currently open issues"
              : "All issues — review and approve resolved work"}
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

        {!openOnly && (
          <div className="issues-filter-group">
            <FaFilter className="issues-filter-icon" />

            <select
              value={filterField}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="issues-filter-select"
            >
              <option value="">Filter By...</option>
              {FILTER_FIELDS.map((f) => (
                <option key={f.value} value={f.value}>
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
                {filterField
                  ? `All ${FILTER_FIELDS.find((f) => f.value === filterField)?.label}`
                  : "Select a field first"}
              </option>
              {valueOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                className="issues-clear-btn"
                onClick={handleClearFilters}
              >
                <FaTimes /> Clear
              </button>
            )}
          </div>
        )}
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
              {displayedIssues.length === 0 && (
                <tr className="issues-empty-row">
                  <td colSpan={7} className="issues-empty">
                    No issues found
                  </td>
                </tr>
              )}
              {displayedIssues.map((issue) => (
                <tr
                  key={issue._id}
                  className="issues-row-clickable"
                  onClick={() => goToIssue(issue._id)}
                >
                  <td data-label="Issue Number">
                    <span className="issues-number">{issue.issueNumber}</span>
                  </td>
                  <td data-label="Asset">{issue.asset?.name || "—"}</td>
                  <td className="issues-title-cell" data-label="Title">
                    {issue.title}
                  </td>
                  <td data-label="Priority">
                    <PriorityBadge priority={issue.priority} />
                  </td>
                  <td data-label="Status">
                    <IssueStatusBadge status={issue.status} />
                  </td>
                  <td className="issues-tech-cell" data-label="Technician">
                    {issue.assignedTechnician?.fullName || "Unassigned"}
                  </td>
                  <td className="issues-col-action" data-label="">
                    <button
                      type="button"
                      className="issues-open-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToIssue(issue._id);
                      }}
                    >
                      Open
                    </button>
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
