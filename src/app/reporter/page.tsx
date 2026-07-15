"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaClipboardList,
  FaExclamationCircle,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { apiFetch } from "../../utils/api";
import StatCard from "../../components/dashboard/StatCard";
import IssueStatusBadge from "../../components/ui/IssueStatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import "./reporter-dashboard.css";

type RecentComplaint = {
  _id: string;
  issueNumber: string;
  title: string;
  priority: string;
  status: string;
  asset: { name: string; assetCode: string };
  createdAt: string;
};

type Stats = {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  recentComplaints: RecentComplaint[];
};
type Profile = { fullName: string; createdAt: string };

export default function ReporterDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          apiFetch("/api/dashboard/reporter-stats"),
          apiFetch("/api/profile/me"),
        ]);
        setStats(statsRes.data);
        setProfile(profileRes.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="rd-loading">Loading dashboard...</p>;
  if (!stats || !profile) return null;

  return (
    <div className="rd-page">
      <h1 className="rd-title">
        Welcome back, {profile.fullName.split(" ")[0]}
      </h1>
      <p className="rd-subtitle">
        <FaCalendarAlt /> Member since{" "}
        {new Date(profile.createdAt).toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="rd-stat-grid">
        <StatCard
          label="Total Complaints Filed"
          value={stats.totalComplaints}
          color="blue"
          icon={<FaClipboardList />}
        />
        <StatCard
          label="Currently Open"
          value={stats.openComplaints}
          color="amber"
          icon={<FaExclamationCircle />}
        />
        <StatCard
          label="Resolved"
          value={stats.resolvedComplaints}
          color="green"
          icon={<FaCheckCircle />}
        />
      </div>

      <div className="rd-actions">
        <Link href="/reporter/assets" className="rd-action-btn">
          Browse Assets & Report Issue
        </Link>
        <Link
          href="/reporter/issues"
          className="rd-action-btn rd-action-outline"
        >
          View All My Complaints
        </Link>
      </div>

      <div className="rd-recent-card">
        <h3>Recent Complaints</h3>
        {stats.recentComplaints.length === 0 && (
          <p className="rd-empty">You haven&apos;t reported any issues yet</p>
        )}
        {stats.recentComplaints.map((c) => (
          <div className="rd-recent-row" key={c._id}>
            <div>
              <p className="rd-recent-title">{c.title}</p>
              <p className="rd-recent-sub">
                {c.issueNumber} · {c.asset?.name}
              </p>
            </div>
            <div className="rd-recent-badges">
              <PriorityBadge priority={c.priority} />
              <IssueStatusBadge status={c.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
