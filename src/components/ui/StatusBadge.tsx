import "./StatusBadge.css";

const STATUS_CLASS: Record<string, string> = {
  Operational: "status-operational",
  "Issue Reported": "status-issue",
  "Under Inspection": "status-inspection",
  "Under Maintenance": "status-maintenance",
  "Out of Service": "status-outofservice",
  Retired: "status-retired",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`status-badge ${STATUS_CLASS[status] || "status-default"}`}
    >
      {status}
    </span>
  );
}
