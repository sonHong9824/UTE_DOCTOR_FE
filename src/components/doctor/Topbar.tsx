"use client";
import { Bell } from "lucide-react";
import Image from "next/image";

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Bảng điều khiển</h1>
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Doctor Info */}
        <div className="flex items-center gap-2">
          <Image
            src="/assets/bs/bs-Minh.jpg"
            alt="Doctor"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="text-sm font-medium">Dr. Nguyễn Văn A</span>
        </div>
      </div>
    </header>
  );
}
