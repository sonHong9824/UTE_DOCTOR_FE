"use client";

import { Button } from "@/components/ui/button";
import { AppointmentStatus } from "@/enum/appointment-status.enum";
import { VisitStatusEnum } from "@/enum/visit-status.enum";
import { useAppointmentActions } from "@/features/appointment/hooks/useAppointmentActions";
import { useReschedulePopup } from "@/features/appointment/hooks/useReschedulePopup";
import { AppointmentListModel } from "@/features/appointment/types/appointment.types";
import {
  getAppointmentStatusClass,
  getAppointmentStatusLabel,
  getCombinedAppointmentStatusClass,
  getCombinedAppointmentStatusLabel,
  getNoShowReasonLabel,
  getNoShowSourceLabel,
  isAppointmentActionable,
  isAwaitingAssignment,
} from "@/features/appointment/utils/appointment-status";
import { TimeHelper } from "@/lib/time";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownUp,
  Banknote,
  CalendarClock,
  CalendarX2,
  ChevronDown,
  Search,
  Stethoscope,
  User,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const canRescheduleVisit = (visitStatus?: string): boolean => {
  if (!visitStatus) return true; // unknown — let backend decide
  return visitStatus === VisitStatusEnum.CREATED;
};

interface AppointmentsListProps {
  appointments: AppointmentListModel[];
  loading?: boolean;
  onOpenDetail?: (appointment: AppointmentListModel) => void;
  onRefresh?: () => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const getDepositStatusLabel = (status?: string) => {
  switch (status) {
    case "PENDING":
      return "Chờ thanh toán phí giữ chỗ";
    case "PAID":
      return "Đã thanh toán phí giữ chỗ";
    case "NOT_REQUIRED":
      return "Không yêu cầu đặt cọc";
    case "FAILED":
      return "Thanh toán phí giữ chỗ thất bại";
    case "REFUNDED":
      return "Đã hoàn phí giữ chỗ";
    case "FORFEITED":
      return "Phí giữ chỗ không được hoàn";
    default:
      return null;
  }
};

const getDepositAmountText = (appt: AppointmentListModel): string => {
  if (typeof appt.depositPaidAmount === "number" && appt.depositPaidAmount > 0) {
    return `${appt.depositPaidAmount.toLocaleString("vi-VN")}đ`;
  }
  if (typeof appt.depositAmount === "number" && appt.depositStatus === "PENDING") {
    return `${appt.depositAmount.toLocaleString("vi-VN")}đ`;
  }
  return "";
};

const SELECT_CLASS =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

function SummaryCell({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}

export default function AppointmentsList({
  appointments,
  loading = false,
  onOpenDetail,
  onRefresh,
  showPagination,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: AppointmentsListProps) {
  const { cancelLoading, cancelAppointmentById } = useAppointmentActions();
  const { activeAppointmentId, isRescheduling, openReschedulePopup } = useReschedulePopup({
    onSuccess: () => {
      toast.success("Đổi lịch hẹn thành công");
      onRefresh?.();
    },
  });

  // Local-only UI state — filtering/sorting/expansion never touch the API.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceFilter, setServiceFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((a) => a.appointmentStatus && set.add(a.appointmentStatus));
    return Array.from(set);
  }, [appointments]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach((a) => a.serviceType && set.add(a.serviceType));
    return Array.from(set);
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = appointments.filter((a) => {
      if (statusFilter !== "ALL" && a.appointmentStatus !== statusFilter) return false;
      if (serviceFilter !== "ALL" && a.serviceType !== serviceFilter) return false;
      if (query) {
        const haystack = [
          a.doctorId?.profileId?.name ?? "",
          a.serviceType ?? "",
          a.reasonForAppointment ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : 0;
      const tb = b.date ? new Date(b.date).getTime() : 0;
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [appointments, statusFilter, serviceFilter, search, sortOrder]);

  const handleCancel = async (appt: AppointmentListModel) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy cuộc hẹn này?")) return;
    const appointmentId = appt._id || appt.id;
    if (!appointmentId) return;
    await cancelAppointmentById(appointmentId, onRefresh);
  };

  const hasFilters = Boolean(search.trim()) || statusFilter !== "ALL" || serviceFilter !== "ALL";

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo bác sĩ, dịch vụ, lý do..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={SELECT_CLASS}
          aria-label="Lọc theo trạng thái"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {getAppointmentStatusLabel(status as AppointmentStatus)}
            </option>
          ))}
        </select>

        {serviceOptions.length > 0 && (
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className={SELECT_CLASS}
            aria-label="Lọc theo dịch vụ"
          >
            <option value="ALL">Tất cả dịch vụ</option>
            {serviceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          aria-label="Đổi thứ tự sắp xếp"
        >
          <ArrowDownUp className="h-4 w-4" />
          {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
        </button>
      </div>

      {/* List */}
      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-14 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
            <CalendarX2 className="h-6 w-6" />
          </span>
          <p className="text-sm italic text-muted-foreground">Chưa có cuộc hẹn nào</p>
        </div>
      ) : visibleAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-14 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800">
            <Search className="h-6 w-6" />
          </span>
          <p className="text-sm italic text-muted-foreground">
            Không có cuộc hẹn phù hợp với bộ lọc
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleAppointments.map((appt) => {
            const id = String(appt._id || appt.id);
            const awaiting = isAwaitingAssignment(appt.assignmentStatus);
            const combinedStatusLabel = getCombinedAppointmentStatusLabel(appt);
            const formattedDate = appt.date
              ? TimeHelper.formatLocalDateTime(appt.date, "vi-VN")
              : "";
            const isExpanded = expandedId === id;
            const depositLabel = getDepositStatusLabel(appt.depositStatus);
            const depositAmountText = getDepositAmountText(appt);
            const actionable = isAppointmentActionable(appt);
            const canReschedule =
              actionable &&
              !awaiting &&
              (appt.appointmentStatus === "PENDING" || appt.appointmentStatus === "CONFIRMED") &&
              canRescheduleVisit(appt.visitStatus);
            const canCancel =
              actionable &&
              !awaiting &&
              (appt.appointmentStatus === "PENDING" || appt.appointmentStatus === "CONFIRMED") &&
              canRescheduleVisit(appt.visitStatus);

            return (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-sky-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="p-4">
                  {/* Header: status + cost */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          getAppointmentStatusClass(appt.appointmentStatus as AppointmentStatus)
                        )}
                      >
                        {appt.appointmentStatus
                          ? getAppointmentStatusLabel(appt.appointmentStatus as AppointmentStatus)
                          : "-"}
                      </span>
                      {depositLabel ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                          {depositLabel}
                          {depositAmountText ? ` · ${depositAmountText}` : ""}
                        </span>
                      ) : null}
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Phí khám
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {(appt.consultationFee ?? 0).toLocaleString("vi-VN")} đ
                      </p>
                    </div>
                  </div>

                  {combinedStatusLabel ? (
                    <p
                      className={cn(
                        "mt-2 inline-block rounded-md px-2 py-1 text-xs font-medium",
                        getCombinedAppointmentStatusClass(appt)
                      )}
                    >
                      {combinedStatusLabel}
                    </p>
                  ) : null}

                  {/* Summary grid */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <SummaryCell
                      icon={User}
                      label="Bác sĩ"
                      value={awaiting ? "Chờ phân công" : appt.doctorId?.profileId?.name ?? "-"}
                    />
                    <SummaryCell
                      icon={Stethoscope}
                      label="Dịch vụ"
                      value={appt.serviceType ?? "-"}
                    />
                    <SummaryCell
                      icon={CalendarClock}
                      label="Thời gian"
                      value={awaiting ? "Lễ tân sẽ sắp xếp" : formattedDate || "-"}
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? "Thu gọn" : "Chi tiết nhanh"}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>

                    <div className="flex items-center gap-2">
                      {canReschedule && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          onClick={() => {
                            const appointmentId = appt._id || appt.id;
                            if (!appointmentId) return;
                            openReschedulePopup(String(appointmentId));
                          }}
                          disabled={loading || isRescheduling}
                        >
                          {activeAppointmentId === id ? "Đang đổi lịch..." : "Đổi lịch"}
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                          onClick={() => handleCancel(appt)}
                          disabled={cancelLoading}
                        >
                          Hủy
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="rounded-lg"
                        onClick={() => onOpenDetail?.(appt)}
                        disabled={loading}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>

                  {/* Expandable detail */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                              Lý do khám
                            </p>
                            <p className="mt-0.5 text-slate-700 dark:text-slate-200">
                              {appt.reasonForAppointment ?? "Không có"}
                            </p>
                          </div>

                          {depositLabel ? (
                            <div className="flex items-start gap-2">
                              <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                  Phí giữ chỗ
                                </p>
                                <p className="mt-0.5 text-slate-700 dark:text-slate-200">
                                  {depositLabel}
                                  {depositAmountText ? ` (${depositAmountText})` : ""}
                                </p>
                              </div>
                            </div>
                          ) : null}

                          {appt.paymentCategory ? (
                            <div>
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Hình thức
                              </p>
                              <p className="mt-0.5 text-slate-700 dark:text-slate-200">
                                {appt.paymentCategory === "BHYT" ? "Bảo hiểm y tế" : "Dịch vụ"}
                              </p>
                            </div>
                          ) : null}

                          {appt.appointmentStatus === AppointmentStatus.NO_SHOW ? (
                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Không đến khám
                              </p>
                              {appt.noShowAt ? (
                                <p className="mt-1 text-slate-700 dark:text-slate-200">
                                  Ghi nhận lúc {TimeHelper.formatLocalDateTime(appt.noShowAt, "vi-VN")}
                                </p>
                              ) : null}
                              {getNoShowReasonLabel(appt.noShowReasonCode ?? appt.reasonCode) ? (
                                <p className="mt-1 text-slate-700 dark:text-slate-200">
                                  {getNoShowReasonLabel(appt.noShowReasonCode ?? appt.reasonCode)}
                                </p>
                              ) : null}
                              {getNoShowSourceLabel(appt.noShowSource) ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {getNoShowSourceLabel(appt.noShowSource)}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Result count */}
      {appointments.length > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          Hiển thị {visibleAppointments.length}
          {hasFilters ? ` / ${appointments.length}` : ""} cuộc hẹn
          {hasFilters ? " (theo bộ lọc trên trang hiện tại)" : ""}
        </p>
      )}

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-2">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Trước
          </button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                disabled={loading}
                className={cn(
                  "h-8 w-8 rounded-lg text-sm transition-colors",
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm"
                    : "border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
