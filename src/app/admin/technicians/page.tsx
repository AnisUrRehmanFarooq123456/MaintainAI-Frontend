"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
  FaUsers,
  FaUserShield,
  FaTools,
  FaUserTie,
  FaBullhorn,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { apiFetch } from "../../../utils/api";
import StatCard from "../../../components/dashboard/StatCard";
import "./technicians.css";

type UserRole = "Admin" | "Technician" | "Supervisor" | "Reporter";

type UserRow = {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string;
};
type RoleFilter = "All" | UserRole;

const ROLE_TABS: { key: RoleFilter; label: string; icon: ReactNode }[] = [
  { key: "All", label: "All Users", icon: <FaUsers /> },
  { key: "Admin", label: "Admins", icon: <FaUserShield /> },
  { key: "Technician", label: "Technicians", icon: <FaTools /> },
  { key: "Supervisor", label: "Supervisors", icon: <FaUserTie /> },
  { key: "Reporter", label: "Reporters", icon: <FaBullhorn /> },
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
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState<RoleFilter>("All");
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/getAllUsers");
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
      Reporter: 0,
    };
    users.forEach((u) => {
      const role = (u.role.charAt(0).toUpperCase() +
        u.role.slice(1).toLowerCase()) as RoleFilter;
      if (role !== "All" && role in base) {
        base[role]++;
      }
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

  const handleRemove = async (e: React.MouseEvent, user: UserRow) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await Swal.fire({
      title: `Remove ${user.fullName}?`,
      text: "This permanently deletes this user from the database. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "swal-industrial-popup",
        title: "swal-industrial-title",
        htmlContainer: "swal-industrial-text",
        confirmButton: "swal-btn swal-btn-danger",
        cancelButton: "swal-btn swal-btn-ghost",
      },
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingId(user._id);
      const res = await apiFetch(`/api/users/delete/${user._id}`, {
        method: "DELETE",
      });
      const data = res?.data ?? res;

      if (data && data.status === false) {
        throw new Error(data.message || "Failed to remove user");
      }

      setUsers((prev) => prev.filter((u) => u._id !== user._id));

      Swal.fire({
        title: "Removed",
        text: `${user.fullName} has been removed.`,
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        customClass: {
          popup: "swal-industrial-popup",
          title: "swal-industrial-title",
          htmlContainer: "swal-industrial-text",
        },
      });
    } catch (err: any) {
      Swal.fire({
        title: "Couldn't remove user",
        text: err?.message || "Failed to remove user",
        icon: "error",
        buttonsStyling: false,
        customClass: {
          popup: "swal-industrial-popup",
          title: "swal-industrial-title",
          htmlContainer: "swal-industrial-text",
          confirmButton: "swal-btn swal-btn-danger",
        },
      });
    } finally {
      setDeletingId(null);
    }
  };

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
        <StatCard
          label="Reporters"
          value={counts.Reporter}
          color="purple"
          icon={<FaBullhorn />}
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
              <span>Joined</span>
              <span>Remove</span>
            </div>
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="users-row"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/technicians`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/admin/technicians`);
                }}
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
                <span className="queue-date">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  className="remove-btn"
                  disabled={deletingId === u._id}
                  onClick={(e) => handleRemove(e, u)}
                >
                  <FaTrash className="remove-btn-icon" />
                  {deletingId === u._id ? "Removing…" : "Remove"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
