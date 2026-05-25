"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppointmentActions } from "@/features/appointment/hooks/useAppointmentActions";
import { AppointmentListModel } from "@/features/appointment/types/appointment.types";
import { TimeHelper } from "@/lib/time";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const { cancelLoading, cancelAppointmentById } = useAppointmentActions();

  const handleCancel = async (appt: AppointmentListModel) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy cuộc hẹn này?")) return;
    const appointmentId = appt._id || appt.id;
    if (!appointmentId) return;
    await cancelAppointmentById(appointmentId, onRefresh);
  };

  if (appointments.length === 0) {
    return (
      <div className="h-full max-h-[70vh] overflow-auto pr-2 space-y-3 p-8 flex items-center justify-center">
        <p className="italic text-muted-foreground text-center text-lg">Chưa có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-full max-h-[70vh] overflow-auto pr-2 space-y-3 p-8">
        {appointments.map((appt) => (
          <Card key={appt._id || appt.id} className="p-4">
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Ngày khám:</span>
                  <span className="text-muted-foreground">
                    {TimeHelper.formatLocalDateTime(appt.date, "vi-VN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Bác sĩ:</span>
                  <span>{appt.doctorId?.profileId?.name ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Dịch vụ:</span>
                  <span>{appt.serviceType ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Trạng thái:</span>
                  <span>{appt.appointmentStatus ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Lý do:</span>
                  <span>{appt.reasonForAppointment ?? "-"}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Phí khám:</span>
                  <span>{appt.consultationFee?.toLocaleString() ?? 0} đ</span>
                </div>

                {getDepositStatusLabel(appt.depositStatus) && (
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">Phí giữ chỗ:</span>
                    <span className="text-right">
                      {getDepositStatusLabel(appt.depositStatus)}
                      {typeof appt.depositPaidAmount === "number" && appt.depositPaidAmount > 0
                        ? ` (${appt.depositPaidAmount.toLocaleString("vi-VN")}đ)`
                        : typeof appt.depositAmount === "number" && appt.depositStatus === "PENDING"
                          ? ` (${appt.depositAmount.toLocaleString("vi-VN")}đ)`
                          : ""}
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end gap-2">
                  {(appt.appointmentStatus === "PENDING" || appt.appointmentStatus === "CONFIRMED") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const appointmentId = appt._id || appt.id;
                        if (!appointmentId) return;
                        router.push(`/appointments/reschedule/${encodeURIComponent(String(appointmentId))}`);
                      }}
                      disabled={loading}
                    >
                      Đổi lịch
                    </Button>
                  )}
                  {appt.appointmentStatus !== "CANCELLED" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(appt)}
                      disabled={cancelLoading}
                    >
                      Hủy
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => onOpenDetail?.(appt)}
                    disabled={loading}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6 pb-6">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg ${
                  currentPage === page ? "bg-blue-600 text-white" : "border hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
