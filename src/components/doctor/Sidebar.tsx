"use client";
import {
  LayoutDashboard, Users, Calendar, FileText, Stethoscope, MessageSquare, Settings, 
  User, LogOut, ChevronRight, Activity, ClipboardList, BookOpen
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { getProfileById, getDoctorById, ProfileResponseDto } from "@/apis/doctor/profile.api";
import axiosClient from "@/lib/axiosClient";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const menuItems = [
  // { name: "Tổng quan", icon: LayoutDashboard, path: "/doctor", },
  { name: "Bệnh nhân", icon: Users, path: "/doctor/patients" },
  { name: "Lịch làm việc", icon: Calendar, path: "/doctor/schedule",},
  { name: "Lịch sử khám", icon: ClipboardList, path: "/doctor/records" },
  { name: "Bài đăng", icon: BookOpen, path: "/doctor/posts" },
  // { name: "Tin nhắn", icon: MessageSquare, path: "/doctor/messages",},
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}


export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileResponseDto | null>(null);
  const [doctor, setDoctor] = useState<any | null>(null);
  const router = useRouter();
  

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const doctorId = typeof window !== 'undefined' ? localStorage.getItem('doctorId') || '' : '';
        if (!doctorId) {
          console.warn("No doctorId in localStorage; cannot load profile.");
          return;
        }

        // First fetch doctor to get the related profileId
        const doctorRes = await getDoctorById(doctorId);
        setDoctor(doctorRes || null);
        const profileIdObj = doctorRes?.data?.profileId || doctorRes?.data?.profile;
        const profileId = typeof profileIdObj === 'string' ? profileIdObj : profileIdObj?._id;

        if (!profileId || typeof profileId !== 'string') {
          console.warn("Doctor does not have a profileId; cannot load profile.");
          return;
        }

        const res = await getProfileById(profileId);
        setProfile(res);
      } catch (error) {
        console.error("❌ Lỗi tải hồ sơ bác sĩ:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    if (typeof window === 'undefined') return;
    // keys to clear
    const keys = ['accessToken', 'refreshToken', 'email', 'id', 'accountId', 'userId', 'role', 'name', 'doctorId', 'patientId'];
    keys.forEach((k) => localStorage.removeItem(k));

    // clear axios default auth header
    try {
      if (axiosClient && axiosClient.defaults && axiosClient.defaults.headers) {
        if (axiosClient.defaults.headers.common) delete axiosClient.defaults.headers.common.Authorization;
      }
    } catch (e) {
      // ignore
    }

    toast.success('Đã đăng xuất');
    router.push('/');
  };

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
                </>
              )}

            </Link>
          );
        })}
      </nav>

      {/* Doctor Profile Section */}
      <div className={cn("p-3 border-t border-gray-200 dark:border-gray-800", collapsed ? "items-center justify-center" : "")}>
        {collapsed ? (
          <div className="flex justify-center py-2">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
            <Image
              src={(doctor && typeof doctor.profileId === 'object' && doctor.profileId.avatarUrl) ? doctor.profileId.avatarUrl : "/assets/bs/bs-Minh.jpg"}
              alt="Doctor Avatar"
              width={40}
              height={40}
              className="object-cover"
            />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
              <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                <Image
                  src={(doctor && typeof doctor.profileId === 'object' && doctor.profileId.avatarUrl) ? doctor.profileId.avatarUrl : "/assets/bs/bs-Minh.jpg"}
                  alt="Doctor Avatar"
                  width={48}
                  height={48}
                  className="object-cover"
                />
                {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span> */}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-normal break-words">
                  {doctor?.doctorName || profile?.data.name || "Đang tải..."}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-normal break-words">
                  {doctor?.profileId?.email || profile?.data.email || "Bác sĩ đa khoa"}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <User className="w-4 h-4" />
                <div className="text-sm">
                  <Link href="/doctor/profile">Hồ sơ cá nhân</Link>
                </div>
              </button>
              <div className="mt-3 space-y-1">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
