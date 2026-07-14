"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TechnicianSidebar from "../../components/layout/TechnicianSidebar";
import { getUser } from "../../utils/auth";
import "../admin/admin-layout.css";

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "technician") {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="admin-shell">
      <TechnicianSidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
