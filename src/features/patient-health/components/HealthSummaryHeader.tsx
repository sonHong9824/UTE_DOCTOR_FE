import { CalendarClock, RefreshCcw, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HealthSummaryHeaderProps {
  measuredAtLabel: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export function HealthSummaryHeader({
  measuredAtLabel,
  refreshing,
  onRefresh,
}: HealthSummaryHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm dark:border-sky-900/50 dark:from-sky-950/40 dark:via-card dark:to-cyan-950/30">
      <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/10" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tổng quan sức khỏe
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Sức khỏe tổng quát
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Theo dõi các chỉ số được ghi nhận trong những lần đo gần đây.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/50 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Lần đo gần nhất</p>
              <p className="text-sm font-semibold">{measuredAtLabel}</p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>
    </section>
  );
}

