"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../utils/api";
import IssueStatusBadge from "../../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../../components/ui/PriorityBadge";
import AssignTechnicianModal from "../../../../components/issues/AssignTechnicianModal";
import "./issue-detail.css";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  Assigned: ["Inspection Started"],
  "Inspection Started": ["Maintenance In Progress", "Waiting for Parts"],
  "Maintenance In Progress": ["Waiting for Parts"],
  "Waiting for Parts": ["Maintenance In Progress"],
};

type IssueDetail = {
  _id: string;
  issueNumber: string;
  title: string;
  description: string;
  category?: string;
  priority: string;
  status: string;
  isCritical: boolean;
  reporterName?: string;
  reporterContact?: string;
  evidence: string[];
  aiSuggestion?: {
    title?: string;
    category?: string;
    priority?: string;
    possibleCauses?: string[];
    initialChecks?: string[];
  };
  aiSuggested: boolean;
  aiEdited: boolean;
  assignedTechnician?: { fullName: string; email: string } | null;
  asset: { name: string; assetCode: string; location?: string; status: string };
  createdAt: string;
  updatedAt: string;
};

export default function AdminIssueDetailPage() {
  const params = useParams();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadIssue = async () => {
    try {
      const res = await apiFetch(`/api/issue/get-issue/${params.id}`);
      setIssue(res.data);
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

  const handleStatusChange = async (newStatus: string) => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/issue/update-status/${issue?._id}`, {
        method: "PUT",
        body: { status: newStatus },
      });
      Swal.fire({
        icon: "success",
        title: `Status updated to ${newStatus}`,
        showConfirmButton: false,
        timer: 1400,
      });
      loadIssue();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
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

  const nextStatuses = ALLOWED_TRANSITIONS[issue.status] || [];

  return (
    <div className="issue-detail-page">
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
          <div className="issue-detail-card">
            <h3>Description</h3>
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
            <h3>Reporter</h3>
            <p className="issue-side-label">
              {issue.reporterName || "Anonymous"}
            </p>
            {issue.reporterContact && (
              <p className="issue-side-sub">{issue.reporterContact}</p>
            )}
          </div>

          <div className="issue-detail-card">
            <h3>Assigned Technician</h3>
            <p className="issue-side-label">
              {issue.assignedTechnician?.fullName || "Unassigned"}
            </p>
            {issue.assignedTechnician?.email && (
              <p className="issue-side-sub">{issue.assignedTechnician.email}</p>
            )}
            <button
              className="issue-action-btn"
              onClick={() => setShowAssignModal(true)}
            >
              {issue.assignedTechnician
                ? "Reassign Technician"
                : "Assign Technician"}
            </button>
          </div>

          {nextStatuses.length > 0 && (
            <div className="issue-detail-card">
              <h3>Move To</h3>
              <div className="issue-status-actions">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    className="issue-action-btn issue-action-outline"
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
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

      {showAssignModal && (
        <AssignTechnicianModal
          issueId={issue._id}
          onClose={() => setShowAssignModal(false)}
          onAssigned={loadIssue}
        />
      )}
    </div>
  );
}
