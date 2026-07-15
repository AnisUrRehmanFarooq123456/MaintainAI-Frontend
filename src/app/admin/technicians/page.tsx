"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  FaUsers,
  FaUserShield,
  FaTools,
  FaUserTie,
  FaSearch,
} from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import StatCard from "../../../components/dashboard/StatCard";
import "./technicians.css";

type UserRole = "Admin" | "Technician" | "Supervisor";

type UserRow = {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status?: "Active" | "Inactive";
  createdAt: string;
  avatarUrl?: string;
};
type RoleFilter = "All" | UserRole;

const ROLE_TABS: { key: RoleFilter; label: string; icon: ReactNode }[] = [
  { key: "All", label: "All Users", icon: <FaUsers /> },
  { key: "Admin", label: "Admins", icon: <FaUserShield /> },
  { key: "Technician", label: "Technicians", icon: <FaTools /> },
  { key: "Supervisor", label: "Supervisors", icon: <FaUserTie /> },
];

function initials(name?: string) {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState<RoleFilter>("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/getAllUsers");
        // Defensive check: apiFetch may return a Response-like object,
        // or it may already resolve to parsed JSON depending on your
        // utils/api implementation. Handle both shapes safely so a
        // non-JSON (HTML) response doesn't crash with a raw parse error.
        const data = res?.data ?? res;

        if (!Array.isArray(data)) {
          throw new Error(
            "The server didn't return a user list. Check that " +
              "/api/admin/users exists on your backend and that " +
              "utils/api.ts is pointed at the right base URL.",
          );
        }

        setUsers(data);
      } catch (err: any) {
        // If apiFetch throws because res.json() failed on an HTML
        // response, err.message often contains "Unexpected token '<'".
        // Surface a clearer hint in that specific case.
        const rawMessage = err?.message || "Failed to load users";
        const looksLikeHtmlResponse =
          typeof rawMessage === "string" &&
          rawMessage.includes("Unexpected token '<'");

        setError(
          looksLikeHtmlResponse
            ? "The users endpoint returned an HTML page instead of JSON. " +
                "This usually means /api/admin/users doesn't exist yet on " +
                "your backend, or the request is hitting your frontend " +
                "server instead of your API server. Check the API base " +
                "URL configured in utils/api.ts."
            : rawMessage,
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const counts = useMemo(() => {
    const base: Record<RoleFilter, number> = {
      All: users.length,
      Admin: 0,
      Technician: 0,
      Supervisor: 0,
    };
    users.forEach((u) => {
      const role =
        u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase();
      if (role === "Admin") {
        base.Admin++;
      }

      if (role === "Technician") {
        base.Technician++;
      }

      if (role === "Supervisor") {
        base.Supervisor++;
      }

      base[u.role] = (base[u.role] || 0) + 1;
    });
    return base;
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        activeRole === "All" ||
        u.role.toLowerCase() === activeRole.toLowerCase();
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return matchesRole && matchesQuery;
    });
  }, [users, activeRole, query]);

  if (loading) return <div className="dashboard-loading">Loading users...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">User Management</h1>
      <p className="dashboard-subtitle">
        View and filter every account by role
      </p>

      <div className="stat-grid">
        <StatCard
          label="Total Users"
          value={counts.All}
          color="blue"
          icon={<FaUsers />}
        />
        <StatCard
          label="Admins"
          value={counts.Admin}
          color="red"
          icon={<FaUserShield />}
        />
        <StatCard
          label="Technicians"
          value={counts.Technician}
          color="teal"
          icon={<FaTools />}
        />
        <StatCard
          label="Supervisors"
          value={counts.Supervisor}
          color="amber"
          icon={<FaUserTie />}
        />
      </div>

      <div className="users-card">
        <div className="users-toolbar">
          <div className="role-tabs">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`role-tab ${
                  activeRole === tab.key ? "role-tab-active" : ""
                }`}
                onClick={() => setActiveRole(tab.key)}
              >
                <span className="role-tab-icon">{tab.icon}</span>
                {tab.label}
                <span className="role-tab-count">{counts[tab.key]}</span>
              </button>
            ))}
          </div>

          <div className="users-search">
            <FaSearch className="users-search-icon" />
            <input
              type="text"
              placeholder="Search by name or email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="queue-empty">No users match this filter</p>
        ) : (
          <div className="users-table">
            <div className="users-row users-row-head">
              <span>User</span>
              <span>Role</span>
              <span>Status</span>
              <span>Joined</span>
            </div>
            {filteredUsers.map((u) => (
              <Link
                href={`/admin/users/${u._id}`}
                key={u._id}
                className="users-row"
              >
                <div className="users-identity">
                  <span className="users-avatar">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.fullName} />
                    ) : (
                      initials(u.fullName)
                    )}
                  </span>
                  <div>
                    <p className="queue-row-title">{u.fullName}</p>
                    <p className="queue-row-sub">{u.email}</p>
                  </div>
                </div>
                <span className={`role-badge role-${u.role.toLowerCase()}`}>
                  {u.role}
                </span>
                <span
                  className={`status-badge status-${(u.status || "Inactive").toLowerCase()}`}
                >
                  {u.status || "Inactive"}
                </span>
                <span className="queue-date">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
