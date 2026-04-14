"use client";

import { rescheduleAppointmentService } from "@/features/appointment/services/reschedule-appointment.service";
import {
    RescheduleAppointmentDetail,
    RescheduleFormValues,
    RescheduleTimeSlotOption,
} from "@/features/appointment/types/reschedule.types";
import { formatApiDateToLocalTime, parseApiDateTimeToLocal, toLocalDateInput } from "@/utils/time.util";
import { useEffect, useMemo, useState } from "react";

const resolveDoctorId = (appointment: RescheduleAppointmentDetail | null): string => {
  if (!appointment?.doctorId) return "";
  if (typeof appointment.doctorId === "string") return appointment.doctorId;
  return appointment.doctorId._id || appointment.doctorId.id || "";
};

const resolveDoctorName = (appointment: RescheduleAppointmentDetail | null): string => {
  if (!appointment) return "--";
  if (appointment.doctorName) return appointment.doctorName;
  if (typeof appointment.doctorId === "object") {
    return appointment.doctorId.profileId?.name || appointment.doctorId.name || "--";
  }
  return "--";
};

const resolveCurrentDateTime = (appointment: RescheduleAppointmentDetail | null): Date | null => {
  if (!appointment) return null;
  return (
    parseApiDateTimeToLocal(appointment.scheduledAt as any) ||
    parseApiDateTimeToLocal(appointment.startTime as any) ||
    parseApiDateTimeToLocal(appointment.appointmentDate as any) ||
    parseApiDateTimeToLocal(appointment.date as any)
  );
};

const getDisplaySlotLabel = (slot: RescheduleTimeSlotOption): string => {
  if (slot.label) return slot.label;
  const start = slot.start ? formatApiDateToLocalTime(slot.start) : "--:--";
  const end = slot.end ? formatApiDateToLocalTime(slot.end) : "--:--";
  return `${start} - ${end}`;
};

export const useRescheduleAppointment = (appointmentId: string) => {
  const [appointment, setAppointment] = useState<RescheduleAppointmentDetail | null>(null);
  const [formValues, setFormValues] = useState<RescheduleFormValues>({
    appointmentDate: "",
    timeSlotId: "",
  });
  const [slotOptions, setSlotOptions] = useState<RescheduleTimeSlotOption[]>([]);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAppointment = async () => {
      setLoadingAppointment(true);
      setErrorMessage(null);

      try {
        const data = await rescheduleAppointmentService.getAppointmentDetail(appointmentId);
        if (!mounted) return;

        setAppointment(data);
        const currentDate = resolveCurrentDateTime(data);
        setFormValues((prev) => ({
          ...prev,
          appointmentDate: currentDate ? toLocalDateInput(currentDate) : "",
        }));
      } catch (error: any) {
        if (!mounted) return;
        setErrorMessage(
          String(error?.response?.data?.message || error?.message || "Không tải được thông tin lịch hẹn")
        );
      } finally {
        if (mounted) {
          setLoadingAppointment(false);
        }
      }
    };

    void loadAppointment();

    return () => {
      mounted = false;
    };
  }, [appointmentId]);

  const fetchAvailableSlots = async (date: string) => {
    const doctorId = resolveDoctorId(appointment);
    if (!doctorId || !date) {
      setSlotOptions([]);
      return;
    }

    setLoadingSlots(true);
    setErrorMessage(null);

    try {
      const slots = await rescheduleAppointmentService.getAvailableSlots({
        doctorId,
        date,
      });
      setSlotOptions(slots);
    } catch (error: any) {
      setSlotOptions([]);
      setErrorMessage(
        String(error?.response?.data?.message || error?.message || "Không tải được khung giờ")
      );
    } finally {
      setLoadingSlots(false);
    }
  };

  const onDateChange = async (nextDate: string) => {
    setFormValues({
      appointmentDate: nextDate,
      timeSlotId: "",
    });
    setSuccessMessage(null);
    await fetchAvailableSlots(nextDate);
  };

  const onTimeSlotChange = (timeSlotId: string) => {
    setFormValues((prev) => ({ ...prev, timeSlotId }));
    setSuccessMessage(null);
  };

  const onSubmit = async () => {
    if (!formValues.appointmentDate || !formValues.timeSlotId) {
      setErrorMessage("Vui lòng chọn ngày khám và khung giờ");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const updated = await rescheduleAppointmentService.reschedule(appointmentId, formValues);
      const selectedSlot = slotOptions.find((slot) => slot.id === formValues.timeSlotId);

      setAppointment((prev) => ({
        ...(prev || {}),
        ...(updated || {}),
        appointmentDate: (updated as any)?.appointmentDate || formValues.appointmentDate,
        scheduledAt:
          (updated as any)?.scheduledAt ||
          (updated as any)?.startTime ||
          (prev as any)?.scheduledAt ||
          (prev as any)?.startTime,
        startTime:
          (updated as any)?.startTime ||
          selectedSlot?.start ||
          (prev as any)?.startTime,
        endTime:
          (updated as any)?.endTime ||
          selectedSlot?.end ||
          (prev as any)?.endTime,
        timeSlot:
          (updated as any)?.timeSlot ||
          (selectedSlot
            ? {
                id: selectedSlot.id,
                start: selectedSlot.start,
                end: selectedSlot.end,
                label: getDisplaySlotLabel(selectedSlot),
              }
            : (prev as any)?.timeSlot),
      }));

      setSuccessMessage("Đổi lịch thành công");
    } catch (error: any) {
      setErrorMessage(
        String(error?.response?.data?.message || error?.message || "Không thể đổi lịch, vui lòng thử lại")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentDateTime = useMemo(() => resolveCurrentDateTime(appointment), [appointment]);
  const currentSlotLabel = useMemo(() => {
    if (!appointment) return "--";

    const slot = appointment.timeSlot;
    if (slot?.label) return slot.label;
    if (slot?.start || slot?.end) {
      const start = slot?.start ? formatApiDateToLocalTime(slot.start) : "--:--";
      const end = slot?.end ? formatApiDateToLocalTime(slot.end) : "--:--";
      return `${start} - ${end}`;
    }

    const start = appointment.startTime ? formatApiDateToLocalTime(appointment.startTime) : "--:--";
    const end = appointment.endTime ? formatApiDateToLocalTime(appointment.endTime) : "--:--";
    return `${start} - ${end}`;
  }, [appointment]);

  return {
    appointment,
    doctorName: resolveDoctorName(appointment),
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
  };
};
