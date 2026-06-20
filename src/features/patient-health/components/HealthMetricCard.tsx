import type { ReactNode } from "react";

import type { PatientHealthMetricViewModel } from "@/features/patient-health/types/patient-health.types";
import { getMetricStatusLabel } from "@/features/patient-health/utils/patient-health.mapper";
import { cn } from "@/lib/utils";

interface HealthMetricCardProps {
  metric: PatientHealthMetricViewModel;
  icon: ReactNode;
  accentClassName: string;
}

export function HealthMetricCard({
  metric,
  icon,
  accentClassName,
}: HealthMetricCardProps) {
  const statusClassName =
    metric.status === "NORMAL"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : metric.status === "LOW" || metric.status === "HIGH"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

  return (
    <article className="group min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-card">
      <div className={cn("mb-4 inline-flex rounded-2xl p-3", accentClassName)}>{icon}</div>
      <p className="text-sm text-muted-foreground">{metric.label}</p>
      <div className="mt-1 flex min-h-9 items-baseline gap-1.5">
        <span
          className={cn(
            "font-bold tracking-tight text-slate-950 dark:text-white",
            metric.value === "Chưa có dữ liệu" ? "text-base" : "text-2xl"
          )}
        >
          {metric.value}
        </span>
        {metric.unit ? <span className="text-xs text-muted-foreground">{metric.unit}</span> : null}
      </div>
      {metric.status ? (
        <span className={cn("mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusClassName)}>
          {getMetricStatusLabel(metric.status)}
        </span>
      ) : (
        <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Chưa đánh giá
        </span>
      )}
    </article>
  );
}

