import { Activity, RefreshCcw, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HealthTipsCard } from "@/features/patient-health/components/HealthTipsCard";

export function PatientHealthDashboardSkeleton() {
  return (
    <div className="w-full min-w-0 space-y-5">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid min-w-0 items-start gap-5 min-[1440px]:grid-cols-[minmax(0,1fr)_clamp(340px,22vw,380px)]">
        <div className="min-w-0 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:[grid-template-columns:repeat(6,minmax(0,1fr))]">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-40 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-5 min-[1680px]:grid-cols-2">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
          <Skeleton className="h-48 rounded-3xl" />
        </div>
        <div className="min-w-0 space-y-5">
          <Skeleton className="h-[430px] rounded-3xl" />
          <Skeleton className="h-[560px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

export function EmptyHealthDataState({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="grid min-w-0 items-start gap-5 min-[1440px]:grid-cols-[minmax(0,1fr)_clamp(340px,22vw,380px)]">
      <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-sky-200 bg-sky-50/50 p-8 text-center dark:border-sky-900 dark:bg-sky-950/20">
        <span className="rounded-full bg-white p-5 text-sky-600 shadow-sm dark:bg-slate-900">
          <Activity className="h-10 w-10" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Chưa có dữ liệu đo sức khỏe</h1>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          Các chỉ số sẽ xuất hiện tại đây sau khi có bản ghi đo được lưu cho hồ sơ của bạn.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className="mt-6 gap-2"
        >
          <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </section>
      <HealthTipsCard />
    </div>
  );
}

export function PatientHealthErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/50 p-8 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
      <span className="rounded-full bg-white p-5 text-rose-600 shadow-sm dark:bg-slate-900">
        <ServerCrash className="h-10 w-10" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">Không thể tải dữ liệu sức khỏe</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
      <Button type="button" onClick={onRetry} className="mt-6 gap-2">
        <RefreshCcw className="h-4 w-4" />
        Thử lại
      </Button>
    </section>
  );
}
