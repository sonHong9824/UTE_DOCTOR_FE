import { AppointmentStatus } from "@/enum/appointment-status.enum";

export const AWAITING_ASSIGNMENT_LABEL = "Đang chờ phân bác sĩ";
export const PAID_AWAITING_ASSIGNMENT_LABEL = "Đã thanh toán, đang chờ phân bác sĩ";
export const PAYMENT_FAILED_OR_EXPIRED_LABEL = "Thanh toán thất bại hoặc đã hết hạn";
export const ASSIGNMENT_TIMEOUT_LABEL = "Hệ thống không thể phân bác sĩ kịp thời";

type CombinedAppointmentStatusInput = {
  appointmentStatus?: string | AppointmentStatus | null;
  assignmentStatus?: string | null;
  depositStatus?: string | null;
  paymentCategory?: string | null;
  doctorId?: unknown;
  doctor?: unknown;
  timeSlot?: unknown;
  timeSlotId?: unknown;
  slot?: unknown;
  reasonCode?: string | null;
  cancellationReasonCode?: string | null;
};

export const isAwaitingAssignment = (assignmentStatus?: string): boolean =>
  assignmentStatus === "AWAITING_ASSIGNMENT";

const hasValue = (value: unknown): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
};

export const hasAssignedDoctorOrSlot = (appointment?: CombinedAppointmentStatusInput | null): boolean =>
  Boolean(
    hasValue(appointment?.doctorId) ||
      hasValue(appointment?.doctor) ||
      hasValue(appointment?.timeSlot) ||
      hasValue(appointment?.timeSlotId) ||
      hasValue(appointment?.slot)
  );

export const isPaidAwaitingAssignment = (
  appointment?: CombinedAppointmentStatusInput | null
): boolean => {
  if (!appointment) return false;

  const isDichVu =
    appointment.paymentCategory === "DICH_VU" ||
    (!appointment.paymentCategory && appointment.depositStatus === "PAID");

  return (
    appointment.appointmentStatus === AppointmentStatus.PENDING &&
    appointment.depositStatus === "PAID" &&
    appointment.assignmentStatus === "AWAITING_ASSIGNMENT" &&
    isDichVu &&
    !hasAssignedDoctorOrSlot(appointment)
  );
};

export const isAssignmentTimeoutCancellation = (
  appointment?: CombinedAppointmentStatusInput | null
): boolean =>
  appointment?.appointmentStatus === AppointmentStatus.CANCELLED &&
  (appointment.reasonCode === "ASSIGNMENT_TIMEOUT" ||
    appointment.cancellationReasonCode === "ASSIGNMENT_TIMEOUT");

export const getCombinedAppointmentStatusLabel = (
  appointment?: CombinedAppointmentStatusInput | null
): string | null => {
  if (!appointment) return null;

  if (isPaidAwaitingAssignment(appointment)) {
    return PAID_AWAITING_ASSIGNMENT_LABEL;
  }

  if (
    appointment.appointmentStatus === AppointmentStatus.PENDING &&
    appointment.assignmentStatus === "AWAITING_ASSIGNMENT" &&
    !hasAssignedDoctorOrSlot(appointment)
  ) {
    return AWAITING_ASSIGNMENT_LABEL;
  }

  if (
    appointment.appointmentStatus === AppointmentStatus.FAILED &&
    appointment.depositStatus === "FAILED"
  ) {
    return PAYMENT_FAILED_OR_EXPIRED_LABEL;
  }

  if (isAssignmentTimeoutCancellation(appointment)) {
    return ASSIGNMENT_TIMEOUT_LABEL;
  }

  return null;
};

export const getCombinedAppointmentStatusClass = (
  appointment?: CombinedAppointmentStatusInput | null
): string => {
  if (
    appointment?.appointmentStatus === AppointmentStatus.FAILED ||
    isAssignmentTimeoutCancellation(appointment)
  ) {
    return "border-rose-200 bg-rose-50 text-rose-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
};

export const getAppointmentStatusClass = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case AppointmentStatus.CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case AppointmentStatus.FAILED:
      return "bg-rose-100 text-rose-800";
    case AppointmentStatus.COMPLETED:
      return "bg-green-100 text-green-800";
    case AppointmentStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case AppointmentStatus.RESCHEDULED:
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getAppointmentStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.PENDING:
      return "Chờ xác nhận";
    case AppointmentStatus.CONFIRMED:
      return "Đã xác nhận";
    case AppointmentStatus.FAILED:
      return "Thanh toán thất bại";
    case AppointmentStatus.COMPLETED:
      return "Đã hoàn thành";
    case AppointmentStatus.CANCELLED:
      return "Đã hủy";
    case AppointmentStatus.RESCHEDULED:
      return "Đã hoãn";
    default:
      return status;
  }
};
