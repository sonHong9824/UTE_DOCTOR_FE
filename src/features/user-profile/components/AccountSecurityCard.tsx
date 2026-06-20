"use client";

import { ChevronRight, ShieldCheck } from "lucide-react";

interface AccountSecurityCardProps {
  // Switches the profile to the password tab (UI-only navigation).
  onNavigate: () => void;
}

// Quick-action card on the personal-info tab that routes to the password tab.
export default function AccountSecurityCard({ onNavigate }: AccountSecurityCardProps) {
  return (
    <button
      type="button"
      onClick={onNavigate}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-900"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
        <ShieldCheck className="h-6 w-6" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-800 dark:text-slate-100">Bảo mật tài khoản</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Đổi mật khẩu định kỳ để giữ tài khoản luôn an toàn.
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-sky-500" />
    </button>
  );
}
