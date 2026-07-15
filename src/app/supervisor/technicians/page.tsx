"use client";

import { useEffect, useState } from "react";
import { FaTools, FaEnvelope, FaTasks } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import AssignIssueModal from "../../../components/issues/AssignIssueModal";
import "./technicians.css";

type TechnicianOverview = {
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  assignedCount: number;
  completedCount: number;
};

export default function SupervisorTechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<TechnicianOverview | null>(
    null,
  );

  const loadTechnicians = async () => {
    try {
      const res = await apiFetch("/api/technicians/overview");
      setTechnicians(
        res.data.sort(
          (a: TechnicianOverview, b: TechnicianOverview) =>
            a.assignedCount - b.assignedCount,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  return (
    <div className="st-page">
      <h1 className="st-title">Technicians</h1>
      <p className="st-subtitle">
        Review workload and assign tasks to your team
      </p>

      {loading && <p className="st-loading">Loading technicians...</p>}

      {!loading && (
        <div className="st-grid">
          {technicians.length === 0 && (
            <p className="st-empty">No technicians registered yet</p>
          )}
          {technicians.map((tech) => (
            <div className="st-card" key={tech._id}>
              <div className="st-card-top">
                <div className="st-avatar">{tech.fullName.charAt(0)}</div>
                <div className="st-card-info">
                  <p className="st-name">{tech.fullName}</p>
                  <p className="st-role">
                    <FaTools /> {tech.specialization}
                  </p>
                  <p className="st-email">
                    <FaEnvelope /> {tech.email}
                  </p>
                </div>
              </div>

              <div className="st-stats">
                <div className="st-stat">
                  <span className="st-stat-value st-assigned">
                    {tech.assignedCount}
                  </span>
                  <span className="st-stat-label">Assigned</span>
                </div>
                <div className="st-stat-divider" />
                <div className="st-stat">
                  <span className="st-stat-value st-completed">
                    {tech.completedCount}
                  </span>
                  <span className="st-stat-label">Completed</span>
                </div>
              </div>

              <div className="st-workload-bar">
                <div
                  className={`st-workload-fill ${tech.assignedCount >= 5 ? "st-workload-high" : tech.assignedCount >= 2 ? "st-workload-mid" : "st-workload-low"}`}
                  style={{
                    width: `${Math.min(tech.assignedCount * 20, 100)}%`,
                  }}
                ></div>
              </div>

              <button
                className="st-assign-btn"
                onClick={() => setAssignTarget(tech)}
              >
                <FaTasks /> Assign Task
              </button>
            </div>
          ))}
        </div>
      )}

      {assignTarget && (
        <AssignIssueModal
          technicianId={assignTarget._id}
          technicianName={assignTarget.fullName}
          onClose={() => setAssignTarget(null)}
          onAssigned={loadTechnicians}
        />
      )}
    </div>
  );
}
