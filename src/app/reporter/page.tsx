"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaClipboardList,
  FaExclamationCircle,
  FaCheckCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaHashtag,
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
  description?: string;
  priority: string;
  status: string;
  asset: { name: string; assetCode: string; location?: string };
  createdAt: string;
};

type Stats = {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  recentComplaints: RecentComplaint[];
};
type Profile = { fullName: string; createdAt: string };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
            <div className="rd-recent-main">
              <div className="rd-recent-top">
                <p className="rd-recent-title">{c.title}</p>
                <div className="rd-recent-badges">
                  <PriorityBadge priority={c.priority} />
                  <IssueStatusBadge status={c.status} />
                </div>
              </div>

              {c.description && (
                <p className="rd-recent-desc">{c.description}</p>
              )}

              <div className="rd-recent-meta">
                <span className="rd-recent-meta-item">
                  <FaHashtag /> {c.issueNumber}
                </span>
                <span className="rd-recent-meta-item">
                  {c.asset?.name}
                  {c.asset?.assetCode ? ` (${c.asset.assetCode})` : ""}
                </span>
                {c.asset?.location && (
                  <span className="rd-recent-meta-item">
                    <FaMapMarkerAlt /> {c.asset.location}
                  </span>
                )}
                <span className="rd-recent-meta-item rd-recent-date">
                  <FaCalendarAlt /> {formatDate(c.createdAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
