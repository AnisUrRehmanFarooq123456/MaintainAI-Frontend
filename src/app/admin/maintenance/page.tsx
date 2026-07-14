"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../../utils/api";
import "./maintenance.css";

type AssetSchedule = {
  _id: string;
  name: string;
  assetCode: string;
  location?: string;
  nextServiceDate: string;
  status: string;
};
type CompletedRecord = {
  _id: string;
  asset: { _id: string; name: string; assetCode: string };
  technician: { fullName: string };
  workPerformed: string;
  totalCost: number;
  finalCondition?: string;
  completedAt: string;
};

type TabKey = "overdue" | "upcoming" | "completed";

export default function ScheduledMaintenancePage() {
  const [overdue, setOverdue] = useState<AssetSchedule[]>([]);
  const [upcoming, setUpcoming] = useState<AssetSchedule[]>([]);
  const [completed, setCompleted] = useState<CompletedRecord[]>([]);
  const [tab, setTab] = useState<TabKey>("overdue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/maintenance/scheduled-overview");
        setOverdue(res.data.overdue);
        setUpcoming(res.data.upcoming);
        setCompleted(res.data.completed);
      } catch (err: any) {
        setError(err.message || "Failed to load scheduled maintenance");
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

  return (
    <div className="maintenance-page">
      <h1 className="maintenance-title">Scheduled Maintenance</h1>
      <p className="maintenance-subtitle">
        Overdue services, upcoming schedule, and completed work
      </p>

      <div className="maintenance-tabs">
        <button
          className={`maintenance-tab ${tab === "overdue" ? "active" : ""}`}
          onClick={() => setTab("overdue")}
        >
          Overdue{" "}
          <span className="tab-count tab-count-red">{overdue.length}</span>
        </button>
        <button
          className={`maintenance-tab ${tab === "upcoming" ? "active" : ""}`}
          onClick={() => setTab("upcoming")}
        >
          Upcoming{" "}
          <span className="tab-count tab-count-blue">{upcoming.length}</span>
        </button>
        <button
          className={`maintenance-tab ${tab === "completed" ? "active" : ""}`}
          onClick={() => setTab("completed")}
        >
          Completed{" "}
          <span className="tab-count tab-count-green">{completed.length}</span>
        </button>
      </div>

      {loading && <p className="maintenance-loading">Loading...</p>}
      {error && <p className="maintenance-error">{error}</p>}

      {!loading && !error && tab === "overdue" && (
        <div className="maintenance-list">
          {overdue.length === 0 && (
            <p className="maintenance-empty">Nothing overdue — good job!</p>
          )}
          {overdue.map((asset) => (
            <Link
              href={`/admin/assets/${asset._id}`}
              key={asset._id}
              className="maintenance-row"
            >
              <div>
                <p className="maintenance-row-title">{asset.name}</p>
                <p className="maintenance-row-sub">
                  {asset.assetCode} · {asset.location || "—"}
                </p>
              </div>
              <span className="overdue-tag">
                {daysOverdue(asset.nextServiceDate)} days overdue
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && tab === "upcoming" && (
        <div className="maintenance-list">
          {upcoming.length === 0 && (
            <p className="maintenance-empty">
              No upcoming maintenance scheduled
            </p>
          )}
          {upcoming.map((asset) => (
            <Link
              href={`/admin/assets/${asset._id}`}
              key={asset._id}
              className="maintenance-row"
            >
              <div>
                <p className="maintenance-row-title">{asset.name}</p>
                <p className="maintenance-row-sub">
                  {asset.assetCode} · {asset.location || "—"}
                </p>
              </div>
              <span className="upcoming-tag">
                In {daysUntil(asset.nextServiceDate)} days ·{" "}
                {new Date(asset.nextServiceDate).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && tab === "completed" && (
        <div className="maintenance-list">
          {completed.length === 0 && (
            <p className="maintenance-empty">No completed maintenance yet</p>
          )}
          {completed.map((record) => (
            <Link
              href={`/admin/assets/${record.asset?._id}`}
              key={record._id}
              className="maintenance-row"
            >
              <div>
                <p className="maintenance-row-title">{record.asset?.name}</p>
                <p className="maintenance-row-sub">{record.workPerformed}</p>
                <p className="maintenance-row-meta">
                  By {record.technician?.fullName} ·{" "}
                  {new Date(record.completedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="completed-tag">Rs. {record.totalCost}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
