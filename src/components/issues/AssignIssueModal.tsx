"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "../../utils/api";
import PriorityBadge from "../ui/PriorityBadge";
import "./AssignIssueModal.css";

type UnassignedIssue = {
  _id: string;
  issueNumber: string;
  title: string;
  priority: string;
  asset: { name: string; assetCode: string };
};

export default function AssignIssueModal({
  technicianId,
  technicianName,
  onClose,
  onAssigned,
}: {
  technicianId: string;
  technicianName: string;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [issues, setIssues] = useState<UnassignedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/issue/get-all-issues?unassigned=true");
        setIssues(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAssign = async (issueId: string) => {
    setAssigningId(issueId);
    try {
      await apiFetch(`/api/issue/assign/${issueId}`, {
        method: "PUT",
        body: { technicianId },
      });
      Swal.fire({
        icon: "success",
        title: `Assigned to ${technicianName}`,
        showConfirmButton: false,
        timer: 1400,
      });
      onAssigned();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text: err.message,
      });
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="aim-overlay" onClick={onClose}>
      <div className="aim-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Assign Task to {technicianName}</h3>
        <p className="aim-subtitle">Choose an unassigned issue to give them</p>

        {loading && <p className="aim-loading">Loading unassigned issues...</p>}

        {!loading && issues.length === 0 && (
          <p className="aim-empty">
            No unassigned issues right now — everything is already assigned.
          </p>
        )}

        {!loading && issues.length > 0 && (
          <div className="aim-list">
            {issues.map((issue) => (
              <div className="aim-row" key={issue._id}>
                <div className="aim-row-info">
                  <p className="aim-row-title">{issue.title}</p>
                  <p className="aim-row-sub">
                    {issue.issueNumber} · {issue.asset?.name}
                  </p>
                </div>
                <PriorityBadge priority={issue.priority} />
                <button
                  className="aim-assign-btn"
                  disabled={assigningId === issue._id}
                  onClick={() => handleAssign(issue._id)}
                >
                  {assigningId === issue._id ? "Assigning..." : "Assign"}
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="aim-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
