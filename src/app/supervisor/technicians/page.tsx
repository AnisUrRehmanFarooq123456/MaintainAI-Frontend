"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FaUsers,
  FaTools,
  FaUserTie,
  FaUser,
  FaEnvelope,
  FaTasks,
  FaSearch,
} from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import AssignIssueModal from "../../../components/issues/AssignIssueModal";
import "../technicians/technicians.css";

type UserRole = "Admin" | "Technician" | "Supervisor" | "User";

type TeamMember = {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  specialization?: string;
  assignedCount?: number;
  completedCount?: number;
};

type RoleFilter = "All" | "Technician" | "Supervisor" | "User";

const ROLE_TABS: { key: RoleFilter; label: string; icon: ReactNode }[] = [
  { key: "All", label: "Everyone", icon: <FaUsers /> },
  { key: "Technician", label: "Technicians", icon: <FaTools /> },
  { key: "Supervisor", label: "Supervisors", icon: <FaUserTie /> },
  { key: "User", label: "Public Users", icon: <FaUser /> },
];

// Backend role strings aren't guaranteed to arrive in a consistent case.
// Only the three staff roles get an exact match — anything else (including
// the literal "User" role, or anything unrecognized) is treated as a
// public/reporting user rather than silently defaulting to Technician,
// which was the earlier bug: public users were showing up as technicians.
function normalizeRole(raw: string): UserRole {
  const r = (raw || "").trim().toLowerCase();
  if (r === "admin") return "Admin";
  if (r === "technician") return "Technician";
  if (r === "supervisor") return "Supervisor";
  return "User";
}

function initials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function SupervisorTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState<RoleFilter>("All");
  const [query, setQuery] = useState("");
  const [assignTarget, setAssignTarget] = useState<TeamMember | null>(null);

  const loadMembers = async () => {
    setLoading(true);
    try {
      // Base directory: every account the supervisor is allowed to see.
      const usersRes = await apiFetch("/api/getAllUsers");
      const rawUsers = usersRes?.data ?? usersRes;

      if (!Array.isArray(rawUsers)) {
        throw new Error(
          "The server didn't return a user list. Check that " +
            "/api/getAllUsers exists on your backend and that " +
            "utils/api.ts is pointed at the right base URL.",
        );
      }

      // Technician-specific workload numbers layered on top, keyed by _id.
      const techRes = await apiFetch("/api/technicians/overview");
      const techStats = new Map<
        string,
        {
          specialization?: string;
          assignedCount: number;
          completedCount: number;
        }
      >(
        (techRes?.data ?? []).map((t: any) => [
          t._id,
          {
            specialization: t.specialization,
            assignedCount: t.assignedCount ?? 0,
            completedCount: t.completedCount ?? 0,
          },
        ]),
      );

      const merged: TeamMember[] = rawUsers
        .map((u: any) => ({ ...u, role: normalizeRole(u.role) }))
        .filter((u: any) => u.role !== "Admin")
        .map((u: any) => {
          const stats =
            u.role === "Technician" ? techStats.get(u._id) : undefined;
          return {
            _id: u._id,
            fullName: u.fullName,
            email: u.email,
            role: u.role,
            specialization: stats?.specialization,
            assignedCount: stats?.assignedCount,
            completedCount: stats?.completedCount,
          };
        });

      setMembers(merged);
    } catch (err: any) {
      const rawMessage = err?.message || "Failed to load team members";
      const looksLikeHtmlResponse =
        typeof rawMessage === "string" &&
        rawMessage.includes("Unexpected token '<'");

      setError(
        looksLikeHtmlResponse
          ? "The users endpoint returned an HTML page instead of JSON. " +
              "Check that /api/getAllUsers exists on your backend and " +
              "that the request is hitting your API server."
          : rawMessage,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const counts = useMemo(() => {
    const base: Record<RoleFilter, number> = {
      All: members.length,
      Technician: 0,
      Supervisor: 0,
      User: 0,
    };
    members.forEach((m) => {
      if (
        m.role === "Technician" ||
        m.role === "Supervisor" ||
        m.role === "User"
      ) {
        base[m.role]++;
      }
    });
    return base;
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => activeRole === "All" || m.role === activeRole)
      .filter(
        (m) =>
          !q ||
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q),
      )
      .sort((a, b) => (a.assignedCount ?? 0) - (b.assignedCount ?? 0));
  }, [members, activeRole, query]);

  return (
    <div className="tt-page">
      <h1 className="tt-title">Team</h1>
      <p className="tt-subtitle">
        Search and filter everyone, and assign tasks to technicians
      </p>

      <div className="tt-toolbar">
        <div className="tt-role-tabs">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tt-role-tab ${
                activeRole === tab.key ? "tt-role-tab-active" : ""
              }`}
              onClick={() => setActiveRole(tab.key)}
            >
              <span className="tt-role-tab-icon">{tab.icon}</span>
              {tab.label}
              <span className="tt-role-tab-count">{counts[tab.key]}</span>
            </button>
          ))}
        </div>

        <div className="tt-search">
          <FaSearch className="tt-search-icon" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="tt-loading">Loading team...</p>}
      {!loading && error && <p className="tt-error">{error}</p>}

      {!loading && !error && (
        <div className="tt-grid">
          {filteredMembers.length === 0 && (
            <p className="tt-empty">No one matches this filter</p>
          )}

          {filteredMembers.map((member) => (
            <div className="tt-card" key={member._id}>
              <div className="tt-avatar">{initials(member.fullName)}</div>
              <p className="tt-name">{member.fullName}</p>

              {member.role === "Technician" && (
                <p className="tt-role">
                  <FaTools /> {member.specialization || "Technician"}
                </p>
              )}
              {member.role === "Supervisor" && (
                <p className="tt-role">
                  <FaUserTie /> Supervisor
                </p>
              )}
              {member.role === "User" && (
                <p className="tt-role">
                  <FaUser /> Public User
                </p>
              )}

              <p className="tt-email">
                <FaEnvelope /> {member.email}
              </p>

              {member.role === "Technician" ? (
                <>
                  <div className="tt-stats">
                    <div className="tt-stat">
                      <span className="tt-stat-value tt-assigned">
                        {member.assignedCount ?? 0}
                      </span>
                      <span className="tt-stat-label">Assigned</span>
                    </div>
                    <div className="tt-stat">
                      <span className="tt-stat-value tt-completed">
                        {member.completedCount ?? 0}
                      </span>
                      <span className="tt-stat-label">Completed</span>
                    </div>
                  </div>

                  <div className="tt-workload-bar">
                    <div
                      className={`tt-workload-fill ${
                        (member.assignedCount ?? 0) >= 5
                          ? "tt-workload-high"
                          : (member.assignedCount ?? 0) >= 2
                            ? "tt-workload-mid"
                            : "tt-workload-low"
                      }`}
                      style={{
                        width: `${Math.min((member.assignedCount ?? 0) * 20, 100)}%`,
                      }}
                    />
                  </div>

                  <button
                    className="tt-assign-btn"
                    onClick={() => setAssignTarget(member)}
                  >
                    <FaTasks /> Assign Task
                  </button>
                </>
              ) : (
                // Supervisors and public users don't do fieldwork, so no
                // stats/workload bar and no Assign Task action for them.
                <span
                  className={`tt-role-badge ${
                    member.role === "Supervisor"
                      ? "tt-role-badge-supervisor"
                      : "tt-role-badge-user"
                  }`}
                >
                  {member.role === "Supervisor" ? "Supervisor" : "Public User"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {assignTarget && (
        <AssignIssueModal
          technicianId={assignTarget._id}
          technicianName={assignTarget.fullName}
          onClose={() => setAssignTarget(null)}
          onAssigned={loadMembers}
        />
      )}
    </div>
  );
}
