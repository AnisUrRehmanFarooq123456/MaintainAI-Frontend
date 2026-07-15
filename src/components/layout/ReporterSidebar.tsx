"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaTachometerAlt,
  FaBoxes,
  FaClipboardList,
  FaUser,
  FaSignOutAlt,
  FaRocket,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { logoutUser, getUser } from "../../utils/auth";
import "./Sidebar.css";

const NAV_ITEMS = [
  { href: "/reporter", label: "Dashboard", icon: FaTachometerAlt },
  { href: "/reporter/assets", label: "All Assets", icon: FaBoxes },
  { href: "/reporter/issues", label: "My Complaints", icon: FaClipboardList },
  { href: "/reporter/profile", label: "My Profile", icon: FaUser },
];

export default function ReporterSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getUser();

  const handleLogout = () => {
    Swal.fire({
      title: "Log out?",
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
            item.href === "/reporter"
              ? pathname === "/reporter"
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
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div>
            <p className="sidebar-user-name">{user?.fullName}</p>
            <p className="sidebar-user-role">Public User</p>
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
