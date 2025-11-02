"use client";
import {
  LayoutDashboard, Users, Calendar, FileText, Stethoscope, MessageSquare, Settings, 
  User, LogOut, ChevronRight, Activity, ClipboardList
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { getProfileById, ProfileResponseDto } from "@/apis/doctor/profile.api";

const menuItems = [
  { name: "Tổng quan", icon: LayoutDashboard, path: "/doctor", badge: { count: 3, color: "bg-blue-500" } },
  { name: "Bệnh nhân", icon: Users, path: "/doctor/patients" },
  { name: "Lịch làm việc", icon: Calendar, path: "/doctor/schedule", badge: { count: 5, color: "bg-amber-500" } },
  { name: "Hồ sơ y tế", icon: ClipboardList, path: "/doctor/records" },
  { name: "Đơn thuốc", icon: Stethoscope, path: "/doctor/prescriptions" },
  { name: "Báo cáo", icon: Activity, path: "/doctor/reports" },
  { name: "Tin nhắn", icon: MessageSquare, path: "/doctor/messages", badge: { count: 2, color: "bg-rose-500" } },
  { name: "Cài đặt", icon: Settings, path: "/doctor/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileResponseDto | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileById("68ec9bbb97af2916bddd47f7");
        setProfile(res);
      } catch (error) {
        console.error("❌ Lỗi tải hồ sơ bác sĩ:", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <aside
      className={cn(
        "doctor-sidebar fixed top-0 left-0 h-screen z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out shadow-sm",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 dark:bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Doctor+</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Doctor Portal</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          <ChevronRight className={cn("w-5 h-5 transition-transform", collapsed ? "rotate-180" : "")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-lg",
                  isActive
                    ? "bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>

              {!collapsed && (
                <>
                  <div className="flex-1">
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white",
                        item.badge.color
                      )}
                    >
                      {item.badge.count}
                    </span>
                  )}
                </>
              )}

              {collapsed && item.badge && (
                <span
                  className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium text-white",
                    item.badge.color
                  )}
                >
                  {item.badge.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Doctor Profile Section */}
      <div className={cn("p-3 border-t border-gray-200 dark:border-gray-800", collapsed ? "items-center justify-center" : "")}>
        {collapsed ? (
          <div className="flex justify-center py-2">
            <Image
              src="/assets/bs/bs-Minh.jpg"
              alt="Doctor"
              width={40}
              height={40}
              className="rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
              <div className="relative">
                <Image
                  src="/assets/bs/bs-Minh.jpg"
                  alt="Doctor"
                  width={48}
                  height={48}
                  className="rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {profile ? profile.data.name : "Đang tải..."}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {profile?.data.email || "Bác sĩ đa khoa"}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <User className="w-4 h-4" />
                <span className="text-sm">Hồ sơ cá nhân</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
