"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import IssueStatusBadge from "../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../components/ui/PriorityBadge";
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

export default function ReporterIssuesPage() {
  const [issues, setIssues] = useState<MyIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/issue/my-issues");
        setIssues(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="mc-page">
      <h1 className="mc-title">My Complaints</h1>
      <p className="mc-subtitle">
        All issues you have reported and their current status
      </p>

      {loading && <p className="mc-loading">Loading...</p>}

      {!loading && (
        <div className="mc-list">
          {issues.length === 0 && (
            <p className="mc-empty">You haven&apos;t reported any issues yet</p>
          )}
          {issues.map((issue) => (
            <div className="mc-card" key={issue._id}>
              <div className="mc-card-top">
                <div>
                  <p className="mc-card-number">{issue.issueNumber}</p>
                  <p className="mc-card-title">{issue.title}</p>
                </div>
                <div className="mc-card-badges">
                  <PriorityBadge priority={issue.priority} />
                  <IssueStatusBadge status={issue.status} />
                </div>
              </div>
              <p className="mc-card-desc">{issue.description}</p>
              <p className="mc-card-meta">
                {issue.asset?.name} ({issue.asset?.assetCode}) · Reported{" "}
                {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
