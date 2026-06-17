"use client";

import { Button } from "@/components/ui/button";
import { clearAuthSession } from "@/features/auth/utils/auth-storage";
import { cn } from "@/lib/utils";
import {
  BellRing,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LogOut,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const menuItems = [
  { name: "Today's Visits", icon: CalendarDays, path: "/receptionist/visits" },
  { name: "Doctor Assignment", icon: ClipboardList, path: "/receptionist/assignments" },
  { name: "Billing", icon: ReceiptText, path: "/receptionist/billing" },
  { name: "Payments", icon: CreditCard, path: "/receptionist/payments" },
  { name: "Notifications", icon: BellRing, path: "/receptionist/notifications" },
];

interface ReceptionistSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function ReceptionistSidebar({ collapsed, onToggle }: ReceptionistSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    clearAuthSession();
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <CalendarDays className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white">Reception Desk</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receptionist Portal</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={collapsed ? "Expand receptionist sidebar" : "Collapse receptionist sidebar"}
        >
          <ChevronRight
            className={cn("h-5 w-5 transition-transform", collapsed ? "rotate-180" : "")}
          />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 transition-all",
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300"
                    : "text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
}
