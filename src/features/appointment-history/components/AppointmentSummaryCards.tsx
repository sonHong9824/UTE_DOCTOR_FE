"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CircleCheckBig, CircleSlash2, CircleX, Hourglass, ListChecks, type LucideIcon } from "lucide-react";

interface AppointmentSummaryCardsProps {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  noShow: number;
  loading?: boolean;
}

interface SummaryCard {
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
  valueClass: string;
}

// Top-of-screen KPI cards for the appointment history tab. All counts are
// computed client-side from already-loaded appointment data.
export default function AppointmentSummaryCards({
  total,
  upcoming,
  completed,
  cancelled,
  noShow,
  loading = false,
}: AppointmentSummaryCardsProps) {
  const cards: SummaryCard[] = [
    {
      label: "Tổng số cuộc hẹn",
      value: total,
      icon: ListChecks,
      iconClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
      valueClass: "text-sky-700 dark:text-sky-300",
    },
    {
      label: "Sắp tới",
      value: upcoming,
      icon: Hourglass,
      iconClass: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      valueClass: "text-amber-700 dark:text-amber-300",
    },
    {
      label: "Đã hoàn thành",
      value: completed,
      icon: CircleCheckBig,
      iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      valueClass: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Đã hủy",
      value: cancelled,
      icon: CircleX,
      iconClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
      valueClass: "text-rose-700 dark:text-rose-300",
    },
    {
      label: "Không đến khám",
      value: noShow,
      icon: CircleSlash2,
      iconClass: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      valueClass: "text-slate-700 dark:text-slate-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-900 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                  card.iconClass
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>
            </div>
            {loading ? (
              <Skeleton className="mt-3 h-8 w-12" />
            ) : (
              <p className={cn("mt-3 text-2xl font-bold leading-none sm:text-3xl", card.valueClass)}>
                {value(card.value)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const value = (n: number) => (Number.isFinite(n) ? n.toLocaleString("vi-VN") : "—");
