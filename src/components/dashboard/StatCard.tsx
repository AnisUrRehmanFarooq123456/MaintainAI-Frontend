import "./StatCard.css";

type Props = {
  label: string;
  value: number | string;
  color: "blue" | "green" | "red" | "amber" | "teal" | "purple";
  icon: React.ReactNode;
};

export default function StatCard({ label, value, color, icon }: Props) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
