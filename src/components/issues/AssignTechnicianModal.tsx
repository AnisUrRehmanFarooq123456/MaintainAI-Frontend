"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "../../utils/api";
import "./AssignTechnicianModal.css";

type Technician = { _id: string; fullName: string; email: string };

export default function AssignTechnicianModal({
  issueId,
  onClose,
  onAssigned,
}: {
  issueId: string;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/getAllUsers?role=technician");
        setTechnicians(res.data);
      } catch {
        Swal.fire({ icon: "error", title: "Failed to load technicians" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAssign = async () => {
    if (!selected) {
      Swal.fire({
        icon: "error",
        title: "Select a technician",
        showConfirmButton: false,
        timer: 1400,
      });
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/api/issue/assign/${issueId}`, {
        method: "PUT",
        body: { technicianId: selected },
      });
      Swal.fire({
        icon: "success",
        title: "Technician assigned",
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
      setSubmitting(false);
    }
  };

  return (
    <div className="assign-modal-overlay" onClick={onClose}>
      <div className="assign-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Assign Technician</h3>
        {loading ? (
          <p className="assign-modal-loading">Loading technicians...</p>
        ) : (
          <select
            className="assign-modal-select"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select a technician</option>
            {technicians.map((t) => (
              <option key={t._id} value={t._id}>
                {t.fullName} ({t.email})
              </option>
            ))}
          </select>
        )}
        <div className="assign-modal-actions">
          <button className="assign-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="assign-modal-confirm"
            onClick={handleAssign}
            disabled={submitting}
          >
            {submitting ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
