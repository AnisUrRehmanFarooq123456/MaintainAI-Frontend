"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReporterSidebar from "../../components/layout/ReporterSidebar";
import { getUser } from "../../utils/auth";
import { roleHomeRoute } from "../../utils/routes";
import "../admin/admin-layout.css";

export default function ReporterLayout({
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
    if (user.role !== "reporter") {
      router.replace(roleHomeRoute[user.role] || "/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="admin-shell">
      <ReporterSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
