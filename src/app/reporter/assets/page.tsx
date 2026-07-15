"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Asset } from "../../../utils/types";
import StatusBadge from "../../../components/ui/StatusBadge";
import "./reporter-assets.css";

export default function ReporterAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/asset/get-all-assets");
        setAssets(res.data.filter((a: Asset) => a.status !== "Retired"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="ra-page">
      <h1 className="ra-title">All Assets</h1>
      <p className="ra-subtitle">Browse registered assets and report a problem</p>

      <div className="ra-search">
        <FaSearch />
        <input type="text" placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading && <p className="ra-loading">Loading assets...</p>}

      {!loading && (
        <div className="ra-grid">
          {filtered.length === 0 && <p className="ra-empty">No assets found</p>}
          {filtered.map((asset) => (
            <div className="ra-card" key={asset._id}>
              <div className="ra-card-top">
                <p className="ra-card-name">{asset.name}</p>
                <StatusBadge status={asset.status} />
              </div>
              <p className="ra-card-code">{asset.assetCode}</p>
              <p className="ra-card-location">{asset.location || "—"} {asset.category ? `· ${asset.category}` : ""}</p>
              <Link href={`/asset/${asset.assetCode}`} className="ra-card-btn">View & Report Issue</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}