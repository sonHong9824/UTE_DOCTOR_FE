import { TimeSlotStatusEnum } from "@/enum/timeslot-status.enum";
import { AppointmentBookingPayload } from "@/features/appointment/types/appointment.types";
import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { TimeSlotDto } from "@/types/timeslot.dto";
import { assertValidISO, buildZonedISO, ensureHasTimezone } from "@/utils/time.util";

export type BookAppointmentResponse = DataResponse<{
  appointmentId?: string;
  depositStatus?: "PENDING" | "PAID" | "NOT_REQUIRED" | "FAILED" | "REFUNDED" | "FORFEITED";
  depositAmount?: number;
  depositPaymentId?: string;
  depositPaidAmount?: number;
  depositPaidAt?: string | null;
  paymentUrl?: string;
} | null>;

export const bookAppointment = async (form: AppointmentBookingPayload) => {
  try {
    assertValidISO(form.appointmentDate);
    const res = await axiosClient.post<BookAppointmentResponse>("/appointment/book", form);
    return res.data;
  } catch (e) {
    console.error("Failed to book appointment: " + e);
    throw e;
  }
};

export const getSpecialties = async () => {
  try {
    const res = await axiosClient.get<DataResponse<{ _id: string; name: string }[]>>("/chuyenkhoa");
    console.log('[Axios] Get specialty field data', res);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch field data", e);
    throw e;
  }
};

export const getDoctorBySpecialty = async(params: {specialtyId: string, keyword: string}) => {
    try {
        const res = await axiosClient.get<DataResponse<{id: string, name: string, email: string, specialtyId: string}[]>>("/doctors/specialty", {
        params: params
        });
        console.log('[Axios] Get doctors by specialty', res);
        return res.data;
    }
    catch (e) {
        console.error("Failed to fetch doctors by specialty", e);
        throw e;
    }

};

export const getTodayAppointments = async () => {
  try {
    const res = await axiosClient.get<DataResponse<any[]>>("/appointment/today");
    console.log('[Axios] Get today appointments:', res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch today's appointments:", e);
    throw e;
  }
};

export const completeAppointment = async (data: {
  appointmentId: string;
  diagnosis: string;
  note?: string;
  prescriptions: Array<{
    medicineId: string;
    name: string;
    quantity: number;
    note?: string;
  }>;
}) => {
  try {
    const res = await axiosClient.patch<DataResponse<{
      appointmentId: string;
      patientId: string;
    }>>("/appointment/complete", data);
    console.log('[Axios] Complete appointment:', res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to complete appointment:", e);
    throw e;
  }
};

export const getTimeSlotsByDoctorAndDate = async (params: { doctorId: string; date: string; status?: TimeSlotStatusEnum }) => {
  try {
    const status = params.status ?? TimeSlotStatusEnum.AVAILABLE; // default = 'available'
    const encodedDate = encodeURIComponent(params.date);
    const res = await axiosClient.get<DataResponse<TimeSlotDto[]>>(
      `/doctors/doctor/${params.doctorId}/date/${encodedDate}`,
      {
        params: { status },
      }
    );

    console.log("[Axios] Get timeslots by doctor & date", res);
    return res.data;
  } catch (e) {
    console.error("❌ Failed to fetch timeslots by doctor & date", e);
  }
};

export const getAppointmentById = async (id: string) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>(`/appointment/${id}`);
    console.log("[Axios] Get appointment by id:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch appointment by id:", e);
    throw e;
  }
};

export const getAppointments = async (
  page: number = 1,
  limit: number = 10
) => {
  try {
    const res = await axiosClient.get<DataResponse<{
      data: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>>("/appointment/patient", {
      params: { 
        page,
        limit
      }
      });

    console.log("[Axios] Get appointments:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch appointments:", e);
    throw e;
  }
};

export type RescheduleV2Payload = {
  appointmentDate: string;
  timeSlotId: string;
  reason?: string;
};

export const getAppointmentDetailForReschedule = async (id: string) => {
  const res = await axiosClient.get<DataResponse<any>>(`/appointment/${id}`);
  return res.data;
};

// Contract: GET /doctors/doctor/:doctorId/date/:date — date must be YYYY-MM-DD only
export const getAvailableTimeSlotsForReschedule = async (params: {
  doctorId: string;
  date: string; // YYYY-MM-DD
}) => {
  const encodedDate = encodeURIComponent(params.date);
  const res = await axiosClient.get<DataResponse<TimeSlotDto[]>>(
    `/doctors/doctor/${params.doctorId}/date/${encodedDate}`
  );
  return res.data;
};

// Contract: PATCH /appointment/:id/reschedule
export const rescheduleAppointmentById = async (
  appointmentId: string,
  payload: RescheduleV2Payload
) => {
  const normalizedDate = ensureHasTimezone(payload.appointmentDate)
    ? payload.appointmentDate
    : buildZonedISO(payload.appointmentDate, "00:00");

  assertValidISO(normalizedDate);

  const body: Record<string, unknown> = {
    appointmentDate: normalizedDate,
    timeSlotId: payload.timeSlotId,
  };
  if (payload.reason?.trim()) {
    body.reason = payload.reason.trim();
  }

  const res = await axiosClient.patch<DataResponse<any>>(
    `/appointment/${appointmentId}/reschedule`,
    body
  );
  return res.data;
};


export const rescheduleAppointment = async (data: {
  appointmentId: string;
  newDate: string;
  newTimeSlotId: string;
  reason?: string;
}) => {
  try {
    const normalizedNewDate = ensureHasTimezone(data.newDate)
      ? data.newDate
      : buildZonedISO(data.newDate, "00:00");
    assertValidISO(normalizedNewDate);

    const res = await axiosClient.patch<DataResponse<any>>("/appointment/reschedule", {
      ...data,
      newDate: normalizedNewDate,
    });
    console.log("[Axios] Reschedule appointment:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to reschedule appointment:", e);
    throw e;
  }
};

export const cancelAppointment = async (appointmentId: string, reason?: string) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>("/appointment/cancel", {
      appointmentId,
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    });
    console.log("[Axios] Cancel appointment:", res.data);
    if (res.data?.code && res.data.code !== "SUCCESS") {
      throw { response: { data: res.data } };
    }
    return res.data;
  } catch (e) {
    console.error("Failed to cancel appointment:", e);
    throw e;
  }
};

export const getCompletedAppointmentsByDoctor = async (params: {
  page?: number;
  limit?: number;
  keyword?: string;
  patientId?: string;
}) => {
  try {
    const res = await axiosClient.get<
      DataResponse<{
        items: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(`/appointment/completed/doctor`, {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        keyword: params.keyword || undefined,
        patientId: params.patientId || undefined,
      },
    });

    console.log(
      "[Axios] Get completed appointments by doctor",
      res.data
    );

    return res.data;
  } catch (e) {
    console.error("❌ Failed to fetch completed appointments", e);
    throw e;
  }
};






