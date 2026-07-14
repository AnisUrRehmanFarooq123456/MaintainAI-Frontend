"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SupervisorSidebar from "../../components/layout/SupervisorSidebar";
import { getUser } from "../../utils/auth";
import { roleHomeRoute } from "../../utils/routes";
import "../admin/admin-layout.css";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "supervisor") {
      router.replace(roleHomeRoute[user.role] || "/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="admin-shell">
      <SupervisorSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
