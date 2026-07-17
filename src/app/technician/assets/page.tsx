"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch, FaQrcode, FaFilter, FaTimes } from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import { Asset } from "../../../utils/types";
import StatusBadge from "../../../components/ui/StatusBadge";
import QRModal from "../../../components/ui/QRModal";
import "./assets.css";

type AssetWithCount = Asset & { openIssuesCount: number };

const STATUS_OPTIONS = [
  "Operational",
  "Issue Reported",
  "Under Inspection",
  "Under Maintenance",
  "Out of Service",
  "Retired",
];

const FILTER_FIELDS = [
  { value: "category", label: "Category" },
  { value: "condition", label: "Condition" },
  { value: "status", label: "Status" },
];

export default function TechnicianAssetsPage() {
  const [assets, setAssets] = useState<AssetWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [qrAsset, setQrAsset] = useState<AssetWithCount | null>(null);

  const isFirstSearch = useRef(true);

  const statusParam = filterField === "status" ? filterValue : "";

  const loadAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterField === "status" && filterValue) {
        params.append("status", filterValue);
      }
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

  // Initial load + reload whenever the "Status" value filter changes
  // (status is filtered server-side, same as before).
  useEffect(() => {
    loadAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusParam]);

  // Live search: fires automatically as soon as the user types or
  // deletes a character, debounced so we don't spam the API on
  // every single keystroke.
  useEffect(() => {
    if (isFirstSearch.current) {
      isFirstSearch.current = false;
      return;
    }
    const timer = setTimeout(() => {
      loadAssets();
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Value options for the second ("value") filter dropdown, driven by
  // whichever field is chosen in the first dropdown.
  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Set(assets.map((a) => a.category).filter(Boolean)),
      ) as string[],
    [assets],
  );

  const conditionOptions = useMemo(
    () =>
      Array.from(
        new Set(assets.map((a) => a.condition).filter(Boolean)),
      ) as string[],
    [assets],
  );

  const valueOptions = useMemo(() => {
    if (filterField === "status") return STATUS_OPTIONS;
    if (filterField === "category") return categoryOptions;
    if (filterField === "condition") return conditionOptions;
    return [];
  }, [filterField, categoryOptions, conditionOptions]);

  // Category/Condition are filtered client-side against whatever the
  // server already returned (search + status are server-side filters).
  const displayedAssets = useMemo(() => {
    if (filterField === "category" && filterValue) {
      return assets.filter((a) => a.category === filterValue);
    }
    if (filterField === "condition" && filterValue) {
      return assets.filter((a) => a.condition === filterValue);
    }
    return assets;
  }, [assets, filterField, filterValue]);

  const handleFieldChange = (value: string) => {
    setFilterField(value);
    setFilterValue("");
  };

  const handleClearFilters = () => {
    setFilterField("");
    setFilterValue("");
    setSearch("");
  };

  const hasActiveFilters = Boolean(search || filterField);

  return (
    <div className="issues-page">
      <div className="issues-header">
        <div>
          <h1 className="issues-title">Assets</h1>
          <p className="issues-subtitle">
            All registered assets across the organization
          </p>
        </div>
      </div>

      <div className="issues-filters">
        <div className="issues-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by asset name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="issues-filter-group">
          <FaFilter className="issues-filter-icon" />

          <select
            value={filterField}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="issues-filter-select"
          >
            <option value="">Filter By...</option>
            {FILTER_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <select
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="issues-filter-select"
            disabled={!filterField}
          >
            <option value="">
              {filterField
                ? `All ${FILTER_FIELDS.find((f) => f.value === filterField)?.label}`
                : "Select a field first"}
            </option>
            {valueOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="issues-clear-btn"
              onClick={handleClearFilters}
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>
      </div>

      {loading && <p className="issues-loading">Loading assets...</p>}
      {error && <p className="issues-error">{error}</p>}

      {!loading && !error && (
        <div className="issues-table-wrap">
          <table className="issues-table">
            <thead>
              <tr>
                <th className="issues-col-asset">Asset</th>
                <th className="issues-col-category">Category</th>
                <th className="issues-col-condition">Condition</th>
                <th className="issues-col-status">Status</th>
                <th className="issues-col-open-issues">Open Issues</th>
                <th className="issues-col-action-dual">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedAssets.length === 0 && (
                <tr className="issues-empty-row">
                  <td colSpan={6} className="issues-empty">
                    No assets found
                  </td>
                </tr>
              )}
              {displayedAssets.map((asset) => (
                <tr key={asset._id}>
                  <td className="issues-col-asset" data-label="Asset">
                    <p className="issues-title-cell">{asset.name}</p>
                    <span className="issues-number">{asset.assetCode}</span>
                  </td>
                  <td
                    className="issues-tech-cell issues-col-category"
                    data-label="Category"
                  >
                    {asset.category || "—"}
                  </td>
                  <td
                    className="issues-tech-cell issues-col-condition"
                    data-label="Condition"
                  >
                    {asset.condition}
                  </td>
                  <td className="issues-col-status" data-label="Status">
                    <StatusBadge status={asset.status} />
                  </td>
                  <td
                    className="issues-col-open-issues"
                    data-label="Open Issues"
                  >
                    {asset.openIssuesCount > 0 ? (
                      <span
                        style={{ color: "var(--critical)", fontWeight: 600 }}
                      >
                        {asset.openIssuesCount}
                      </span>
                    ) : (
                      <span style={{ color: "var(--graphite-soft)" }}>0</span>
                    )}
                  </td>
                  <td className="issues-col-action-dual" data-label="Action">
                    <div className="issues-action-group">
                      <button
                        type="button"
                        className="issues-open-btn issues-open-btn-compact"
                        onClick={() => setQrAsset(asset)}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="issues-qr-btn"
                        onClick={() => setQrAsset(asset)}
                        aria-label="View QR code"
                        title="View QR code"
                      >
                        <FaQrcode />
                      </button>
                    </div>
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