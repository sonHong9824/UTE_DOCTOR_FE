"use client";

import NotificationBell from "@/components/notification/notification-bell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BellRing,
  CalendarDays,
  ClipboardList,
  CreditCard,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReceptionistSidebar from "./ReceptionistSidebar";

const pageMeta = {
  "/receptionist/visits": {
    title: "Receptionist Dashboard",
    subtitle: "Manage today's visits and patient check-ins.",
    icon: CalendarDays,
  },
  "/receptionist/assignments": {
    title: "Doctor Assignment Queue",
    subtitle: "Manage appointment assignment tasks and realtime receptionist alerts.",
    icon: ClipboardList,
  },
  "/receptionist/billing": {
    title: "Billing Workspace",
    subtitle: "Finalize visit billing, wallet adjustments, and payment handoff.",
    icon: ReceiptText,
  },
  "/receptionist/payments": {
    title: "Payments",
    subtitle: "Track receptionist payment workflows.",
    icon: CreditCard,
  },
  "/receptionist/notifications": {
    title: "Notification Center",
    subtitle: "Review receptionist-owned alerts and assignment notifications.",
    icon: BellRing,
  },
} as const;

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");

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
    setEmail(localStorage.getItem("email") || "");
  }, [router]);

  if (authorized !== true) {
    return null;
  }

  const meta = pageMeta[pathname as keyof typeof pageMeta] ?? pageMeta["/receptionist/visits"];
  const PageIcon = meta.icon;
  const displayName = email ? email.split("@")[0] : "Receptionist";

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <ReceptionistSidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-all duration-300",
          collapsed ? "ml-20" : "ml-72"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60">
                <PageIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-normal text-gray-950 dark:text-gray-50">
                    {meta.title}
                  </h1>
                  <Badge
                    variant="gray"
                    className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300"
                  >
                    Live queue
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{meta.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 lg:justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-2 py-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <NotificationBell
                  pageSize={10}
                  viewAllHref="/receptionist/notifications"
                  buttonClassName="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-300"
                  iconClassName="h-5 w-5"
                  badgeClassName="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white dark:ring-gray-900"
                />
              </div>

              <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:flex">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <UserRound className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    Receptionist
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
