"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./technicians.css";

type TechnicianOverview = {
  _id: string;
  fullName: string;
  email: string;
  specialization: string;
  assignedCount: number;
  completedCount: number;
};

export default function TechnicianTechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/technicians/overview");
        setTechnicians(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="tt-page">
      <h1 className="tt-title">Technicians</h1>
      <p className="tt-subtitle">
        Your fellow technicians and their current workload
      </p>

      {loading && <p className="tt-loading">Loading...</p>}

      {!loading && (
        <div className="tt-grid">
          {technicians.length === 0 && (
            <p className="tt-empty">No technicians registered yet</p>
          )}
          {technicians.map((tech) => (
            <div className="tt-card" key={tech._id}>
              <div className="tt-avatar">{tech.fullName.charAt(0)}</div>
              <p className="tt-name">{tech.fullName}</p>
              <p className="tt-role">{tech.specialization}</p>
              <p className="tt-email">{tech.email}</p>
              <div className="tt-stats">
                <div className="tt-stat">
                  <span className="tt-stat-value tt-assigned">
                    {tech.assignedCount}
                  </span>
                  <span className="tt-stat-label">Assigned</span>
                </div>
                <div className="tt-stat">
                  <span className="tt-stat-value tt-completed">
                    {tech.completedCount}
                  </span>
                  <span className="tt-stat-label">Completed</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
