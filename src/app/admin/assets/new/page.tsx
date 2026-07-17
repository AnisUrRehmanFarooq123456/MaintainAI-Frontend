"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../../utils/api";
import "./new-asset.css";

export default function NewAssetPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    assetCode: "",
    category: "",
    location: "",
    condition: "Good",
    nextServiceDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (formData.name.trim().length < 3) {
      Swal.fire({
        icon: "error",
        title: "Asset name must be at least 3 characters",
        showConfirmButton: false,
        timer: 1600,
      });
      return false;
    }
    if (!formData.assetCode.trim()) {
      Swal.fire({
        icon: "error",
        title: "Asset code is required",
        showConfirmButton: false,
        timer: 1600,
      });
      return false;
    }
    return true;
  };
  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Cancel Registration?",
      text: "Any unsaved changes will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "Continue Editing",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await Swal.fire({
        icon: "success",
        title: "Registration Cancelled",
        showConfirmButton: false,
        timer: 1000,
      });

      router.push("/admin/assets");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/asset/add-asset", {
        method: "POST",
        body: formData,
      });
      Swal.fire({
        icon: "success",
        title: "Asset registered successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      setTimeout(() => router.push(`/admin/assets/${res.data._id}`), 1500);
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-asset-page">
      <h1 className="new-asset-title">Register New Asset</h1>
      <p className="new-asset-subtitle">
        Create a digital identity and QR code for a physical asset
      </p>

      <form onSubmit={handleSubmit} className="new-asset-form">
        <div className="new-asset-group">
          <label>Asset Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Classroom Projector 01"
          />
        </div>

        <div className="new-asset-group">
          <label>Asset Code</label>
          <input
            type="text"
            name="assetCode"
            value={formData.assetCode}
            onChange={handleChange}
            placeholder="e.g. PROJ-001"
          />
        </div>

        <div className="new-asset-row">
          <div className="new-asset-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. Electronics"
            />
          </div>
          <div className="new-asset-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Room 204"
            />
          </div>
        </div>

        <div className="new-asset-row">
          <div className="new-asset-group">
            <label>Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
            >
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Unsafe">Unsafe</option>
            </select>
          </div>
          <div className="new-asset-group">
            <label>Next Service Date</label>
            <input
              type="date"
              name="nextServiceDate"
              value={formData.nextServiceDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="cancel-submit">
          <button
            type="button"
            disabled={loading}
            className="asset-btn"
            onClick={handleCancel}
          >
            {loading ? "Please wait..." : "Cancel"}
          </button>

          <button type="submit" disabled={loading} className="asset-btn">
            {loading ? "Registering..." : "Register Asset"}
          </button>
        </div>
      </form>
    </div>
  );
}
