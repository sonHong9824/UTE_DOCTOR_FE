import { NotificationRecipientRole } from "@/types/notification.dto";

type NotificationData = Record<string, unknown>;

export type RenderableNotification = {
  type?: string;
  recipientRole?: NotificationRecipientRole | string;
  titleKey?: string;
  messageKey?: string;
  templateKey?: string;
  title?: string;
  message?: string;
  data?: unknown;
  details?: unknown;
};

export type RenderedNotification = {
  title: string;
  message: string;
};

const DEFAULT_LOCALE = "vi-VN";
const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
const MIN_SANE_EPOCH_MS = Date.UTC(2020, 0, 1);
const MAX_SANE_EPOCH_MS = Date.UTC(2100, 0, 1);

const notificationTypeAliasMap: Record<string, string> = {
  coin_expiry_reminder: "COIN_EXPIRY_REMINDER",
  wallet_expired: "COIN_EXPIRY_REMINDER",
  coin_expired: "COIN_EXPIRY_REMINDER",
  appointment_success: "APPOINTMENT_SUCCESS",
  appointment_booking_success: "APPOINTMENT_SUCCESS",
  appointment_cancelled: "APPOINTMENT_CANCELLED",
  appointment_no_show: "APPOINTMENT_NO_SHOW",
  appointment_rescheduled: "APPOINTMENT_RESCHEDULED",
  payment_success: "PAYMENT_SUCCESS",
  payment_update: "PAYMENT_SUCCESS",
  assignment_task_created: "ASSIGNMENT_TASK_CREATED",
  assignment_task_reminder: "ASSIGNMENT_TASK_REMINDER",
  assignment_task_expired: "ASSIGNMENT_TASK_EXPIRED",
  appointment_doctor_assigned: "APPOINTMENT_DOCTOR_ASSIGNED",
  doctor_assigned_appointment: "APPOINTMENT_DOCTOR_ASSIGNED",
  assigned_appointment: "APPOINTMENT_DOCTOR_ASSIGNED",
};

const cleanDisplayText = (text: string): string => {
  return text
    .replace(/\s+(tại|tai|at)\s+(undefined|null)\b[.,]?/giu, "")
    .replace(/\b(undefined|null)\b/giu, "")
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\./g, ".")
    .trim();
};

const isKeyLikeText = (text?: string): boolean => {
  const trimmed = String(text ?? "").trim();
  return Boolean(trimmed) && /^[a-z0-9_.:-]+$/i.test(trimmed) && trimmed.includes(".");
};

const asData = (value: unknown): NotificationData | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as NotificationData;
};

const normalizeKey = (value: unknown): string => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

const normalizeNotificationType = (notification: RenderableNotification): string => {
  const data = asData(notification.data) ?? asData(notification.details);
  const rawType =
    notification.type ??
    data?.type ??
    notification.messageKey ??
    notification.titleKey ??
    notification.templateKey;

  const rawString = String(rawType ?? "").trim();
  if (!rawString) {
    return "";
  }

  if (/^[A-Z0-9_]+$/.test(rawString)) {
    return rawString;
  }

  return notificationTypeAliasMap[normalizeKey(rawString)] ?? rawString.toUpperCase();
};

const normalizeRole = (role: unknown): string => {
  return String(role ?? "").trim().toUpperCase();
};

const readString = (data: NotificationData, keys: string[]): string => {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed && !/^(undefined|null)$/i.test(trimmed)) {
        return trimmed;
      }
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
};

const normalizeEpochMs = (value: unknown): number | null => {
  if (value instanceof Date) {
    const time = value.getTime();
    return isSaneEpoch(time) ? time : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^\d{10,13}$/.test(trimmed)) {
      return normalizeEpochMs(Number(trimmed));
    }

    const parsed = Date.parse(trimmed);
    return isSaneEpoch(parsed) ? parsed : null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const epochMs = value < 1_000_000_000_000 ? value * 1000 : value;
  return isSaneEpoch(epochMs) ? epochMs : null;
};

const isSaneEpoch = (epochMs: number): boolean => {
  return Number.isFinite(epochMs) && epochMs >= MIN_SANE_EPOCH_MS && epochMs <= MAX_SANE_EPOCH_MS;
};

const formatDate = (value: unknown): string => {
  const epochMs = normalizeEpochMs(value);
  if (!epochMs) {
    return "";
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: DEFAULT_TIME_ZONE,
  }).format(new Date(epochMs));
};

const formatTime = (value: unknown): string => {
  const epochMs = normalizeEpochMs(value);
  if (!epochMs) {
    return "";
  }

  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DEFAULT_TIME_ZONE,
  }).format(new Date(epochMs));
};

const formatDateTime = (value: unknown): string => {
  const date = formatDate(value);
  const time = formatTime(value);
  if (!date) {
    return "";
  }

  return time ? `${date} ${time}` : date;
};

const readFirstDate = (data: NotificationData, keys: string[]): string => {
  for (const key of keys) {
    const formatted = formatDate(data[key]);
    if (formatted) {
      return formatted;
    }
  }

  return "";
};

const readFirstDateTime = (data: NotificationData, keys: string[]): string => {
  for (const key of keys) {
    const formatted = formatDateTime(data[key]);
    if (formatted) {
      return formatted;
    }
  }

  return "";
};

const appointmentDateKeys = [
  "appointmentDate",
  "scheduledAt",
  "newScheduledAt",
  "date",
  "bookingDate",
];

const appointmentTimeKeys = ["timeRange", "timeSlotLabel", "timeSlot", "appointmentTime"];

const buildAppointmentWhen = (data: NotificationData): string => {
  const date = readFirstDate(data, appointmentDateKeys);
  const time = readString(data, appointmentTimeKeys);

  if (date && time) {
    return ` vào ngày ${date} lúc ${time}`;
  }

  if (date) {
    return ` vào ngày ${date}`;
  }

  if (time) {
    return ` lúc ${time}`;
  }

  return "";
};

const buildHospital = (data: NotificationData): string => {
  const hospitalName = readString(data, ["hospitalName", "hospital"]);
  return hospitalName ? ` tại ${hospitalName}` : "";
};

const buildDoctor = (data: NotificationData): string => {
  const doctorName = readString(data, ["doctorName", "doctorFullName", "doctor"]);
  return doctorName ? ` với bác sĩ ${doctorName}` : "";
};

const buildPatient = (data: NotificationData): string => {
  const patientName = readString(data, ["patientName", "patientFullName"]);
  return patientName ? ` cho bệnh nhân ${patientName}` : "";
};

const buildDeadline = (data: NotificationData): string => {
  const deadline = readFirstDateTime(data, ["deadlineAt", "expiresAt"]);
  return deadline ? ` Hạn xử lý: ${deadline}.` : "";
};

const buildSpecialty = (data: NotificationData): string => {
  const specialty = readString(data, ["specialty", "specialtyName"]);
  return specialty ? ` chuyên khoa ${specialty}` : "";
};

const buildReason = (data: NotificationData): string => {
  const reason = readString(data, ["reasonForAppointment", "reason"]);
  return reason ? ` Lý do khám: ${reason}.` : "";
};

const renderStructuredNotification = (
  type: string,
  role: string,
  data: NotificationData
): RenderedNotification | null => {
  const when = buildAppointmentWhen(data);
  const hospital = buildHospital(data);
  const doctor = buildDoctor(data);
  const patient = buildPatient(data);

  if (type === "APPOINTMENT_SUCCESS") {
    if (role === "DOCTOR") {
      return {
        title: "Lịch khám mới",
        message: `Bạn có lịch khám mới${patient}${when}${hospital}.`,
      };
    }

    if (!role || role === "PATIENT") {
      return {
        title: "Đặt lịch khám thành công",
        message: `Bạn đã đặt lịch khám thành công${when}${hospital}.`,
      };
    }
  }

  if (type === "APPOINTMENT_DOCTOR_ASSIGNED") {
    if (role === "DOCTOR") {
      return {
        title: "Lịch khám được phân công",
        message: `Bạn được phân công lịch khám${patient}${when}${hospital}.`,
      };
    }

    if (!role || role === "PATIENT") {
      return {
        title: "Đã phân công bác sĩ",
        message: `Lịch khám của bạn đã được phân công${doctor}${when}${hospital}.`,
      };
    }
  }

  if (type === "PAYMENT_SUCCESS" && (!role || role === "PATIENT")) {
    const orderId = readString(data, ["orderId"]);
    const paidAt = readFirstDateTime(data, ["paidAt"]);
    const orderSegment = orderId ? ` cho đơn ${orderId}` : "";
    const paidAtSegment = paidAt ? ` lúc ${paidAt}` : "";

    return {
      title: "Thanh toán thành công",
      message: `Thanh toán của bạn đã được ghi nhận thành công${orderSegment}${paidAtSegment}.`,
    };
  }

  if (type === "APPOINTMENT_CANCELLED") {
    const reasonCode = readString(data, ["reasonCode", "cancellationReasonCode"]);
    if (reasonCode === "ASSIGNMENT_TIMEOUT") {
      const refundAmount = readString(data, ["refundAmount"]);
      const shouldRefund = data.shouldRefund === true;
      const refundSegment = shouldRefund && refundAmount
        ? ` Phí giữ chỗ đã được hoàn vào ví credit: ${refundAmount}.`
        : "";

      if (role === "DOCTOR") {
        return {
          title: "Lịch khám tự động hủy do quá hạn phân công",
          message: "Hệ thống không thể phân công bác sĩ trong thời gian quy định nên lịch khám đã được tự động hủy.",
        };
      }

      if (!role || role === "PATIENT") {
        return {
          title: "Không thể phân công bác sĩ đúng hạn",
          message: `Hệ thống không thể phân công bác sĩ trong thời gian quy định nên lịch khám của bạn đã được tự động hủy.${refundSegment}`,
        };
      }
    }

    const reason = readString(data, ["reason"]);
    const reasonSegment = reason ? ` Lý do: ${reason}.` : "";

    if (role === "DOCTOR") {
      return {
        title: "Lịch khám đã bị hủy",
        message: `Lịch khám${patient}${when}${hospital} đã bị hủy.${reasonSegment}`,
      };
    }

    if (!role || role === "PATIENT") {
      return {
        title: "Lịch khám đã bị hủy",
        message: `Lịch khám của bạn${when}${hospital} đã bị hủy.${reasonSegment}`,
      };
    }
  }

  if (type === "APPOINTMENT_NO_SHOW") {
    const noShowAt = readFirstDateTime(data, ["noShowAt"]);
    const recordedAt = noShowAt ? ` Trạng thái được ghi nhận lúc ${noShowAt}.` : "";

    if (role === "DOCTOR") {
      return {
        title: "Bệnh nhân không đến khám",
        message: `Lịch khám${patient}${when}${hospital} được ghi nhận không đến khám do bệnh nhân không check-in trong thời gian quy định.${recordedAt}`,
      };
    }

    if (!role || role === "PATIENT") {
      return {
        title: "Lịch khám được ghi nhận không đến",
        message: `Lịch khám của bạn${when}${doctor}${hospital} đã được ghi nhận là không đến khám.${recordedAt}`,
      };
    }
  }

  if (type === "APPOINTMENT_RESCHEDULED") {
    if (role === "DOCTOR") {
      return {
        title: "Lịch khám đã đổi thời gian",
        message: `Lịch khám${patient} đã được đổi lịch${when}${hospital}.`,
      };
    }

    if (!role || role === "PATIENT") {
      return {
        title: "Lịch khám đã đổi thời gian",
        message: `Lịch khám của bạn đã được đổi lịch${when}${hospital}.`,
      };
    }
  }

  if (type === "ASSIGNMENT_TASK_CREATED" && (!role || role === "RECEPTIONIST")) {
    return {
      title: "Yêu cầu phân công mới",
      message: `Có yêu cầu phân công bác sĩ mới${buildSpecialty(data)}.${buildReason(data)}${buildDeadline(data)}`,
    };
  }

  if (type === "ASSIGNMENT_TASK_REMINDER" && (!role || role === "RECEPTIONIST")) {
    const reminderCount = readString(data, ["reminderCount"]);
    const reminderSegment = reminderCount ? ` Lần nhắc: ${reminderCount}.` : "";

    return {
      title: "Nhắc xử lý yêu cầu phân công",
      message: `Yêu cầu phân công đang gần hết hạn.${reminderSegment}${buildDeadline(data)}`,
    };
  }

  if (type === "ASSIGNMENT_TASK_EXPIRED" && (!role || role === "RECEPTIONIST")) {
    const reasonCode = readString(data, ["reasonCode"]);
    if (reasonCode === "ASSIGNMENT_TIMEOUT") {
      return {
        title: "Yêu cầu phân công đã quá hạn",
        message: `Yêu cầu phân công đã quá hạn; lịch khám đã được tự động hủy.${buildDeadline(data)}`,
      };
    }

    return {
      title: "Yêu cầu phân công đã quá hạn",
      message: `Yêu cầu phân công đã quá hạn và cần xử lý thủ công.${buildDeadline(data)}`,
    };
  }

  if (type === "COIN_EXPIRY_REMINDER" && (!role || role === "PATIENT")) {
    const amount = readString(data, ["amount", "coinAmount"]);
    const expiresAt = readFirstDate(data, ["expiresAt"]);
    const amountSegment = amount ? `${amount} coin` : "Coin của bạn";
    const expiresAtSegment = expiresAt ? ` vào ngày ${expiresAt}` : "";

    return {
      title: "Thông báo coin sắp hết hạn",
      message: `${amountSegment} sắp hết hạn${expiresAtSegment}. Vui lòng sử dụng trước khi hết hạn.`,
    };
  }

  return null;
};

export const normalizeLegacyNotificationMessage = (message: string): string => {
  if (!message) {
    return "";
  }

  const normalized = message.replace(
    /\b(ngày|ngay|date|appointmentDate|scheduledAt|bookingDate)\s*[:=-]?\s*(\d{10,13})\b/giu,
    (fullMatch: string, label: string, epochRaw: string) => {
      const isDateTimeKey = /^(scheduledAt)$/i.test(label);
      const formatted = isDateTimeKey ? formatDateTime(Number(epochRaw)) : formatDate(Number(epochRaw));

      if (!formatted) {
        return fullMatch;
      }

      return `${label} ${formatted}`;
    }
  );

  return cleanDisplayText(normalized);
};

export const renderNotification = (
  notification: RenderableNotification
): RenderedNotification => {
  const type = normalizeNotificationType(notification);
  const role = normalizeRole(notification.recipientRole);
  const data = asData(notification.data) ?? asData(notification.details);
  const backendTitle =
    typeof notification.title === "string" && !isKeyLikeText(notification.title)
      ? cleanDisplayText(normalizeLegacyNotificationMessage(notification.title))
      : "";
  const backendMessage =
    typeof notification.message === "string" && !isKeyLikeText(notification.message)
      ? cleanDisplayText(normalizeLegacyNotificationMessage(notification.message))
      : "";

  const structured = data ? renderStructuredNotification(type, role, data) : null;
  if (structured) {
    return {
      title: backendTitle || cleanDisplayText(structured.title),
      message: backendMessage || cleanDisplayText(normalizeLegacyNotificationMessage(structured.message)),
    };
  }

  const fallbackTitle =
    backendTitle ||
    (!isKeyLikeText(notification.titleKey) ? notification.titleKey : "") ||
    (!isKeyLikeText(notification.templateKey) ? notification.templateKey : "") ||
    "Thông báo";
  const fallbackMessage = backendMessage || "";

  return {
    title: cleanDisplayText(normalizeLegacyNotificationMessage(fallbackTitle)),
    message: normalizeLegacyNotificationMessage(fallbackMessage),
  };
};
