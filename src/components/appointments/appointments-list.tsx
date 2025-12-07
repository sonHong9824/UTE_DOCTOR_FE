"use client";

import { cancelAppointment } from "@/apis/appointment/appointment.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

interface AppointmentsListProps {
  appointments: any[];
  loading?: boolean;
  onOpenDetail?: (appointment: any) => void;
  onRefresh?: () => void;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
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
  const [cancelLoading, setCancelLoading] = useState(false);

    console.log("Total pages in AppointmentsList and showPagination:", totalPages, showPagination);

  const handleCancel = async (appt: any) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy cuộc hẹn này?")) return;

    try {
      setCancelLoading(true);
      const patientId = appt.patientId?._id || appt.patientId || localStorage.getItem("patientId");
      
      if (!patientId) {
        toast.error("Không tìm thấy thông tin bệnh nhân");
        return;
      }

      await cancelAppointment(appt._id || appt.id, patientId);
      toast.success("Hủy cuộc hẹn thành công");
      
      onRefresh?.();
    } catch (err: any) {
      console.error("Failed to cancel appointment:", err);
      toast.error(err.message || "Hủy cuộc hẹn thất bại");
    } finally {
      setCancelLoading(false);
    }
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
        {appointments.map((appt: any) => (
          <Card key={appt._id} className="p-4">
            <CardContent>
              <div className="flex flex-col gap-2">
                {/* Ngày khám */}
                <div className="flex justify-between">
                  <span className="font-medium">Ngày khám:</span>
                  <span className="text-muted-foreground">
                    {new Date(appt.date).toLocaleString("vi-VN")}
                  </span>
                </div>

                {/* Bác sĩ */}
                <div className="flex justify-between">
                  <span className="font-medium">Bác sĩ:</span>
                  <span>{appt.doctorId?.profileId?.name ?? "-"}</span>
                </div>

                {/* Loại dịch vụ */}
                <div className="flex justify-between">
                  <span className="font-medium">Dịch vụ:</span>
                  <span>{appt.serviceType}</span>
                </div>

                {/* Tình trạng */}
                <div className="flex justify-between">
                  <span className="font-medium">Trạng thái:</span>
                  <span>{appt.appointmentStatus}</span>
                </div>

                {/* Lý do khám */}
                <div className="flex justify-between">
                  <span className="font-medium">Lý do:</span>
                  <span>{appt.reasonForAppointment ?? "-"}</span>
                </div>

                {/* Tiền khám */}
                <div className="flex justify-between">
                  <span className="font-medium">Phí khám:</span>
                  <span>{appt.consultationFee?.toLocaleString()} đ</span>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
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

      {/* Pagination Controls */}
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
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border hover:bg-gray-50"
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
