"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import { apiFetch } from "../../../../utils/api";
import IssueStatusBadge from "../../../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../../../components/ui/PriorityBadge";
import MaintenanceForm from "../../../../components/maintenance/MaintenanceForm";
import "./tech-issue-detail.css";

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
  priority: string;
  status: string;
  reporterName?: string;
  reporterContact?: string;
  evidence: string[];
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

export default function TechnicianIssueDetailPage() {
  const params = useParams();
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [maintenanceRecord, setMaintenanceRecord] =
    useState<MaintenanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadIssue = async () => {
    try {
      const res = await apiFetch(`/api/issue/get-issue/${params.id}`);
      setIssue(res.data);

      if (["Resolved", "Closed"].includes(res.data.status)) {
        const maintRes = await apiFetch(
          `/api/maintenance/get-by-issue/${params.id}`,
        );
        if (maintRes.data.length > 0) setMaintenanceRecord(maintRes.data[0]);
      }
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

  const handleStartInspection = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/issue/update-status/${issue?._id}`, {
        method: "PUT",
        body: { status: "Inspection Started" },
      });
      Swal.fire({
        icon: "success",
        title: "Inspection started",
        showConfirmButton: false,
        timer: 1300,
      });
      loadIssue();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to update",
        text: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveToWaitingForParts = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/issue/update-status/${issue?._id}`, {
        method: "PUT",
        body: { status: "Waiting for Parts" },
      });
      Swal.fire({
        icon: "success",
        title: "Marked as waiting for parts",
        showConfirmButton: false,
        timer: 1300,
      });
      loadIssue();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to update",
        text: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="ti-page">
        <p className="ti-loading">Loading issue...</p>
      </div>
    );
  if (error)
    return (
      <div className="ti-page">
        <p className="ti-error">{error}</p>
      </div>
    );
  if (!issue) return null;

  const canStartInspection = issue.status === "Assigned";
  const canResolve = [
    "Inspection Started",
    "Maintenance In Progress",
    "Waiting for Parts",
  ].includes(issue.status);
  const canMarkWaitingForParts =
    issue.status === "Inspection Started" ||
    issue.status === "Maintenance In Progress";
  const isDone = ["Resolved", "Closed"].includes(issue.status);

  return (
    <div className="ti-page">
      <Link href="/technician/issues" className="ti-back-btn">
        <FaArrowLeft /> Back to Issues
      </Link>

      <div className="ti-header">
        <div>
          <p className="ti-number">{issue.issueNumber}</p>
          <h1 className="ti-title">{issue.title}</h1>
        </div>
        <div className="ti-badges">
          <PriorityBadge priority={issue.priority} />
          <IssueStatusBadge status={issue.status} />
        </div>
      </div>

      <div className="ti-grid">
        <div className="ti-main">
          <div className="ti-card">
            <h3>Description</h3>
            <p>{issue.description}</p>
          </div>

          {issue.evidence && issue.evidence.length > 0 && (
            <div className="ti-card">
              <h3>Evidence</h3>
              <div className="ti-evidence-grid">
                {issue.evidence.map((url, i) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={i}
                    className="ti-evidence-item"
                  >
                    <img src={url} alt={`Evidence ${i + 1}`} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {canResolve && <MaintenanceForm issueId={issue._id} />}

          {isDone && maintenanceRecord && (
            <div className="ti-card ti-resolved-card">
              <h3>Maintenance Record</h3>
              <p>
                <strong>Work Performed:</strong>{" "}
                {maintenanceRecord.workPerformed}
              </p>
              {maintenanceRecord.inspectionFindings && (
                <p>
                  <strong>Findings:</strong>{" "}
                  {maintenanceRecord.inspectionFindings}
                </p>
              )}
              <p>
                <strong>Total Cost:</strong> Rs. {maintenanceRecord.totalCost}
              </p>
              <p>
                <strong>Final Condition:</strong>{" "}
                {maintenanceRecord.finalCondition}
              </p>
              <p>
                <strong>Completed:</strong>{" "}
                {new Date(maintenanceRecord.completedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="ti-side">
          <div className="ti-card">
            <h3>Asset</h3>
            <p className="ti-side-label">{issue.asset?.name}</p>
            <p className="ti-side-sub">
              {issue.asset?.assetCode} · {issue.asset?.location}
            </p>
          </div>

          {issue.reporterName && (
            <div className="ti-card">
              <h3>Reporter</h3>
              <p className="ti-side-label">{issue.reporterName}</p>
              {issue.reporterContact && (
                <p className="ti-side-sub">{issue.reporterContact}</p>
              )}
            </div>
          )}

          {canStartInspection && (
            <button
              className="ti-action-btn ti-start-btn"
              disabled={actionLoading}
              onClick={handleStartInspection}
            >
              Start Inspection
            </button>
          )}

          {canMarkWaitingForParts && (
            <button
              className="ti-action-btn ti-waiting-btn"
              disabled={actionLoading}
              onClick={handleMoveToWaitingForParts}
            >
              Mark as Waiting for Parts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
