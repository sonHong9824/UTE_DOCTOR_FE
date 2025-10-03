"use client";
import { LayoutDashboard, Users, Calendar, FileText, Stethoscope, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";

const menuItems = [
  { name: "Tổng quan", icon: LayoutDashboard, path: "/doctor" },
  { name: "Bệnh nhân", icon: Users, path: "/doctor/patients" },
  { name: "Lịch làm việc", icon: Calendar, path: "/doctor/schedule" },
  { name: "Hồ sơ y tế", icon: FileText, path: "/doctor/records" },
  { name: "Đơn thuốc", icon: Stethoscope, path: "/doctor/prescriptions" },
  { name: "Báo cáo", icon: FileText, path: "/doctor/reports" },
  { name: "Tin nhắn", icon: MessageSquare, path: "/doctor/messages" },
  { name: "Cài đặt", icon: Settings, path: "/doctor/settings" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
      <div className="h-16 flex items-center justify-center text-xl font-bold border-b">
        Doctor+
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="flex items-center p-2 rounded-lg hover:bg-blue-50 text-gray-700 transition"
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
