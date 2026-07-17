"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaUser,
  FaClock,
  FaHistory,
  FaLayerGroup,
} from "react-icons/fa";
import { apiFetch } from "../../../../utils/api";
import IssueStatusBadge from "../../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../../components/ui/PriorityBadge";
import "../../../admin/issues/[id]/issue-detail.css";

type IssueDetail = {
  _id: string;
  issueNumber: string;
  title: string;
  description: string;
  category?: string;
  priority: string;
  status: string;
  reporterName?: string;
  reporterContact?: string;
  evidence: string[];
  aiSuggestion?: {
    possibleCauses?: string[];
    initialChecks?: string[];
  };
  aiSuggested: boolean;
  aiEdited: boolean;
  assignedTechnician?: { fullName: string; email: string } | null;
  asset: { name: string; assetCode: string; location?: string };
  createdAt: string;
  updatedAt: string;
};

type MaintenanceRecord = {
  _id: string;
  workPerformed: string;
  inspectionFindings?: string;
  totalCost: number;
  finalCondition?: string;
  completedAt: string;
};

export default function SupervisorIssueDetailPage() {
  const params = useParams();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadIssue = async () => {
    try {
      const res = await apiFetch(`/api/issue/get-issue/${params.id}`);
      setIssue(res.data);
      const maintRes = await apiFetch(
        `/api/maintenance/get-by-issue/${params.id}`,
      );
      if (maintRes.data.length > 0) setMaintenance(maintRes.data[0]);
    } catch (err: any) {
      setError(err.message || "Failed to load issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleApprove = async () => {
    const confirm = await Swal.fire({
      title: "Approve and close this issue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#16a34a",
    });
    if (!confirm.isConfirmed) return;

    setActionLoading(true);
    try {
      await apiFetch(`/api/issue/approve/${issue?._id}`, { method: "PUT" });
      Swal.fire({
        icon: "success",
        title: "Issue approved and closed",
        showConfirmButton: false,
        timer: 1400,
      });
      loadIssue();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Approval Failed", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = async () => {
    const { value: reason } = await Swal.fire({
      title: "Reopen Issue",
      input: "text",
      inputLabel: "Reason (optional)",
      showCancelButton: true,
      confirmButtonText: "Reopen",
    });
    if (reason === undefined) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/issue/reopen/${issue?._id}`, {
        method: "PUT",
        body: { reason },
      });
      Swal.fire({
        icon: "success",
        title: "Issue reopened",
        showConfirmButton: false,
        timer: 1400,
      });
      loadIssue();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Reopen Failed", text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p className="issue-detail-loading">Loading issue...</p>;
  if (error) return <p className="issue-detail-error">{error}</p>;
  if (!issue) return null;

  return (
    <div className="issue-detail-page">
      <Link href="/supervisor/issues" className="issue-back-btn">
        <FaArrowLeft /> Back to Issues
      </Link>

      <div className="issue-detail-header">
        <div>
          <p className="issue-detail-number">{issue.issueNumber}</p>
          <h1 className="issue-detail-title">{issue.title}</h1>
        </div>
        <div className="issue-detail-badges">
          <PriorityBadge priority={issue.priority} />
          <IssueStatusBadge status={issue.status} />
        </div>
      </div>

      <div className="issue-detail-grid">
        <div className="issue-detail-main">
          {/* Overview: the work-order summary block that fills the left column */}
          <div className="issue-detail-card issue-overview-card">
            <h3 className="issue-card-heading-lg">Work Order Overview</h3>
            <div className="issue-overview-grid">
              <div className="issue-overview-item">
                <span className="issue-overview-label">
                  <FaUser /> Reported By
                </span>
                <span className="issue-overview-value">
                  {issue.reporterName || "Anonymous"}
                </span>
                {issue.reporterContact && (
                  <span className="issue-overview-sub">
                    {issue.reporterContact}
                  </span>
                )}
              </div>

              <div className="issue-overview-item">
                <span className="issue-overview-label">
                  <FaLayerGroup /> Priority
                </span>
                <span className="issue-overview-value">
                  <PriorityBadge priority={issue.priority} />
                </span>
              </div>

              <div className="issue-overview-item">
                <span className="issue-overview-label">
                  <FaLayerGroup /> Status
                </span>
                <span className="issue-overview-value">
                  <IssueStatusBadge status={issue.status} />
                </span>
              </div>

              <div className="issue-overview-item">
                <span className="issue-overview-label">
                  <FaLayerGroup /> Category
                </span>
                <span className="issue-overview-value">
                  {issue.category || "—"}
                </span>
              </div>

              <div className="issue-overview-item">
                <span className="issue-overview-label">
                  <FaClock /> Reported Time
                </span>
                <span className="issue-overview-value issue-overview-date">
                  {new Date(issue.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="issue-overview-item">
                <span className="issue-overview-label">
                  <FaHistory /> Last Updated
                </span>
                <span className="issue-overview-value issue-overview-date">
                  {new Date(issue.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="issue-detail-card">
            <h3 className="issue-card-heading-lg">Description</h3>
            <p className="issue-desc">{issue.description}</p>
          </div>

          {issue.aiSuggested && issue.aiSuggestion && (
            <div className="issue-detail-card issue-ai-card">
              <h3>
                AI Triage Suggestion{" "}
                {issue.aiEdited && (
                  <span className="ai-edited-tag">Edited by user</span>
                )}
              </h3>
              {issue.aiSuggestion.possibleCauses &&
                issue.aiSuggestion.possibleCauses.length > 0 && (
                  <>
                    <p className="issue-ai-label">Possible Causes</p>
                    <ul className="issue-ai-list">
                      {issue.aiSuggestion.possibleCauses.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </>
                )}
              {issue.aiSuggestion.initialChecks &&
                issue.aiSuggestion.initialChecks.length > 0 && (
                  <>
                    <p className="issue-ai-label">Initial Checks</p>
                    <ul className="issue-ai-list">
                      {issue.aiSuggestion.initialChecks.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </>
                )}
            </div>
          )}

          {maintenance && (
            <div className="issue-detail-card">
              <h3 className="issue-card-heading-lg">Maintenance Record</h3>

              <p className="issue-desc">
                <strong>Work Performed:</strong> {maintenance.workPerformed}
              </p>
              {maintenance.inspectionFindings && (
                <p className="issue-desc" style={{ marginTop: 10 }}>
                  <strong>Findings:</strong> {maintenance.inspectionFindings}
                </p>
              )}

              <div
                className="issue-overview-grid"
                style={{ marginTop: 18, gridTemplateColumns: "repeat(3, 1fr)" }}
              >
                <div className="issue-overview-item">
                  <span className="issue-overview-label">
                    <FaLayerGroup /> Total Cost
                  </span>
                  <span className="issue-overview-value">
                    Rs. {maintenance.totalCost}
                  </span>
                </div>

                <div className="issue-overview-item">
                  <span className="issue-overview-label">
                    <FaLayerGroup /> Final Condition
                  </span>
                  <span className="issue-overview-value">
                    {maintenance.finalCondition || "—"}
                  </span>
                </div>

                <div className="issue-overview-item">
                  <span className="issue-overview-label">
                    <FaClock /> Completed
                  </span>
                  <span className="issue-overview-value issue-overview-date">
                    {new Date(maintenance.completedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {issue.evidence && issue.evidence.length > 0 && (
            <div className="issue-detail-card">
              <h3>Evidence</h3>
              <div className="issue-evidence-grid">
                {issue.evidence.map((url, i) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={i}
                    className="issue-evidence-item"
                  >
                    <img src={url} alt={`Evidence ${i + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="issue-detail-side">
          <div className="issue-detail-card">
            <h3>Asset</h3>
            <p className="issue-side-label">{issue.asset?.name}</p>
            <p className="issue-side-sub">
              {issue.asset?.assetCode} · {issue.asset?.location}
            </p>
          </div>

          <div className="issue-detail-card">
            <h3>Assigned Technician</h3>
            <p className="issue-side-label">
              {issue.assignedTechnician?.fullName || "Unassigned"}
            </p>
            {issue.assignedTechnician?.email && (
              <p className="issue-side-sub">{issue.assignedTechnician.email}</p>
            )}
          </div>

          {issue.status === "Resolved" && (
            <div className="issue-detail-card">
              <button
                className="issue-action-btn"
                disabled={actionLoading}
                onClick={handleApprove}
              >
                Approve &amp; Close
              </button>
            </div>
          )}

          {(issue.status === "Resolved" || issue.status === "Closed") && (
            <div className="issue-detail-card">
              <button
                className="issue-action-btn issue-reopen-btn"
                disabled={actionLoading}
                onClick={handleReopen}
              >
                Reopen Issue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
