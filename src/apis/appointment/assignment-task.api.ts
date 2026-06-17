import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export type AssignmentTaskStatus =
  | "PENDING"
  | "ASSIGNED"
  | "COMPLETED"
  | "EXPIRED"
  | "ESCALATED"
  | "CANCELLED";

export interface AssignmentTaskHistoryEntry {
  at: number;
  from: string;
  to: string;
  by?: string;
  note?: string;
}

export interface AssignmentTask {
  _id: string;
  appointmentId: string;
  status: AssignmentTaskStatus;
  specialty?: string;
  reasonForAppointment?: string;
  patientEmail?: string;
  priority?: string;
  deadlineAt: number;
  acceptedByReceptionistId?: string | null;
  acceptedAt?: number | null;
  completedAt?: number | null;
  reminderCount?: number;
  history?: AssignmentTaskHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentTaskListResult {
  items: AssignmentTask[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AssignDoctorSlotPayload {
  doctorId: string;
  timeSlotId: string;
  appointmentDate: string; // ISO 8601 with timezone
}

export const listAssignmentTasks = async (params: {
  status?: string;
  specialty?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const res = await axiosClient.get<DataResponse<AssignmentTaskListResult>>(
    "/appointment/assignment-tasks",
    { params }
  );
  return res.data;
};

export const getAssignmentTask = async (id: string) => {
  const res = await axiosClient.get<DataResponse<AssignmentTask>>(
    `/appointment/assignment-tasks/${id}`
  );
  return res.data;
};

export const acceptAssignmentTask = async (id: string) => {
  const res = await axiosClient.post<
    DataResponse<{ taskId: string; status: string; acceptedByReceptionistId: string; acceptedAt: number }>
  >(`/appointment/assignment-tasks/${id}/accept`, {});
  return res.data;
};

export const releaseAssignmentTask = async (id: string, reason?: string) => {
  const res = await axiosClient.post<DataResponse<{ taskId: string; status: string }>>(
    `/appointment/assignment-tasks/${id}/release`,
    reason?.trim() ? { reason: reason.trim() } : {}
  );
  return res.data;
};

export const assignAssignmentTask = async (id: string, payload: AssignDoctorSlotPayload) => {
  const res = await axiosClient.post<
    DataResponse<{ appointmentId: string; doctorId: string; timeSlotId: string; scheduledAt: number; status: string }>
  >(`/appointment/assignment-tasks/${id}/assign`, payload);
  return res.data;
};

// Backend blocked operations return { code:"ERROR", message, data:{ blockedReason } }
// with an HTTP 4xx, so axios throws. Pull the canonical reason from the error.
export const extractBlockedReason = (error: unknown): string | undefined => {
  const data = (error as { response?: { data?: { data?: { blockedReason?: string } } } })?.response?.data;
  return data?.data?.blockedReason;
};

const BLOCKED_REASON_MESSAGES: Record<string, string> = {
  TASK_NOT_FOUND: "Không tìm thấy yêu cầu phân công.",
  TASK_NOT_PENDING: "Yêu cầu không còn ở trạng thái chờ.",
  // Durable: another receptionist has already claimed (owns) the task — it is gone for us.
  TASK_ALREADY_ACCEPTED: "Yêu cầu đã được lễ tân khác nhận.",
  // Transient: another receptionist is processing this task right now (short Redis lock). Retry/refresh.
  TASK_LOCK_HELD: "Yêu cầu đang được lễ tân khác xử lý. Vui lòng thử lại.",
  TASK_NOT_ASSIGNED: "Yêu cầu chưa được nhận.",
  TASK_NOT_OWNED: "Bạn không phải người đã nhận yêu cầu này.",
  APPOINTMENT_NOT_ASSIGNABLE: "Lịch hẹn không thể phân công (đã có bác sĩ hoặc đã hủy).",
  SLOT_UNAVAILABLE: "Khung giờ đã được đặt. Vui lòng chọn khung khác.",
  SLOT_DOCTOR_MISMATCH: "Khung giờ không thuộc bác sĩ đã chọn.",
  INVALID_SCHEDULE: "Thời gian không hợp lệ.",
  DEPOSIT_NOT_PAID: "Bệnh nhân chưa thanh toán đặt cọc.",
};

export const getBlockedReasonMessage = (error: unknown, fallback: string): string => {
  const reason = extractBlockedReason(error);
  if (reason && BLOCKED_REASON_MESSAGES[reason]) return BLOCKED_REASON_MESSAGES[reason];
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  return reason ?? message ?? fallback;
};

// TASK_LOCK_HELD is a transient conflict (someone else is mid-action): keep the card, let the
// user retry, just refresh. TASK_ALREADY_ACCEPTED / TASK_NOT_PENDING are durable: the task has
// moved on, so the stale card should drop out after a refresh.
export const isTransientBlockedReason = (error: unknown): boolean =>
  extractBlockedReason(error) === "TASK_LOCK_HELD";
