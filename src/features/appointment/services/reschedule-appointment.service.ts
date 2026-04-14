import {
    getAppointmentDetailForReschedule,
    getAvailableTimeSlotsForReschedule,
    rescheduleAppointmentById,
} from "@/apis/appointment/appointment.api";
import {
    RescheduleAppointmentDetail,
    RescheduleFormValues,
    RescheduleTimeSlotOption,
} from "@/features/appointment/types/reschedule.types";

const unwrapPayload = <T>(res: any, fallback: T): T => {
  if (res == null) return fallback;
  if (Object.prototype.hasOwnProperty.call(res, "data")) {
    return ((res as any).data ?? fallback) as T;
  }
  return res as T;
};

export const rescheduleAppointmentService = {
  async getAppointmentDetail(appointmentId: string): Promise<RescheduleAppointmentDetail> {
    const res = await getAppointmentDetailForReschedule(appointmentId);
    return unwrapPayload<RescheduleAppointmentDetail | null>(res, null) as RescheduleAppointmentDetail;
  },

  async getAvailableSlots(params: { doctorId: string; date: string }): Promise<RescheduleTimeSlotOption[]> {
    const res = await getAvailableTimeSlotsForReschedule(params);
    return unwrapPayload<RescheduleTimeSlotOption[]>(res, []);
  },

  async reschedule(appointmentId: string, payload: RescheduleFormValues): Promise<RescheduleAppointmentDetail> {
    const res = await rescheduleAppointmentById(appointmentId, payload);
    return unwrapPayload<RescheduleAppointmentDetail | null>(res, null) as RescheduleAppointmentDetail;
  },
};
