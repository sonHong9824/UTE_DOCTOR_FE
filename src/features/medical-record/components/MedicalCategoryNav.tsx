"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface MedicalCategory {
  value: string;
  label: string;
  count: number;
  icon: LucideIcon;
}

interface MedicalCategoryNavProps {
  categories: MedicalCategory[];
  active: string;
  onChange: (value: string) => void;
}

// Chip-style navigation for the medical record categories, replacing the old
// cramped tab strip. Counts read as pills so they stay scannable.
export default function MedicalCategoryNav({
  categories,
  active,
  onChange,
}: MedicalCategoryNavProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = category.value === active;
        return (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            aria-pressed={isActive}
            className={cn(
              "group inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
              isActive
                ? "border-transparent bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20"
                : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-sky-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{category.label}</span>
            <span
              className={cn(
                "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-xs font-semibold",
                isActive
                  ? "bg-white/25 text-white"
                  : "bg-slate-100 text-slate-600 group-hover:bg-white dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
