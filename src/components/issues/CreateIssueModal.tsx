"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "../../utils/api";
import { getUser } from "../../utils/auth";
import "./CreateIssueModal.css";

type AssetOption = {
  _id: string;
  name: string;
  assetCode: string;
  status: string;
};

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function CreateIssueModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const user = getUser();

  const [assetCode, setAssetCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const res = await apiFetch("/api/asset/get-all-assets");
        setAssets(res.data.filter((a: AssetOption) => a.status !== "Retired"));
      } finally {
        setAssetsLoading(false);
      }
    };
    loadAssets();
  }, []);

  const validate = () => {
    if (!assetCode) {
      Swal.fire({
        icon: "error",
        title: "Select an asset",
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }
    if (title.trim().length < 3) {
      Swal.fire({
        icon: "error",
        title: "Title must be at least 3 characters",
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }
    if (description.trim().length < 5) {
      Swal.fire({
        icon: "error",
        title: "Description must be at least 5 characters",
        showConfirmButton: false,
        timer: 1500,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await apiFetch("/api/issue/report-issue", {
        method: "POST",
        body: {
          assetCode,
          title: title.trim(),
          description: description.trim(),
          category: category || undefined,
          priority,
          reporterName: user?.fullName
            ? `${user.fullName} (${user.role})`
            : undefined,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Issue created successfully",
        showConfirmButton: false,
        timer: 1400,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Failed to create issue",
        text: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cim-overlay" onClick={onClose}>
      <div className="cim-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create New Issue</h3>
        <p className="cim-subtitle">Log an issue directly against an asset</p>

        <form onSubmit={handleSubmit} className="cim-form">
          <div className="cim-field">
            <label>Asset</label>
            {assetsLoading ? (
              <p className="cim-loading-text">Loading assets...</p>
            ) : (
              <select
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
              >
                <option value="">Select an asset</option>
                {assets.map((a) => (
                  <option key={a._id} value={a.assetCode}>
                    {a.name} ({a.assetCode})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="cim-field">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AC not cooling properly"
            />
          </div>

          <div className="cim-field">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the issue in detail"
            />
          </div>

          <div className="cim-row">
            <div className="cim-field">
              <label>Category (optional)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Electrical"
              />
            </div>
            <div className="cim-field">
              <label>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="cim-actions">
            <button type="button" className="cim-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cim-submit-btn"
            >
              {submitting ? "Creating..." : "Create Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
