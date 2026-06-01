export const CANCEL_APPOINTMENT_BLOCKED_REASON_MESSAGES = {
  VISIT_ALREADY_STARTED: "Không thể hủy lịch vì lượt khám đã bắt đầu.",
  VISIT_COMPLETED: "Không thể hủy lịch vì lượt khám đã hoàn tất.",
  MEDICAL_ENCOUNTER_EXISTS: "Không thể hủy lịch vì hồ sơ khám đã được tạo.",
  BILLING_EXISTS: "Không thể hủy lịch vì hóa đơn đã được tạo.",
  PAYMENT_EXISTS: "Không thể hủy lịch vì đã phát sinh thanh toán.",
  APPOINTMENT_NOT_CANCELABLE: "Lịch hẹn hiện tại không thể hủy.",
} as const;

export type CancelAppointmentBlockedReason = keyof typeof CANCEL_APPOINTMENT_BLOCKED_REASON_MESSAGES;

const BLOCKED_REASON_KEYS = Object.keys(
  CANCEL_APPOINTMENT_BLOCKED_REASON_MESSAGES
) as CancelAppointmentBlockedReason[];

const findBlockedReason = (value: unknown): CancelAppointmentBlockedReason | undefined => {
  if (!value) {
    return undefined;
  }

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
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const response = (error as { response?: { data?: unknown } }).response;
  return response?.data && typeof response.data === "object"
    ? (response.data as Record<string, unknown>)
    : undefined;
};

const getErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
};

export const getCancelAppointmentErrorMessage = (error: unknown): string => {
  const payload = getErrorPayload(error);
  const blockedReason = findBlockedReason(payload);

  if (blockedReason) {
    return CANCEL_APPOINTMENT_BLOCKED_REASON_MESSAGES[blockedReason];
  }

  return typeof payload?.message === "string"
    ? payload.message
    : getErrorMessage(error) || "Không thể hủy cuộc hẹn. Vui lòng thử lại.";
};
