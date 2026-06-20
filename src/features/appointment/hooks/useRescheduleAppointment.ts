"use client";

import { DoctorDetailDto } from "@/apis/doctor/profile.api";
import { VisitStatusEnum } from "@/enum/visit-status.enum";
import { rescheduleAppointmentService } from "@/features/appointment/services/reschedule-appointment.service";
import {
  RescheduleAppointmentDetail,
  RescheduleFormValues,
  RescheduleTimeSlotOption,
} from "@/features/appointment/types/reschedule.types";
import {
  getRescheduleAppointmentErrorMessage,
  isSlotUnavailableError,
} from "@/features/appointment/utils/reschedule-appointment-error";
import {
  notifyRescheduleOpener,
  ReschedulePopupMessageType,
} from "@/features/appointment/utils/reschedule-popup";
import { formatApiDateToLocalTime, parseApiDateTimeToLocal, toLocalDateInput } from "@/utils/time.util";
import { useEffect, useMemo, useState } from "react";

const INELIGIBLE_VISIT_MESSAGES: Record<string, string> = {
  [VisitStatusEnum.CHECKED_IN]: "Không thể đổi lịch vì lượt khám đã bắt đầu.",
  [VisitStatusEnum.IN_PROGRESS]: "Không thể đổi lịch vì lượt khám đang diễn ra.",
  [VisitStatusEnum.COMPLETED]: "Không thể đổi lịch vì lượt khám đã hoàn tất.",
  [VisitStatusEnum.CANCELLED]: "Lượt khám đã bị hủy, không thể đổi lịch.",
  [VisitStatusEnum.NO_SHOW]: "Lượt khám đã được ghi nhận không đến khám, không thể đổi lịch.",
};

const resolveDoctorId = (appointment: RescheduleAppointmentDetail | null): string => {
  if (!appointment) return "";
  if (appointment.doctor?.id) return appointment.doctor.id;
  if (typeof appointment.doctorId === "string") return appointment.doctorId;
  if (typeof appointment.doctorId === "object" && appointment.doctorId) {
    return appointment.doctorId._id || appointment.doctorId.id || "";
  }
  return "";
};

// Fallback name from appointment snapshot — used while doctorDetail is still loading.
const resolveAppointmentDoctorName = (appointment: RescheduleAppointmentDetail | null): string => {
  if (!appointment) return "";
  if (appointment.doctorName) return appointment.doctorName;
  if (appointment.doctor?.name) return appointment.doctor.name;
  if (typeof appointment.doctorId === "object" && appointment.doctorId) {
    return appointment.doctorId.profileId?.name || appointment.doctorId.name || "";
  }
  return "";
};

// Authoritative name from GET /doctors/:id response.
const resolveDoctorDetailName = (detail: DoctorDetailDto | null): string => {
  if (!detail) return "";
  return detail.doctorName || detail.profileId?.name || "";
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

const resolveEligibility = (
  appointment: RescheduleAppointmentDetail | null
): { isEligible: boolean; ineligibilityReason: string | null } => {
  if (!appointment) return { isEligible: false, ineligibilityReason: null };
  const visitStatus = appointment.visitStatus;
  if (!visitStatus || visitStatus === VisitStatusEnum.CREATED) {
    return { isEligible: true, ineligibilityReason: null };
  }
  return {
    isEligible: false,
    ineligibilityReason: INELIGIBLE_VISIT_MESSAGES[visitStatus] ?? "Lịch hẹn không thể đổi lịch.",
  };
};

export const useRescheduleAppointment = (appointmentId: string) => {
  const [appointment, setAppointment] = useState<RescheduleAppointmentDetail | null>(null);
  const [doctorDetail, setDoctorDetail] = useState<DoctorDetailDto | null>(null);
  const [formValues, setFormValues] = useState<RescheduleFormValues>({
    appointmentDate: "",
    timeSlotId: "",
    reason: "",
  });
  const [slotOptions, setSlotOptions] = useState<RescheduleTimeSlotOption[]>([]);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rescheduleSucceeded, setRescheduleSucceeded] = useState(false);
  // True when this page was opened as a popup from the appointment list/detail.
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    try {
      setIsPopup(typeof window !== "undefined" && !!window.opener && window.opener !== window);
    } catch {
      setIsPopup(false);
    }
  }, []);

  const fetchAvailableSlots = async (date: string, doctorId: string) => {
    if (!doctorId || !date) {
      setSlotOptions([]);
      return;
    }
    setLoadingSlots(true);
    setErrorMessage(null);
    try {
      const slots = await rescheduleAppointmentService.getAvailableSlots({ doctorId, date });
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
        const initialDate = currentDate ? toLocalDateInput(currentDate) : "";
        setFormValues((prev) => ({ ...prev, appointmentDate: initialDate }));

        const doctorId = resolveDoctorId(data);

        // Fetch doctor detail and initial slots in parallel.
        if (doctorId) {
          const [, detail] = await Promise.allSettled([
            initialDate ? fetchAvailableSlots(initialDate, doctorId) : Promise.resolve(),
            rescheduleAppointmentService.getDoctorDetail(doctorId),
          ]);

          if (!mounted) return;
          if (detail.status === "fulfilled" && detail.value) {
            setDoctorDetail(detail.value);
          }
        }
      } catch (error: any) {
        if (!mounted) return;
        setErrorMessage(
          String(error?.response?.data?.message || error?.message || "Không tải được thông tin lịch hẹn")
        );
      } finally {
        if (mounted) setLoadingAppointment(false);
      }
    };

    void loadAppointment();
    return () => { mounted = false; };
  }, [appointmentId]);

  const onDateChange = async (nextDate: string) => {
    setFormValues({ appointmentDate: nextDate, timeSlotId: "", reason: formValues.reason });
    setSuccessMessage(null);
    await fetchAvailableSlots(nextDate, resolveDoctorId(appointment));
  };

  const onTimeSlotChange = (timeSlotId: string) => {
    setFormValues((prev) => ({ ...prev, timeSlotId }));
    setSuccessMessage(null);
  };

  const onReasonChange = (reason: string) => {
    setFormValues((prev) => ({ ...prev, reason }));
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
        startTime: (updated as any)?.startTime || selectedSlot?.start || (prev as any)?.startTime,
        endTime: (updated as any)?.endTime || selectedSlot?.end || (prev as any)?.endTime,
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
      setRescheduleSucceeded(true);
      // Notify the opener (appointment list/detail) so it can refresh its data.
      notifyRescheduleOpener(ReschedulePopupMessageType.SUCCESS, appointmentId);
    } catch (error: unknown) {
      if (isSlotUnavailableError(error)) {
        void fetchAvailableSlots(formValues.appointmentDate, resolveDoctorId(appointment));
      }
      setErrorMessage(getRescheduleAppointmentErrorMessage(error));
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

  // Prefer authoritative name from GET /doctors/:id; fall back to appointment snapshot.
  const doctorName = useMemo(
    () =>
      resolveDoctorDetailName(doctorDetail) ||
      resolveAppointmentDoctorName(appointment) ||
      "--",
    [doctorDetail, appointment]
  );

  const { isEligible, ineligibilityReason } = useMemo(
    () => resolveEligibility(appointment),
    [appointment]
  );

  return {
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
  };
};
