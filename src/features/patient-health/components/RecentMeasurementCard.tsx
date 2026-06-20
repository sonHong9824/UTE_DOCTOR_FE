import { CalendarClock, ChevronDown, UserRound } from "lucide-react";

import { MetricChip } from "@/features/patient-health/components/MetricChip";
import type {
  HealthMetricStatus,
  PatientHealthDataSource,
  PatientVitalSignRecordDto,
} from "@/features/patient-health/types/patient-health.types";
import { getSourceLabel } from "@/features/patient-health/utils/patient-health.mapper";
import { cn } from "@/lib/utils";
import { formatApiDateToLocalDateTime } from "@/utils/time.util";

interface MeasurementMetric {
  key: string;
  label: string;
  value: string;
  status?: HealthMetricStatus;
}

interface RecentMeasurementCardProps {
  record: PatientVitalSignRecordDto;
  dataSource: PatientHealthDataSource;
  bloodTypeDisplay: string;
  expanded: boolean;
  onToggle: () => void;
  compact?: boolean;
}

const buildMeasurementMetrics = (
  record: PatientVitalSignRecordDto,
  bloodTypeDisplay: string
): MeasurementMetric[] => {
  const metrics: MeasurementMetric[] = [];

  if (
    typeof record.bloodPressureSystolic === "number" &&
    typeof record.bloodPressureDiastolic === "number"
  ) {
    metrics.push({
      key: "blood-pressure",
      label: "Huyết áp",
      value: `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg`,
      status: record.status?.bloodPressure,
    });
  }
  if (typeof record.heartRateBpm === "number") {
    metrics.push({
      key: "heart-rate",
      label: "Nhịp tim",
      value: `${record.heartRateBpm} bpm`,
      status: record.status?.heartRate,
    });
  }
  if (typeof record.bmi === "number") {
    metrics.push({
      key: "bmi",
      label: "BMI",
      value: String(record.bmi),
      status: record.status?.bmi,
    });
  }
  if (typeof record.heightCm === "number") {
    metrics.push({
      key: "height",
      label: "Chiều cao",
      value: `${record.heightCm} cm`,
    });
  }
  if (typeof record.weightKg === "number") {
    metrics.push({
      key: "weight",
      label: "Cân nặng",
      value: `${record.weightKg} kg`,
      status: record.status?.weight,
    });
  }
  if (
    record.bloodType &&
    bloodTypeDisplay !== "Chưa xác minh" &&
    bloodTypeDisplay !== "Chưa có dữ liệu"
  ) {
    metrics.push({
      key: "blood-type",
      label: "Nhóm máu",
      value: bloodTypeDisplay,
    });
  }

  return metrics;
};

const summaryMetricKeys = ["blood-pressure", "heart-rate", "bmi"];

export function RecentMeasurementCard({
  record,
  dataSource,
  bloodTypeDisplay,
  expanded,
  onToggle,
  compact = false,
}: RecentMeasurementCardProps) {
  const metrics = buildMeasurementMetrics(record, bloodTypeDisplay);
  const summaryMetrics = summaryMetricKeys
    .map((key) => metrics.find((metric) => metric.key === key))
    .filter((metric): metric is MeasurementMetric => Boolean(metric))
    .slice(0, 3);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors",
        expanded
          ? "border-sky-200 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/20"
          : "border-slate-200 bg-slate-50/70 hover:border-sky-200 dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-sky-900"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex w-full min-w-0 items-start gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500",
          compact ? "p-3.5" : "p-4"
        )}
      >
        <span className="mt-0.5 shrink-0 rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200">
          <CalendarClock className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <strong className="text-sm text-slate-950 dark:text-white">
              {formatApiDateToLocalDateTime(record.measuredAt)}
            </strong>
            {record.measuredBy?.name ? (
              <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <UserRound className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{record.measuredBy.name}</span>
              </span>
            ) : null}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            {getSourceLabel(record.source, dataSource)}
          </span>

          {!expanded && summaryMetrics.length > 0 ? (
            <span className="mt-3 flex flex-wrap gap-1.5">
              {summaryMetrics.map((metric) => (
                <MetricChip
                  key={metric.key}
                  label={metric.label}
                  value={metric.value}
                  compact
                />
              ))}
            </span>
          ) : null}
        </span>

        <ChevronDown
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded ? (
        <div className="border-t border-sky-100 px-4 pb-4 pt-3 dark:border-sky-900/60">
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <MetricChip
                key={metric.key}
                label={metric.label}
                value={metric.value}
                status={metric.status}
              />
            ))}
          </div>
          {record.note ? (
            <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs leading-5 text-muted-foreground dark:bg-slate-900/70">
              Ghi chú: {record.note}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
