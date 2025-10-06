"use client";
import { Bell, Search, Settings, Moon, Sun, Calendar, Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: "Lịch hẹn mới",
      message: "Bệnh nhân Nguyễn Thị Hoa đã đặt lịch khám vào 14:00",
      time: "5 phút trước",
      type: "appointment",
      read: false
    },
    {
      id: 2,
      title: "Tin nhắn mới",
      message: "Bạn có tin nhắn mới từ Dr. Trần Văn Nam",
      time: "30 phút trước",
      type: "message",
      read: false
    },
    {
      id: 3,
      title: "Nhắc nhở",
      message: "Cuộc họp khoa sẽ diễn ra vào 15:00 hôm nay",
      time: "1 giờ trước",
      type: "reminder",
      read: true
    }
  ];

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-30 sticky top-0">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left section - Mobile menu button & Search */}
        <div className="flex items-center gap-4">
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

        {/* Center section - Quick Stats */}
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
        </div>

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative w-9 h-9 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-medium text-white rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Thông báo</span>
                <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  Đánh dấu tất cả đã đọc
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className={cn(
                  "flex flex-col items-start p-3 cursor-pointer",
                  !notification.read && "bg-blue-50 dark:bg-blue-900/20"
                )}>
                  <div className="flex items-start gap-3 w-full">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      notification.type === 'appointment' && "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400",
                      notification.type === 'message' && "bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400",
                      notification.type === 'reminder' && "bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400"
                    )}>
                      {notification.type === 'appointment' && <Calendar className="w-4 h-4" />}
                      {notification.type === 'message' && <MessageSquare className="w-4 h-4" />}
                      {notification.type === 'reminder' && <Bell className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between w-full">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="h-10 flex items-center justify-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Xem tất cả thông báo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

