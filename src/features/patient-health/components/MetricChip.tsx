import type { HealthMetricStatus } from "@/features/patient-health/types/patient-health.types";
import { getMetricStatusLabel } from "@/features/patient-health/utils/patient-health.mapper";
import { cn } from "@/lib/utils";

interface MetricChipProps {
  label: string;
  value: string;
  status?: HealthMetricStatus;
  compact?: boolean;
}

export function MetricChip({
  label,
  value,
  status,
  compact = false,
}: MetricChipProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center rounded-xl border border-slate-200 bg-white text-xs dark:border-slate-700 dark:bg-slate-900",
        compact ? "gap-1 px-2.5 py-1.5" : "gap-1.5 px-3 py-2"
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <strong className="whitespace-nowrap text-slate-900 dark:text-white">{value}</strong>
      {!compact && status ? (
        <span className="text-muted-foreground">· {getMetricStatusLabel(status)}</span>
      ) : null}
    </span>
  );
}

