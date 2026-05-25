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
  paymentMethod: "VNPAY" | "OFFLINE";
  reasonForAppointment: string;
};

export type AppointmentBookingPayload = AppointmentBookingFormValues & {
  bookingDate?: string;
};

export type BookingLifecycleState =
  | "IDLE"
  | "SUBMITTING"
  | "PENDING_PAYMENT"
  | "PAYMENT_RETRY"
  | "PAYMENT_TIMEOUT"
  | "CONFIRMED"
  | "FAILED";

export type AppointmentBookingResult = DataResponse<{
  appointmentId?: string;
  paymentUrl?: string;
  depositStatus?: AppointmentDepositStatus;
  depositAmount?: number;
  depositPaymentId?: string;
  depositPaidAmount?: number;
  depositPaidAt?: string | null;
} | null>;

export type AppointmentDetail = {
  _id: string;
  appointmentStatus: AppointmentStatus;
  date?: string;
  patientEmail?: string;
  depositStatus?: AppointmentDepositStatus;
  depositAmount?: number;
  depositPaidAmount?: number;
  depositPaidAt?: string | null;
};

export type AppointmentDepositStatus = "PENDING" | "PAID" | "NOT_REQUIRED" | "FAILED" | "REFUNDED" | "FORFEITED";

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
  depositStatus?: AppointmentDepositStatus;
  depositAmount?: number;
  depositPaidAmount?: number;
  depositPaidAt?: string | null;
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
  depositStatus?: AppointmentDepositStatus;
  depositAmount?: number;
  depositPaidAmount?: number;
  depositPaidAt?: string | null;
};

export type AppointmentBookingState = {
  formData: AppointmentBookingFormValues;
  loading: boolean;
  response: unknown;
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
