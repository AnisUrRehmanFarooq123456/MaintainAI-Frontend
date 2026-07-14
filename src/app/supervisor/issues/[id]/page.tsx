"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../utils/api";
import IssueStatusBadge from "../../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../../components/ui/PriorityBadge";
import "../../../admin/issues/[id]/issue-detail.css";

type IssueDetail = {
  _id: string;
  issueNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  assignedTechnician?: { fullName: string; email: string } | null;
  asset: { name: string; assetCode: string; location?: string };
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
  const router = useRouter();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadIssue = async () => {
    try {
      const res = await apiFetch(`/api/issue/get-issue/${params.id}`);
      setIssue(res.data);
      const maintRes = await apiFetch(
        `/api/maintenance/get-by-issue/${params.id}`,
      );
      if (maintRes.data.length > 0) setMaintenance(maintRes.data[0]);
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
  if (!issue) return null;

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

          {maintenance && (
            <div className="issue-detail-card">
              <h3>Maintenance Record</h3>
              <p className="issue-desc">
                <strong>Work Performed:</strong> {maintenance.workPerformed}
              </p>
              {maintenance.inspectionFindings && (
                <p className="issue-desc">
                  <strong>Findings:</strong> {maintenance.inspectionFindings}
                </p>
              )}
              <p className="issue-desc">
                <strong>Total Cost:</strong> Rs. {maintenance.totalCost}
              </p>
              <p className="issue-desc">
                <strong>Final Condition:</strong> {maintenance.finalCondition}
              </p>
              <p className="issue-desc">
                <strong>Completed:</strong>{" "}
                {new Date(maintenance.completedAt).toLocaleString()}
              </p>
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
            <h3>Technician</h3>
            <p className="issue-side-label">
              {issue.assignedTechnician?.fullName || "Unassigned"}
            </p>
          </div>

          {issue.status === "Resolved" && (
            <div className="issue-detail-card">
              <button
                className="issue-action-btn"
                disabled={actionLoading}
                onClick={handleApprove}
              >
                Approve & Close
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
