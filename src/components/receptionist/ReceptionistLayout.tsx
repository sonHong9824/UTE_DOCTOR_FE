"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReceptionistSidebar from "./ReceptionistSidebar";

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("accessToken");
    const role = (localStorage.getItem("role") || "").toUpperCase();

    if (!token) {
      setAuthorized(false);
      router.replace("/login");
      return;
    }

    if (role !== "RECEPTIONIST") {
      setAuthorized(false);
      router.replace("/");
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (authorized !== true) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ReceptionistSidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
          collapsed ? "ml-20" : "ml-72"
        }`}
      >
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
