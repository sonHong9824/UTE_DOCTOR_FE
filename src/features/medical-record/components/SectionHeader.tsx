"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  // Tailwind gradient classes for the icon chip.
  accentClass?: string;
  action?: ReactNode;
  className?: string;
}

// Consistent heading used to separate the three areas of the medical-detail tab.
export default function SectionHeader({
  icon: Icon,
  title,
  description,
  accentClass = "from-sky-500 to-blue-600",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm",
            accentClass
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
