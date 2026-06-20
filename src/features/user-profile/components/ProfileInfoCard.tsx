"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface ProfileInfoItem {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
}

interface ProfileInfoCardProps {
  title: string;
  titleIcon: LucideIcon;
  // Tailwind gradient classes for the title icon chip, e.g. "from-sky-500 to-blue-600".
  accentClass: string;
  items: ProfileInfoItem[];
  className?: string;
}

// Reusable titled section card listing read-only profile fields.
export default function ProfileInfoCard({
  title,
  titleIcon: TitleIcon,
  accentClass,
  items,
  className,
}: ProfileInfoCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md",
        "dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-900",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            accentClass
          )}
        >
          <TitleIcon className="h-[18px] w-[18px]" />
        </span>
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>

      <dl className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-400">
                <Icon className="h-4 w-4" />
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <dt className="shrink-0 text-sm text-muted-foreground">{item.label}</dt>
                <dd className="min-w-0 truncate text-right text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
