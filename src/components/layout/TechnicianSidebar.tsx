"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTools,
  FaTachometerAlt,
  FaClipboardList,
  FaBoxes,
  FaCalendarAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaUserCog,
  FaExclamationTriangle,
  FaBell
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./TechnicianSlideBar.css";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/technician", label: "Dashboard", icon: <FaTachometerAlt /> },
  { href: "/technician/assets", label: "My Assets", icon: <FaBoxes /> },
  { href: "/technician/issues", label: "My Issues", icon: <FaExclamationTriangle /> },
  {
    href: "/technician/maintenance",
    label: "Maintenance Log",
    icon: <FaCalendarAlt />,
  },
  { href: "/technician/technicians", label: "Technicians", icon: <FaUserCog /> },
  { href: "/technician/notifications", label: "Notifications", icon: <FaBell /> },
  { href: "/technician/profile", label: "Profile", icon: <FaUserCircle /> },
];

type TechnicianSideBarProps = {
  userName?: string;
  userRole?: string;
};

export default function TechnicianSideBar({
  userName = "Technician",
  userRole = "Technician"
}: TechnicianSideBarProps) {
  const pathname = usePathname();
  const router = useRouter()
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
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
      }
    });
  };
  const isActive = (href: string) =>
    href === "/technician" ? pathname === href : pathname?.startsWith(href);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <FaTools />
        <span>MaintainIQ</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-link ${isActive(item.href) ? "active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-avatar">{initials}</span>
          <div>
            <p className="sidebar-user-name">{userName}</p>
            <p className="sidebar-user-role">{userRole}</p>
          </div>
        </div>

        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
