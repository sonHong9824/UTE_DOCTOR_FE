"use client";
import NotificationBell from "@/components/notification/notification-bell";
import { Button } from "@/components/ui/button";
import { Menu, MessageSquare, Moon, Search, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";

type TopbarProps = {
  email?: string;
};

export default function Topbar({ email = localStorage.getItem("email") || "" }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-30 sticky top-0 flex items-center">
      <div className="h-full px-4 md:px-6 flex items-center justify-between w-full">
        {/* Left section - Mobile menu button & Search */}
        <div className="flex items-center gap-">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân, lịch hẹn..."
              className="w-64 lg:w-80 h-9 pl-10 pr-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Center section - Quick Stats
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hôm nay</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">12 lịch hẹn</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock5Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chờ khám</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">5 bệnh nhân</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hoàn thành</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">7 ca khám</p>
            </div>
          </div>
        </div> */}

        {/* Right section - Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Messages */}
          <Link href="/doctor/messages">
            <Button
              variant="ghost"
              size="icon"
              className="relative w-9 h-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-[10px] font-medium text-white rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
          </Link>

          {/* Notifications */}
          <NotificationBell
            email={email}
            pageSize={10}
            buttonClassName="relative w-9 h-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            iconClassName="w-5 h-5"
            badgeClassName="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-medium text-white rounded-full flex items-center justify-center"
          />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {/* Settings */}
          <Link href="/doctor/settings">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Clock5Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16.5 12" />
    </svg>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

