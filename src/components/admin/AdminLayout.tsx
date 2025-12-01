"use client";

import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setIsMounted(true), []);
  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all ${collapsed ? 'pl-20' : 'pl-72'}`}>
        <AdminTopbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
