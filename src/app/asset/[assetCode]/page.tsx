"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../utils/api";
import StatusBadge from "../../../components/ui/StatusBadge";
import "./public-asset.css";

type PublicAsset = {
  name: string;
  assetCode: string;
  category?: string;
  location?: string;
  condition: string;
  status: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  recentActivity: { action: string; description: string; createdAt: string }[];
};

export default function PublicAssetPage() {
  const params = useParams();
  const [asset, setAsset] = useState<PublicAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`/api/asset/public/${params.assetCode}`, {
          auth: false,
        });
        setAsset(res.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.assetCode]);

  if (loading)
    return <div className="public-asset-loading">Loading asset...</div>;

  if (notFound || !asset) {
    return (
      <div className="public-asset-notfound">
        <h1>Asset Not Found</h1>
        <p>
          This QR code doesn&apos;t match any registered asset. Please check
          with your facility team.
        </p>
      </div>
    );
  }

  const isRetired = asset.status === "Retired";

  return (
    <main className="public-asset-page">
      <div className="public-asset-card">
        <div className="public-asset-header">
          <h1>{asset.name}</h1>
          <p className="public-asset-code">{asset.assetCode}</p>
          <StatusBadge status={asset.status} />
        </div>

        <div className="public-asset-info-grid">
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
            <span>Last Service</span>
            <p>
              {asset.lastServiceDate
                ? new Date(asset.lastServiceDate).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>

        {isRetired ? (
          <div className="public-asset-retired-notice">
            This asset has been retired and is no longer in service. Issues
            cannot be reported against it.
          </div>
        ) : (
          <Link
            href={`/asset/${asset.assetCode}/report`}
            className="public-asset-report-btn"
          >
            Report an Issue
          </Link>
        )}

        {asset.recentActivity && asset.recentActivity.length > 0 && (
          <div className="public-asset-activity">
            <h3>Recent Activity</h3>
            {asset.recentActivity.map((a, i) => (
              <div className="public-asset-activity-item" key={i}>
                <p className="public-asset-activity-action">{a.action}</p>
                <p className="public-asset-activity-date">
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
