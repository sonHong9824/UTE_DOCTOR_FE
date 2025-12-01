"use client";

import { Bell, Search, Settings, Moon, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";
import Link from "next/link";

export default function AdminTopbar() {
  const { theme, setTheme } = useTheme();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-30 sticky top-0 flex items-center">
      <div className="h-full px-4 md:px-6 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
            <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/admin/notifications">
            <Button variant="ghost" size="icon" className="relative w-9 h-9">
              <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-medium text-white rounded-full flex items-center justify-center">3</span>
            </Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-9 h-9">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <Link href="/admin/settings">
            <Button variant="ghost" size="icon" className="w-9 h-9">
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
