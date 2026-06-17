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

// Patient chooses between a normal booking (doctor + slot selected up front) and a
// broad booking (no doctor/slot — a receptionist assigns one later).
export type BookingStrategy = "NORMAL" | "BROAD";

export type BookingLifecycleState =
  | "IDLE"
  | "SUBMITTING"
  | "PENDING_PAYMENT"
  | "PAYMENT_RETRY"
  | "PAYMENT_TIMEOUT"
  | "CONFIRMED"
  // Broad booking submitted (BHYT) or its deposit paid (DICH_VU): the appointment is
  // created but stays PENDING/AWAITING_ASSIGNMENT until a receptionist assigns a doctor.
  | "AWAITING_ASSIGNMENT"
  | "FAILED";

export type AppointmentBookingResult = DataResponse<{
  appointmentId?: string;
  paymentUrl?: string;
  depositStatus?: AppointmentDepositStatus;
  depositAmount?: number;
  depositPaymentId?: string;
  depositPaidAmount?: number;
  depositPaidAt?: number | null;
  // Present only for broad bookings (broadBooking: true).
  assignmentTaskId?: string;
  assignmentStatus?: AssignmentStatus;
} | null>;

export type AppointmentDepositStatusResult = {
  appointmentId: string;
  appointmentStatus: AppointmentStatus;
  paymentCategory: "BHYT" | "DICH_VU";
  depositStatus: AppointmentDepositStatus;
  depositAmount: number;
  depositPaidAmount: number;
  depositPaidAt: number | null;
  depositPaymentId: string | null;
  paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | null;
  paymentUrl: null;
  isConfirmed: boolean;
  isTerminal: boolean;
};

export type AssignmentStatus = "NONE" | "AWAITING_ASSIGNMENT" | "ASSIGNED";

export type AppointmentDetail = {
  _id: string;
  appointmentStatus: AppointmentStatus;
  assignmentStatus?: AssignmentStatus;
  date?: string;
  patientEmail?: string;
  paymentCategory?: "BHYT" | "DICH_VU";
  depositStatus?: AppointmentDepositStatus;
  depositAmount?: number;
  depositPaidAmount?: number;
  depositPaidAt?: string | null;
  reasonCode?: string;
  cancellationReasonCode?: string;
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
  visitStatus?: string;
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
  assignmentStatus?: AssignmentStatus;
  date: string;
  doctorId?: {
    profileId?: {
      name?: string;
    };
  };
  doctor?: unknown;
  timeSlot?: unknown;
  timeSlotId?: string | null;
  slot?: unknown;
  serviceType?: string;
  appointmentStatus?: string;
  paymentCategory?: "BHYT" | "DICH_VU";
  visitStatus?: string;
  reasonForAppointment?: string;
  reasonCode?: string;
  cancellationReasonCode?: string;
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
