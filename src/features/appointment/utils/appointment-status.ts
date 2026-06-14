import { AppointmentStatus } from "@/enum/appointment-status.enum";

// Broad-appointment routing label. A broad appointment stays appointmentStatus=PENDING
// with assignmentStatus=AWAITING_ASSIGNMENT until a receptionist assigns a doctor/slot.
export const AWAITING_ASSIGNMENT_LABEL = "Đang chờ lễ tân phân công bác sĩ";

export const isAwaitingAssignment = (assignmentStatus?: string): boolean =>
  assignmentStatus === "AWAITING_ASSIGNMENT";

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
