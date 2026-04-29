import { AppointmentStatus } from "@/enum/appointment-status.enum";
import { DataResponse } from "@/types/apiDTO";
import { TimeSlotDto } from "@/types/timeslot.dto";

export type DoctorOption = {
  id: string;
  name: string;
  email: string;
  specialtyId: string;
};

export type DoctorPayload = {
  id: string;
  name: string;
  email: string;
};

export type SpecialtyOption = {
  _id: string;
  name: string;
};

export type WalletBalanceData = {
  balance: number;
  coinBalance: number;
  creditBalance: number;
};

export type AppointmentBookingFormValues = {
  hospitalName: string;
  specialty: string | null;
  appointmentDate: string;
  timeSlotId: string;
  doctor: DoctorPayload | null;
  serviceType: string;
  visitType: "OFFLINE";
  paymentCategory: "BHYT" | "DICH_VU";
  depositAmount?: number;
  paymentMethod: "ONLINE" | "VNPAY" | "CREDIT" | "OFFLINE";
  amount?: number;
  reasonForAppointment: string;
  useCoin?: boolean;
  coinsToUse?: number;
};

export type AppointmentBookingPayload = AppointmentBookingFormValues & {
  bookingDate?: string;
};

export type BookingLifecycleState =
  | "IDLE"
  | "SUBMITTING"
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "FAILED";

export type AppointmentBookingResult = DataResponse<{
  appointmentId?: string;
  paymentUrl?: string;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
} | null>;

export type AppointmentDetail = {
  _id: string;
  appointmentStatus: AppointmentStatus;
  date?: string;
  patientEmail?: string;
};

export type ReschedulePayload = {
  appointmentId: string;
  newDate: string;
  newTimeSlotId: string;
  reason?: string;
};

export type AppointmentCardModel = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  appointmentStatus: AppointmentStatus;
  consultationFee: number;
  doctorName: string;
  specialization: string;
  doctorId: string;
};

export type AppointmentListModel = {
  _id?: string;
  id?: string;
  date: string;
  doctorId?: {
    profileId?: {
      name?: string;
    };
  };
  serviceType?: string;
  appointmentStatus?: string;
  reasonForAppointment?: string;
  consultationFee?: number;
};

export type AppointmentBookingState = {
  formData: AppointmentBookingFormValues;
  loading: boolean;
  response: any;
  showSuccessModal: boolean;
  successMessage: string;
  showErrorModal: boolean;
  errorMessage: string;
  timeSlots: TimeSlotDto[];
  specialtySearchTerm: string;
  specialtySuggestions: SpecialtyOption[];
  doctorSearchTerm: string;
  doctorSuggestions: DoctorOption[];
  isDoctorFocused: boolean;
  showSpecialtySuggestions: boolean;
  bookingLifecycleState: BookingLifecycleState;
  pendingAppointmentId: string | null;
  paymentUrl: string | null;
};
