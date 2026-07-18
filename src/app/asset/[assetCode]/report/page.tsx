"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../../../utils/api";
import IssueStatusBadge from "../../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../../components/ui/PriorityBadge";
import "./my-complaints.css";

type MyIssue = {
  _id: string;
  issueNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  asset: { name: string; assetCode: string };
  createdAt: string;
};

type Profile = { fullName: string };

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
] as const;

const OPEN_STATUSES = [
  "Reported",
  "Assigned",
  "Inspection Started",
  "Maintenance In Progress",
  "Waiting for Parts",
  "Reopened",
];
const RESOLVED_STATUSES = ["Resolved", "Closed"];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ReporterIssuesPage() {
  const [issues, setIssues] = useState<MyIssue[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] =
    useState<(typeof STATUS_FILTERS)[number]["key"]>("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [issuesRes, profileRes] = await Promise.all([
          apiFetch("/api/issue/my-issues"),
          apiFetch("/api/profile/me"),
        ]);
        setIssues(issuesRes.data || []);
        setProfile(profileRes.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredIssues = useMemo(() => {
    if (filter === "open") {
      return issues.filter((i) => OPEN_STATUSES.includes(i.status));
    }
    if (filter === "resolved") {
      return issues.filter((i) => RESOLVED_STATUSES.includes(i.status));
    }
    return issues;
  }, [issues, filter]);

  const counts = useMemo(
    () => ({
      all: issues.length,
      open: issues.filter((i) => OPEN_STATUSES.includes(i.status)).length,
      resolved: issues.filter((i) => RESOLVED_STATUSES.includes(i.status))
        .length,
    }),
    [issues],
  );

  return (
    <div className="mc-page">
      <div className="mc-header">
        {profile?.fullName && <p className="mc-username">{profile.fullName}</p>}
        <h1 className="mc-title">My Complaints</h1>
        <p className="mc-subtitle">
          All issues you have reported and their current status
        </p>
      </div>

      {!loading && !error && issues.length > 0 && (
        <div className="mc-filters">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`mc-filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="mc-filter-count">{counts[f.key]}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mc-loading-wrap">
          <div className="mc-spinner" />
          <p className="mc-loading">Loading your complaints...</p>
        </div>
      )}

      {!loading && error && (
        <div className="mc-empty-wrap">
          <p className="mc-empty mc-error">
            Couldn&apos;t load your complaints right now. Please try again.
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="mc-list">
          {issues.length === 0 && (
            <div className="mc-empty-wrap">
              <p className="mc-empty">
                You haven&apos;t reported any issues yet
              </p>
            </div>
          )}

          {issues.length > 0 && filteredIssues.length === 0 && (
            <div className="mc-empty-wrap">
              <p className="mc-empty">No complaints match this filter</p>
            </div>
          )}

          {filteredIssues.map((issue, i) => (
            <div
              className={`mc-card ${
                issue.priority === "Critical" ? "mc-card-critical" : ""
              }`}
              key={issue._id}
              style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}
            >
              <div className="mc-card-top">
                <div className="mc-card-heading">
                  <p className="mc-card-number">{issue.issueNumber}</p>
                  <p className="mc-card-title">{issue.title}</p>
                </div>
                <div className="mc-card-badges">
                  <PriorityBadge priority={issue.priority} />
                  <IssueStatusBadge status={issue.status} />
                </div>
              </div>

              <p className="mc-card-desc">{issue.description}</p>

              <div className="mc-card-footer">
                <span className="mc-card-meta">
                  {issue.asset?.name}
                  {issue.asset?.assetCode ? ` (${issue.asset.assetCode})` : ""}
                </span>
                <span className="mc-card-date">
                  Reported {formatDate(issue.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
