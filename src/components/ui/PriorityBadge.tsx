import "./PriorityBadge.css";

export default function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`priority-badge2 priority2-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
}
