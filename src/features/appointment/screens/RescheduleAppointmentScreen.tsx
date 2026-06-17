"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RescheduleAppointmentForm from "@/features/appointment/components/RescheduleAppointmentForm";
import { useRescheduleAppointment } from "@/features/appointment/hooks/useRescheduleAppointment";
import { formatApiDateToLocalTime } from "@/utils/time.util";
import { CheckCircle2 } from "lucide-react";

interface RescheduleAppointmentScreenProps {
  appointmentId: string;
}

export default function RescheduleAppointmentScreen({ appointmentId }: RescheduleAppointmentScreenProps) {
  const {
    appointment,
    doctorName,
    currentDateTime,
    currentSlotLabel,
    isEligible,
    ineligibilityReason,
    formValues,
    slotOptions,
    loadingAppointment,
    loadingSlots,
    submitting,
    errorMessage,
    successMessage,
    rescheduleSucceeded,
    isPopup,
    getDisplaySlotLabel,
    onDateChange,
    onTimeSlotChange,
    onReasonChange,
    onSubmit,
  } = useRescheduleAppointment(appointmentId);

  // Success screen — shown after the reschedule API succeeds. The opener (if any)
  // has already been notified via postMessage from the hook.
  if (rescheduleSucceeded) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-semibold">Đổi lịch hẹn thành công</h2>
            <p className="text-muted-foreground">
              Lịch hẹn của bạn đã được đổi thành công. Bạn có thể đóng cửa sổ này.
            </p>
            {isPopup ? (
              <Button variant="outline" onClick={() => window.close()}>
                Đóng cửa sổ
              </Button>
            ) : (
              <Button onClick={() => { window.location.href = "/"; }}>
                Về trang chủ
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingAppointment) {
    return <div className="p-6 text-center">Đang tải thông tin lịch hẹn...</div>;
  }

  if (!appointment) {
    return <div className="p-6 text-center text-destructive">Không tìm thấy lịch hẹn.</div>;
  }

  const currentScheduledDisplay = currentDateTime
    ? `${currentDateTime.toLocaleDateString("vi-VN")} ${formatApiDateToLocalTime(currentDateTime)}`
    : "--";

  return (
    <div className="p-6">
      <RescheduleAppointmentForm
        doctorName={doctorName}
        appointmentStatus={String(appointment.appointmentStatus || "")}
        currentScheduledDisplay={currentScheduledDisplay}
        currentSlotDisplay={currentSlotLabel}
        isEligible={isEligible}
        ineligibilityReason={ineligibilityReason}
        formValues={formValues}
        slotOptions={slotOptions}
        loadingSlots={loadingSlots}
        submitting={submitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        getSlotLabel={getDisplaySlotLabel}
        onDateChange={onDateChange}
        onSlotChange={onTimeSlotChange}
        onReasonChange={onReasonChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
