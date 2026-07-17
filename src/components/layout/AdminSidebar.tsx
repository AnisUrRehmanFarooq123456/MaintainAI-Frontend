"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaBoxes,
  FaExclamationTriangle,
  FaCalendarCheck,
  FaUserCog,
  FaChartBar,
  FaBell,
  FaSignOutAlt,
  FaRocket,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { logoutUser, getUser } from "../../utils/auth";
import "./Sidebar.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/admin/assets", label: "Assets", icon: FaBoxes },
  { href: "/admin/issues", label: "Issues", icon: FaExclamationTriangle },
  {
    href: "/admin/maintenance",
    label: "Scheduled Maintenance",
    icon: FaCalendarCheck,
  },
  { href: "/admin/technicians", label: "Users", icon: FaUserCog },
  { href: "/admin/analytics", label: "Analytics", icon: FaChartBar },
  { href: "/admin/notifications", label: "Notifications", icon: FaBell },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    Swal.fire({
      title: "Log out?",
      text: "You will need to log in again to access the dashboard.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      confirmButtonColor: "#dc2626",
    }).then((result) => {
      if (result.isConfirmed) {
        logoutUser();
        router.push("/login");
      }
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FaRocket />
        <span>MaintainIQ</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.fullName?.charAt(0) || "A"}
          </div>
          <div>
            <p className="sidebar-user-name">{user?.fullName}</p>
            <p className="sidebar-user-role">Admin</p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
