export const RESCHEDULE_APPOINTMENT_BLOCKED_REASON_MESSAGES = {
  VISIT_ALREADY_STARTED: "Không thể đổi lịch vì lượt khám đã bắt đầu.",
  VISIT_COMPLETED: "Không thể đổi lịch vì lượt khám đã hoàn tất.",
  APPOINTMENT_TIME_PASSED: "Không thể đổi lịch vì thời gian khám đã qua.",
  MEDICAL_ENCOUNTER_EXISTS: "Không thể đổi lịch vì hồ sơ khám đã được tạo.",
  BILLING_EXISTS: "Không thể đổi lịch vì hóa đơn đã được tạo.",
  PAYMENT_EXISTS: "Không thể đổi lịch vì đã phát sinh thanh toán.",
  APPOINTMENT_NOT_RESCHEDULABLE: "Lịch hẹn hiện tại không thể đổi lịch.",
  SLOT_UNAVAILABLE: "Khung giờ đã được đặt. Vui lòng chọn khung giờ khác.",
  INVALID_SCHEDULE: "Thời gian khám không hợp lệ.",
  SLOT_DOCTOR_MISMATCH: "Khung giờ không thuộc bác sĩ phụ trách lịch hẹn. Vui lòng chọn lại.",
  APPOINTMENT_DOCTOR_NOT_ASSIGNED: "Lịch hẹn chưa được phân công bác sĩ, không thể đổi lịch.",
} as const;

export type RescheduleAppointmentBlockedReason =
  keyof typeof RESCHEDULE_APPOINTMENT_BLOCKED_REASON_MESSAGES;

const BLOCKED_REASON_KEYS = Object.keys(
  RESCHEDULE_APPOINTMENT_BLOCKED_REASON_MESSAGES
) as RescheduleAppointmentBlockedReason[];

const findBlockedReason = (
  value: unknown
): RescheduleAppointmentBlockedReason | undefined => {
  if (!value) return undefined;

  if (typeof value === "string") {
    return BLOCKED_REASON_KEYS.find((reason) => value.includes(reason));
  }

  if (Array.isArray(value)) {
    return value.map(findBlockedReason).find(Boolean);
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(findBlockedReason)
      .find(Boolean);
  }

  return undefined;
};

const getErrorPayload = (error: unknown): Record<string, unknown> | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const response = (error as { response?: { data?: unknown } }).response;
  return response?.data && typeof response.data === "object"
    ? (response.data as Record<string, unknown>)
    : undefined;
};

const getErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
};

export const isSlotUnavailableError = (error: unknown): boolean => {
  const payload = getErrorPayload(error);
  return findBlockedReason(payload) === "SLOT_UNAVAILABLE";
};

export const getRescheduleAppointmentErrorMessage = (error: unknown): string => {
  const payload = getErrorPayload(error);
  const blockedReason = findBlockedReason(payload);

  if (blockedReason) {
    return RESCHEDULE_APPOINTMENT_BLOCKED_REASON_MESSAGES[blockedReason];
  }

  return typeof payload?.message === "string"
    ? payload.message
    : getErrorMessage(error) || "Không thể đổi lịch. Vui lòng thử lại.";
};
