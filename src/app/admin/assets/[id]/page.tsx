"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../../utils/api";
import StatusBadge from "../../../../components/ui/StatusBadge";
import "./asset-detail.css";

type AssetDetail = {
  _id: string;
  name: string;
  assetCode: string;
  category?: string;
  location?: string;
  condition: string;
  status: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  qrCodeUrl?: string;
  publicUrl?: string;
  openIssuesCount: number;
  assignedTechnician?: { fullName: string; email: string } | null;
  history: {
    _id: string;
    action: string;
    description: string;
    createdAt: string;
    actor?: { fullName: string };
  }[];
};

export default function AssetDetailPage() {
  const params = useParams();
  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendation, setRecommendation] = useState<{
    hasPattern: boolean;
    recommendation: string;
  } | null>(null);
  const [recLoading, setRecLoading] = useState(false);

  const handleGetRecommendation = async () => {
    setRecLoading(true);
    try {
      const res = await apiFetch(`/api/triage/preventive/${params.id}`);
      setRecommendation(res.data);
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`/api/asset/get-asset/${params.id}`);
        setAsset(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to load asset");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) return <p className="asset-detail-loading">Loading asset...</p>;
  if (error) return <p className="asset-detail-error">{error}</p>;
  if (!asset) return null;

  return (
    <div className="asset-detail-page">
      <div className="asset-detail-header">
        <div>
          <h1 className="asset-detail-title">{asset.name}</h1>
          <p className="asset-detail-code">{asset.assetCode}</p>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <div className="asset-detail-grid">
        <div className="asset-detail-main">
          <div className="asset-detail-card">
            <h3>Asset Information</h3>
            <div className="asset-info-grid">
              <div>
                <span>Category</span>
                <p>{asset.category || "—"}</p>
              </div>
              <div>
                <span>Location</span>
                <p>{asset.location || "—"}</p>
              </div>
              <div>
                <span>Condition</span>
                <p>{asset.condition}</p>
              </div>
              <div>
                <span>Open Issues</span>
                <p>{asset.openIssuesCount}</p>
              </div>
              <div>
                <span>Last Service</span>
                <p>
                  {asset.lastServiceDate
                    ? new Date(asset.lastServiceDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <span>Next Service</span>
                <p>
                  {asset.nextServiceDate
                    ? new Date(asset.nextServiceDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <span>Assigned Technician</span>
                <p>{asset.assignedTechnician?.fullName || "Unassigned"}</p>
              </div>
            </div>
          </div>

          <div className="asset-detail-card">
            <h3>Asset History</h3>
            {asset.history.length === 0 && (
              <p className="asset-history-empty">No history recorded yet</p>
            )}
            <div className="asset-history-timeline">
              {asset.history.map((h) => (
                <div className="asset-history-item" key={h._id}>
                  <div className="asset-history-dot"></div>
                  <div>
                    <p className="asset-history-action">{h.action}</p>
                    <p className="asset-history-desc">{h.description}</p>
                    <p className="asset-history-meta">
                      {h.actor?.fullName ? `${h.actor.fullName} · ` : ""}
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="asset-detail-side">
          <div className="asset-detail-card asset-qr-card">
            <h3>QR Code</h3>
            {asset.qrCodeUrl ? (
              <img
                src={asset.qrCodeUrl}
                alt="Asset QR"
                className="asset-qr-image"
              />
            ) : (
              <p>No QR code generated</p>
            )}
            {asset.publicUrl && (
              <a
                href={asset.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="asset-qr-link"
              >
                Report an Issue
              </a>
            )}
          </div>
          <div className="asset-detail-card">
            <h3>Preventive Recommendation</h3>
            {!recommendation && (
              <button
                className="issue-action-btn"
                onClick={handleGetRecommendation}
                disabled={recLoading}
              >
                {recLoading ? "Analyzing..." : "Generate AI Recommendation"}
              </button>
            )}
            {recommendation && (
              <p className="issue-desc">{recommendation.recommendation}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
