"use client";

import {
  Calculator,
  Droplets,
  Gauge,
  HeartPulse,
  Ruler,
  TestTube2,
  Weight,
} from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { BloodPressureTrendChart } from "@/features/patient-health/components/BloodPressureTrendChart";
import { HealthMetricCard } from "@/features/patient-health/components/HealthMetricCard";
import { HealthStatusPanel } from "@/features/patient-health/components/HealthStatusPanel";
import { HealthSummaryHeader } from "@/features/patient-health/components/HealthSummaryHeader";
import { HealthTipsCard } from "@/features/patient-health/components/HealthTipsCard";
import { HeartRateTrendChart } from "@/features/patient-health/components/HeartRateTrendChart";
import {
  EmptyHealthDataState,
  PatientHealthDashboardSkeleton,
  PatientHealthErrorState,
} from "@/features/patient-health/components/PatientHealthStates";
import { RecentMeasurementPreview } from "@/features/patient-health/components/RecentMeasurementPreview";
import { usePatientHealthSummary } from "@/features/patient-health/hooks/usePatientHealthSummary";
import { mapPatientHealthSummaryToViewModel } from "@/features/patient-health/utils/patient-health.mapper";

const metricVisuals = {
  height: {
    icon: <Ruler className="h-6 w-6" />,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300",
  },
  weight: {
    icon: <Weight className="h-6 w-6" />,
    className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  bmi: {
    icon: <Calculator className="h-6 w-6" />,
    className: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  },
  bloodType: {
    icon: <Droplets className="h-6 w-6" />,
    className: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300",
  },
  bloodPressure: {
    icon: <Gauge className="h-6 w-6" />,
    className: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
  },
  heartRate: {
    icon: <HeartPulse className="h-6 w-6" />,
    className: "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300",
  },
} as const;

export default function PatientHealthDashboardScreen() {
  const { state, retry, refresh } = usePatientHealthSummary();

  const viewModel = useMemo(() => {
    if (state.status !== "success") return null;
    return mapPatientHealthSummaryToViewModel(state.data, state.dataSource);
  }, [state]);

  if (state.status === "loading") {
    return <PatientHealthDashboardSkeleton />;
  }

  if (state.status === "error") {
    return <PatientHealthErrorState message={state.message} onRetry={() => void retry()} />;
  }

  if (state.status === "empty") {
    return (
      <div className="space-y-4">
        {state.refreshError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
            {state.refreshError}
          </div>
        ) : null}
        <EmptyHealthDataState refreshing={state.refreshing} onRefresh={() => void refresh()} />
      </div>
    );
  }

  if (!viewModel) return null;

  const bloodTypeDisplay =
    viewModel.metrics.find((metric) => metric.key === "bloodType")?.value ?? "Chưa có dữ liệu";

  return (
    <div className="w-full min-w-0 space-y-5">
      <HealthSummaryHeader
        measuredAtLabel={viewModel.measuredAtLabel}
        refreshing={state.refreshing}
        onRefresh={() => void refresh()}
      />

      {state.dataSource === "MOCK" ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <TestTube2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Dữ liệu minh họa</p>
              <p className="mt-1 text-xs leading-5">
                Các giá trị mẫu được hiển thị tạm thời vì endpoint dữ liệu sức khỏe chưa khả dụng.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void refresh()}
            disabled={state.refreshing}
            className="shrink-0 border-amber-300 bg-white/70 hover:bg-white dark:bg-amber-950"
          >
            Kiểm tra dữ liệu thật
          </Button>
        </section>
      ) : null}

      {state.refreshError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
          {state.refreshError}
        </div>
      ) : null}

      <div className="grid min-w-0 items-start gap-5 min-[1440px]:grid-cols-[minmax(0,1fr)_clamp(340px,22vw,380px)]">
        <div className="min-w-0 space-y-5">
          <section className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:[grid-template-columns:repeat(6,minmax(0,1fr))]">
            {viewModel.metrics.map((metric) => {
              const visual = metricVisuals[metric.key];
              return (
                <HealthMetricCard
                  key={metric.key}
                  metric={metric}
                  icon={visual.icon}
                  accentClassName={visual.className}
                />
              );
            })}
          </section>

          <section className="grid min-w-0 gap-5 min-[1680px]:grid-cols-2">
            <BloodPressureTrendChart points={viewModel.bloodPressurePoints} />
            <HeartRateTrendChart points={viewModel.heartRatePoints} />
          </section>

          <HealthTipsCard />
        </div>

        <aside className="min-w-0 space-y-5">
          <HealthStatusPanel
            status={viewModel.overallStatus}
            statusLabel={viewModel.overallStatusLabel}
            provenanceLabel={viewModel.provenanceLabel}
            dataSource={state.dataSource}
          />
          <RecentMeasurementPreview
            records={viewModel.history}
            dataSource={state.dataSource}
            bloodTypeDisplay={bloodTypeDisplay}
          />
        </aside>
      </div>
    </div>
  );
}
