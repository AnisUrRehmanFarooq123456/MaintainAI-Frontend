"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../utils/api";
import "./team-reports.css";

type TechnicianOverview = {
  _id: string;
  fullName: string;
  specialization: string;
  assignedCount: number;
  completedCount: number;
};

export default function SupervisorReportsPage() {
  const [technicians, setTechnicians] = useState<TechnicianOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/technicians/overview");
        setTechnicians(
          res.data.sort(
            (a: TechnicianOverview, b: TechnicianOverview) =>
              b.completedCount - a.completedCount,
          ),
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalCompleted = technicians.reduce(
    (sum, t) => sum + t.completedCount,
    0,
  );
  const totalAssigned = technicians.reduce(
    (sum, t) => sum + t.assignedCount,
    0,
  );

  return (
    <div className="team-reports-page">
      <h1 className="technicians-title">Team Performance</h1>
      <p className="technicians-subtitle">
        Workload and completion across all technicians
      </p>

      {loading ? (
        <p className="technicians-loading">Loading...</p>
      ) : (
        <>
          <div className="team-reports-summary">
            <div className="team-summary-card">
              <span className="team-summary-value">{totalAssigned}</span>
              <span className="team-summary-label">
                Total Currently Assigned
              </span>
            </div>
            <div className="team-summary-card">
              <span className="team-summary-value">{totalCompleted}</span>
              <span className="team-summary-label">
                Total Completed (All Time)
              </span>
            </div>
          </div>

          <div className="team-reports-list">
            <h3>Ranked by Completed Work</h3>
            {technicians.map((tech, i) => (
              <div className="team-reports-row" key={tech._id}>
                <span className="team-reports-rank">#{i + 1}</span>
                <div className="team-reports-info">
                  <p className="team-reports-name">{tech.fullName}</p>
                  <p className="team-reports-role">{tech.specialization}</p>
                </div>
                <div className="team-reports-bar-wrap">
                  <div
                    className="team-reports-bar"
                    style={{
                      width: `${totalCompleted > 0 ? (tech.completedCount / Math.max(...technicians.map((t) => t.completedCount), 1)) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="team-reports-count">
                  {tech.completedCount} done
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
