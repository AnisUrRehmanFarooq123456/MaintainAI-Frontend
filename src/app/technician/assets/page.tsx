"use client";

import { useEffect, useState } from "react";
import { FaSearch, FaQrcode } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Asset } from "../../../utils/types";
import StatusBadge from "../../../components/ui/StatusBadge";
import QRModal from "../../../components/ui/QRModal";
import "../../admin/assets/assets.css";

type AssetWithCount = Asset & { openIssuesCount: number };

export default function TechnicianAssetsPage() {
  const [assets, setAssets] = useState<AssetWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qrAsset, setQrAsset] = useState<AssetWithCount | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (search) params.append("search", search);
      const res = await apiFetch(
        `/api/asset/get-all-assets?${params.toString()}`,
      );
      setAssets(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const statuses = [
    "Operational",
    "Issue Reported",
    "Under Inspection",
    "Under Maintenance",
    "Out of Service",
    "Retired",
  ];

  return (
    <div className="assets-page">
      <div className="assets-header">
        <div>
          <h1 className="assets-title">Assets</h1>
          <p className="assets-subtitle">
            All registered assets across the organization
          </p>
        </div>
      </div>

      <div className="assets-filters">
        <form
          className="assets-search"
          onSubmit={(e) => {
            e.preventDefault();
            loadAssets();
          }}
        >
          <FaSearch />
          <input
            type="text"
            placeholder="Search by asset name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="assets-filter-select"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="assets-loading">Loading assets...</p>}
      {error && <p className="assets-error">{error}</p>}

      {!loading && !error && (
        <div className="assets-table-wrap">
          <table className="assets-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Open Issues</th>
                <th>QR</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 && (
                <tr>
                  <td colSpan={6} className="assets-empty">
                    No assets found
                  </td>
                </tr>
              )}
              {assets.map((asset) => (
                <tr key={asset._id}>
                  <td>
                    <p className="assets-name">{asset.name}</p>
                    <p className="assets-code">{asset.assetCode}</p>
                  </td>
                  <td>{asset.category || "—"}</td>
                  <td>{asset.condition}</td>
                  <td>
                    <StatusBadge status={asset.status} />
                  </td>
                  <td>
                    {asset.openIssuesCount > 0 ? (
                      <span className="open-issue-count">
                        {asset.openIssuesCount}
                      </span>
                    ) : (
                      <span className="no-issue-count">0</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="assets-action-btn assets-action-outline"
                      onClick={() => setQrAsset(asset)}
                    >
                      <FaQrcode /> QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {qrAsset && (
        <QRModal
          qrCodeUrl={qrAsset.qrCodeUrl}
          publicUrl={qrAsset.publicUrl}
          assetName={qrAsset.name}
          onClose={() => setQrAsset(null)}
        />
      )}
    </div>
  );
}
