import "./IssueStatusBadge.css";

const STATUS_CLASS: Record<string, string> = {
  Reported: "issue-status-reported",
  Assigned: "issue-status-assigned",
  "Inspection Started": "issue-status-inspection",
  "Maintenance In Progress": "issue-status-maintenance",
  "Waiting for Parts": "issue-status-waiting",
  Resolved: "issue-status-resolved",
  Closed: "issue-status-closed",
  Reopened: "issue-status-reopened",
};

export default function IssueStatusBadge({ status }: { status: string }) {
  return (
    <span className={`issue-status-badge ${STATUS_CLASS[status] || ""}`}>
      {status}
    </span>
  );
}
