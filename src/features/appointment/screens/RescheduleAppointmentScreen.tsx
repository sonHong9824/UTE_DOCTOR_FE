"use client";

import RescheduleAppointmentForm from "@/features/appointment/components/RescheduleAppointmentForm";
import { useRescheduleAppointment } from "@/features/appointment/hooks/useRescheduleAppointment";
import { formatApiDateToLocalTime } from "@/utils/time.util";

interface RescheduleAppointmentScreenProps {
  appointmentId: string;
}

export default function RescheduleAppointmentScreen({ appointmentId }: RescheduleAppointmentScreenProps) {
  const {
    appointment,
    doctorName,
    currentDateTime,
    currentSlotLabel,
    formValues,
    slotOptions,
    loadingAppointment,
    loadingSlots,
    submitting,
    errorMessage,
    successMessage,
    getDisplaySlotLabel,
    onDateChange,
    onTimeSlotChange,
    onSubmit,
  } = useRescheduleAppointment(appointmentId);

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
        formValues={formValues}
        slotOptions={slotOptions}
        loadingSlots={loadingSlots}
        submitting={submitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        getSlotLabel={getDisplaySlotLabel}
        onDateChange={onDateChange}
        onSlotChange={onTimeSlotChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
