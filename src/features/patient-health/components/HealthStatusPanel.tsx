import { Activity, ShieldCheck, TriangleAlert } from "lucide-react";

import type {
  OverallHealthStatus,
  PatientHealthDataSource,
} from "@/features/patient-health/types/patient-health.types";
import { cn } from "@/lib/utils";

interface HealthStatusPanelProps {
  status: OverallHealthStatus;
  statusLabel: string;
  provenanceLabel: string;
  dataSource: PatientHealthDataSource;
}

export function HealthStatusPanel({
  status,
  statusLabel,
  provenanceLabel,
  dataSource,
}: HealthStatusPanelProps) {
  const isStable = status === "STABLE";
  const needsAttention = status === "NEEDS_ATTENTION";
  const StatusIcon = isStable ? ShieldCheck : needsAttention ? TriangleAlert : Activity;

  return (
    <section className="w-full min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-card">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <span className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200">
          <Activity className="h-4 w-4" />
        </span>
        Tình trạng sức khỏe
      </div>

      <div className="my-7 flex justify-center">
        <div
          className={cn(
            "relative flex h-40 w-40 items-center justify-center rounded-full border-[14px]",
            isStable
              ? "border-cyan-100 bg-emerald-50 text-emerald-600 dark:border-cyan-950 dark:bg-emerald-950/30"
              : needsAttention
                ? "border-amber-100 bg-amber-50 text-amber-600 dark:border-amber-950 dark:bg-amber-950/30"
                : "border-slate-100 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900"
          )}
        >
          <span className="absolute inset-2 rounded-full border border-white/80 dark:border-white/10" />
          <StatusIcon className="h-14 w-14" strokeWidth={1.8} />
        </div>
      </div>

      <p className="text-center text-lg font-semibold">
        Chỉ số hiện tại:{" "}
        <span
          className={cn(
            isStable ? "text-emerald-600" : needsAttention ? "text-amber-600" : "text-slate-500"
          )}
        >
          {statusLabel}
        </span>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Cập nhật theo lần đo gần nhất
      </p>
      <div
        className={cn(
          "mt-5 rounded-2xl border p-3 text-sm",
          dataSource === "MOCK"
            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
            : "border-sky-100 bg-sky-50 text-sky-800 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-200"
        )}
      >
        <p className="font-medium">{provenanceLabel}</p>
        {dataSource === "MOCK" ? (
          <p className="mt-1 text-xs leading-5">
            Các giá trị mẫu chỉ dùng khi endpoint backend chưa sẵn sàng.
          </p>
        ) : null}
      </div>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">
        Thông tin này hỗ trợ theo dõi sức khỏe và không thay thế chẩn đoán hoặc tư vấn của
        nhân viên y tế.
      </p>
    </section>
  );
}
