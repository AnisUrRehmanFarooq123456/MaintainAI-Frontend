"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTools,
  FaClipboardList,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import "./profile.css";

type Profile = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  specialization?: string;
  createdAt: string;
};
type Stats = { totalAssigned: number; inProgress: number };

export default function TechnicianProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialization, setSpecialization] = useState("");

  const loadProfile = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        apiFetch("/api/profile/me"),
        apiFetch("/api/dashboard/technician-stats"),
      ]);
      setProfile(profileRes.data);
      setFullName(profileRes.data.fullName);
      setPhoneNumber(profileRes.data.phoneNumber || "");
      setSpecialization(profileRes.data.specialization || "");
      setStats({
        totalAssigned: statsRes.data.totalAssigned,
        inProgress: statsRes.data.inProgress,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleCancel = () => {
    if (!profile) return;
    setFullName(profile.fullName);
    setPhoneNumber(profile.phoneNumber || "");
    setSpecialization(profile.specialization || "");
    setEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/profile/update", {
        method: "PUT",
        body: { fullName, phoneNumber, specialization },
      });
      Swal.fire({
        icon: "success",
        title: "Profile updated",
        showConfirmButton: false,
        timer: 1400,
      });
      setEditing(false);
      loadProfile();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="tp-loading">Loading profile...</p>;
  if (!profile) return null;

  return (
    <div className="tp-page">
      <div className="tp-banner">
        <div className="tp-banner-glow"></div>
        <div className="tp-banner-content">
          <div className="tp-avatar">{profile.fullName.charAt(0)}</div>
          <h1 className="tp-name">{profile.fullName}</h1>
          <p className="tp-role">
            <FaTools /> {profile.specialization || "Technician"}
          </p>
          <p className="tp-since">
            <FaCalendarAlt /> Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {stats && (
        <div className="tp-stats-row">
          <div className="tp-stat-pill">
            <div className="tp-stat-icon tp-stat-icon-blue">
              <FaClipboardList />
            </div>
            <div>
              <p className="tp-stat-value">{stats.totalAssigned}</p>
              <p className="tp-stat-label">Currently Assigned</p>
            </div>
          </div>
          <div className="tp-stat-pill">
            <div className="tp-stat-icon tp-stat-icon-teal">
              <FaCheckCircle />
            </div>
            <div>
              <p className="tp-stat-value">{stats.inProgress}</p>
              <p className="tp-stat-label">In Progress</p>
            </div>
          </div>
        </div>
      )}

      <div className="tp-form-card">
        <div className="tp-form-header">
          <h3>Account Details</h3>
          {!editing && (
            <button className="tp-edit-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>

        {!editing ? (
          <div className="tp-view-grid">
            <div className="tp-view-item">
              <span>
                <FaUser /> Full Name
              </span>
              <p>{profile.fullName}</p>
            </div>
            <div className="tp-view-item">
              <span>
                <FaEnvelope /> Email
              </span>
              <p>{profile.email}</p>
            </div>
            <div className="tp-view-item">
              <span>
                <FaPhone /> Phone Number
              </span>
              <p>{profile.phoneNumber || "Not set"}</p>
            </div>
            <div className="tp-view-item">
              <span>
                <FaTools /> Specialization
              </span>
              <p>{profile.specialization || "Not set"}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="tp-edit-form">
            <div className="tp-field">
              <label>
                <FaUser /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="tp-field">
              <label>
                <FaEnvelope /> Email
              </label>
              <input type="text" value={profile.email} disabled />
              <p className="tp-hint">Email cannot be changed</p>
            </div>

            <div className="tp-row">
              <div className="tp-field">
                <label>
                  <FaPhone /> Phone Number
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="03001234567"
                />
              </div>
              <div className="tp-field">
                <label>
                  <FaTools /> Specialization
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Mechanical Technician"
                />
              </div>
            </div>

            <div className="tp-form-actions">
              <button
                type="button"
                className="tp-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="tp-save-btn">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
