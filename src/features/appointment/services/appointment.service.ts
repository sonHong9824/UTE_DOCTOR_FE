import {
    BroadBookingPayload,
    bookAppointment,
    bookBroadAppointment,
    cancelAppointment,
    getAppointmentById,
    getAppointmentDepositStatus,
    getDoctorBySpecialty,
    getSpecialties,
    getTimeSlotsByDoctorAndDate,
    rescheduleAppointmentById,
} from "@/apis/appointment/appointment.api";
import { getTimeslot } from "@/apis/timeslot/timeslot.api";
import { getWalletBalance } from "@/apis/wallet/wallet.api";
import { TimeSlotStatusEnum } from "@/enum/timeslot-status.enum";
import {
    AppointmentBookingPayload,
    AppointmentBookingResult,
    AppointmentDetail,
    DoctorOption,
    ReschedulePayload,
    SpecialtyOption,
    WalletBalanceData,
} from "@/features/appointment/types/appointment.types";

export const appointmentService = {
  async book(payload: AppointmentBookingPayload): Promise<AppointmentBookingResult> {
    return bookAppointment(payload);
  },

  // Broad booking: no doctor/slot. Backend creates a PENDING appointment
  // (assignmentStatus = AWAITING_ASSIGNMENT). DICH_VU assignment work opens after deposit success.
  async bookBroad(payload: BroadBookingPayload): Promise<AppointmentBookingResult> {
    return bookBroadAppointment(payload);
  },

  async getAppointmentById(appointmentId: string): Promise<AppointmentDetail> {
    const res = await getAppointmentById(appointmentId);
    return res?.data as AppointmentDetail;
  },

  async getDepositStatus(appointmentId: string) {
    return getAppointmentDepositStatus(appointmentId);
  },

  async cancel(appointmentId: string, reason?: string) {
    return cancelAppointment(appointmentId, reason);
  },

  async reschedule(payload: ReschedulePayload) {
    return rescheduleAppointmentById(payload.appointmentId, {
      appointmentDate: payload.newDate,
      timeSlotId: payload.newTimeSlotId,
      reason: payload.reason,
    });
  },

  async getSpecialties() {
    const res = await getSpecialties();
    return (res?.data ?? []) as SpecialtyOption[];
  },

  async getDoctorsBySpecialty(params: { specialtyId: string; keyword: string }) {
    const res = await getDoctorBySpecialty(params);
    return (res?.data ?? []) as DoctorOption[];
  },

  async getTimeSlotsByDoctorAndDate(params: { doctorId: string; date: string }) {
    const res = await getTimeSlotsByDoctorAndDate({
      ...params,
      status: TimeSlotStatusEnum.AVAILABLE,
    });

    return res?.data ?? [];
  },

  async getAllTimeSlots() {
    const res = await getTimeslot();
    return res?.data ?? [];
  },

  async getWalletBalance() {
    const res = await getWalletBalance();
    return {
      balance: res?.data?.balance ?? 0,
      coinBalance: res?.data?.coinBalance ?? res?.data?.balance ?? 0,
      creditBalance: res?.data?.creditBalance ?? 0,
    } satisfies WalletBalanceData;
  },
};
