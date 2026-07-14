"use client";

import { useEffect, useState } from "react";
import {
  FaExclamationCircle,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import StatCard from "../../../components/dashboard/StatCard";
import "./maintenance.css";

type AssetSchedule = {
  _id: string;
  name: string;
  assetCode: string;
  location?: string;
  nextServiceDate: string;
};
type CompletedRecord = {
  _id: string;
  asset: { _id: string; name: string; assetCode: string };
  workPerformed: string;
  totalCost: number;
  completedAt: string;
};
type TabKey = "overdue" | "upcoming" | "completed";

export default function TechnicianMaintenancePage() {
  const [overdue, setOverdue] = useState<AssetSchedule[]>([]);
  const [upcoming, setUpcoming] = useState<AssetSchedule[]>([]);
  const [completed, setCompleted] = useState<CompletedRecord[]>([]);
  const [tab, setTab] = useState<TabKey>("overdue");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/maintenance/scheduled-overview");
        setOverdue(res.data.overdue);
        setUpcoming(res.data.upcoming);
        setCompleted(res.data.completed);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const daysOverdue = (date: string) =>
    Math.ceil((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  const daysUntil = (date: string) =>
    Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (loading)
    return <p className="tm-loading">Loading maintenance schedule...</p>;

  return (
    <div className="tm-page">
      <h1 className="tm-title">My Scheduled Maintenance</h1>
      <p className="tm-subtitle">
        Assets assigned to you — overdue, upcoming, and completed work
      </p>

      <div className="tm-stat-grid">
        <StatCard
          label="Tasks Overdue"
          value={overdue.length}
          color="red"
          icon={<FaExclamationCircle />}
        />
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          color="blue"
          icon={<FaCalendarAlt />}
        />
        <StatCard
          label="Tasks Completed"
          value={completed.length}
          color="green"
          icon={<FaCheckCircle />}
        />
      </div>

      <div className="tm-tabs">
        <button
          className={`tm-tab ${tab === "overdue" ? "active" : ""}`}
          onClick={() => setTab("overdue")}
        >
          Overdue
        </button>
        <button
          className={`tm-tab ${tab === "upcoming" ? "active" : ""}`}
          onClick={() => setTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`tm-tab ${tab === "completed" ? "active" : ""}`}
          onClick={() => setTab("completed")}
        >
          Completed
        </button>
      </div>

      {tab === "overdue" && (
        <div className="tm-list">
          {overdue.length === 0 && (
            <p className="tm-empty">Nothing overdue — great work!</p>
          )}
          {overdue.map((a) => (
            <div className="tm-row" key={a._id}>
              <div>
                <p className="tm-row-title">{a.name}</p>
                <p className="tm-row-sub">
                  {a.assetCode} · {a.location || "—"}
                </p>
              </div>
              <span className="tm-tag tm-tag-red">
                {daysOverdue(a.nextServiceDate)} days overdue
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "upcoming" && (
        <div className="tm-list">
          {upcoming.length === 0 && (
            <p className="tm-empty">Nothing scheduled</p>
          )}
          {upcoming.map((a) => (
            <div className="tm-row" key={a._id}>
              <div>
                <p className="tm-row-title">{a.name}</p>
                <p className="tm-row-sub">
                  {a.assetCode} · {a.location || "—"}
                </p>
              </div>
              <span className="tm-tag tm-tag-blue">
                In {daysUntil(a.nextServiceDate)} days
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "completed" && (
        <div className="tm-list">
          {completed.length === 0 && (
            <p className="tm-empty">No completed maintenance yet</p>
          )}
          {completed.map((r) => (
            <div className="tm-row" key={r._id}>
              <div>
                <p className="tm-row-title">{r.asset?.name}</p>
                <p className="tm-row-sub">{r.workPerformed}</p>
              </div>
              <span className="tm-tag tm-tag-green">Rs. {r.totalCost}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
