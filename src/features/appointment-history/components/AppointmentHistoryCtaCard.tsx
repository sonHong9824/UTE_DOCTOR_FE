"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentStatus } from "@/enum/appointment-status.enum";
import {
  getAppointmentStatusClass,
  getAppointmentStatusLabel,
} from "@/features/appointment/utils/appointment-status";
import { TimeHelper } from "@/lib/time";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarClock, Stethoscope } from "lucide-react";

interface AppointmentHistoryCtaCardProps {
  recentAppointments: any[];
  loading?: boolean;
  onOpen: () => void;
}

// Bottom-of-tab card that points to the dedicated "Lịch sử khám" tab and shows a
// tiny preview of the most recent appointments (read-only).
export default function AppointmentHistoryCtaCard({
  recentAppointments,
  loading = false,
  onOpen,
}: AppointmentHistoryCtaCardProps) {
  const preview = recentAppointments.slice(0, 2);

  return (
    <div className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-900/40">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
        {/* Left: CTA */}
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-sm">
            <CalendarClock className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Lịch sử khám
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Xem toàn bộ cuộc hẹn, thanh toán và lịch sử khám trong tab riêng.
            </p>
            <Button
              onClick={onOpen}
              className="mt-4 gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0"
            >
              Mở lịch sử khám
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right: recent preview */}
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Gần đây
          </p>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : preview.length === 0 ? (
            <div className="flex h-full min-h-[3.5rem] items-center rounded-xl border border-dashed border-slate-200 px-4 text-sm italic text-muted-foreground dark:border-slate-800">
              Chưa có cuộc hẹn nào
            </div>
          ) : (
            <div className="space-y-2">
              {preview.map((appt) => {
                const status = appt.appointmentStatus as AppointmentStatus;
                return (
                  <div
                    key={appt._id || appt.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition-colors hover:border-sky-200 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                        {appt.serviceType || "Khám"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {appt.doctorId?.profileId?.name || "Chờ phân công"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-muted-foreground">
                        {appt.date ? TimeHelper.formatLocalDateTime(appt.date, "vi-VN") : "-"}
                      </p>
                      {status ? (
                        <span
                          className={cn(
                            "mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold",
                            getAppointmentStatusClass(status)
                          )}
                        >
                          {getAppointmentStatusLabel(status)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
