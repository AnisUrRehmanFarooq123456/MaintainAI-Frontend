"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { publicRoutes, roleHomeRoute, roleRoutePrefix } from "../utils/routes";
import { getUser } from "../utils/auth";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const rawPathname = usePathname();
  const pathname = rawPathname || "/";
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);

    const user = getUser();
    const isPublicAssetPage = pathname.startsWith("/asset");

    if (!user) {
      if (!publicRoutes.includes(pathname) && !isPublicAssetPage) {
        router.replace("/");
        return;
      }
      setReady(true);
      return;
    }

    const allowedPrefix = roleRoutePrefix[user.role];

    if (publicRoutes.includes(pathname)) {
      router.replace(allowedPrefix ? roleHomeRoute[user.role] : "/");
      return;
    }

    if (
      allowedPrefix &&
      !pathname.startsWith(allowedPrefix) &&
      !isPublicAssetPage
    ) {
      router.replace(roleHomeRoute[user.role]);
      return;
    }

    setReady(true);
  }, [pathname, router]);

  return (
    <html lang="en">
      <body>
        {ready ? children : <div className="loading-screen">Loading...</div>}
      </body>
    </html>
  );
}
