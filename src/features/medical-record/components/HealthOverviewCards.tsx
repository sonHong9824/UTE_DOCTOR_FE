"use client";

import { cn } from "@/lib/utils";
import { Droplets, HeartPulse, Ruler, Weight, type LucideIcon } from "lucide-react";

interface HealthOverviewCardsProps {
  height?: number | null;
  weight?: number | null;
  bloodType?: string | null;
  heartRate?: number | null;
  bloodPressure?: { systolic?: number | null; diastolic?: number | null } | null;
}

interface StatCard {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  icon: LucideIcon;
  iconClass: string;
  valueClass: string;
}

// Dashboard-style summary of the patient's key vitals.
export default function HealthOverviewCards({
  height,
  weight,
  bloodType,
  heartRate,
  bloodPressure,
}: HealthOverviewCardsProps) {
  const bpText =
    bloodPressure && (bloodPressure.systolic != null || bloodPressure.diastolic != null)
      ? `Huyết áp ${bloodPressure.systolic ?? "—"}/${bloodPressure.diastolic ?? "—"} mmHg`
      : "Chưa có huyết áp";

  const cards: StatCard[] = [
    {
      label: "Chiều cao",
      value: height ? `${height}` : "—",
      unit: height ? "cm" : undefined,
      icon: Ruler,
      iconClass: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
      valueClass: "text-sky-700 dark:text-sky-300",
    },
    {
      label: "Cân nặng",
      value: weight ? `${weight}` : "—",
      unit: weight ? "kg" : undefined,
      icon: Weight,
      iconClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      valueClass: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Nhóm máu",
      value: bloodType || "—",
      icon: Droplets,
      iconClass: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
      valueClass: "text-rose-700 dark:text-rose-300",
    },
    {
      label: "Nhịp tim",
      value: heartRate != null ? `${heartRate}` : "—",
      unit: heartRate != null ? "bpm" : undefined,
      sub: bpText,
      icon: HeartPulse,
      iconClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
      valueClass: "text-indigo-700 dark:text-indigo-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
            <div className="mt-3 flex items-baseline gap-1">
              <span className={cn("text-2xl font-bold leading-none sm:text-3xl", card.valueClass)}>
                {card.value}
              </span>
              {card.unit ? (
                <span className="text-sm font-medium text-muted-foreground">{card.unit}</span>
              ) : null}
            </div>
            {card.sub ? (
              <p className="mt-1.5 truncate text-xs text-muted-foreground">{card.sub}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
