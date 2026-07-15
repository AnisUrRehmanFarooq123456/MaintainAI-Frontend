"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaUser, FaEnvelope, FaPhone, FaUserTag } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import "../../technician/profile/profile.css";

type Profile = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
};

export default function ReporterProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const loadProfile = async () => {
    try {
      const res = await apiFetch("/api/profile/me");
      setProfile(res.data);
      setFullName(res.data.fullName);
      setPhoneNumber(res.data.phoneNumber || "");
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
    setEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/api/profile/update", {
        method: "PUT",
        body: { fullName, phoneNumber },
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
            <FaUserTag /> Public User
          </p>
          <p className="tp-since">
            Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

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
