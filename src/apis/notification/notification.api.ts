import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { Notification, NotificationMap, NotificationType } from "@/types/notification.dto";
import { PaginationQueryDto } from "@/types/pagination/pagination-query.dto";
import { PaginationResult } from "@/types/pagination/pagination-result.dto";
import { normalizeApiDateToLocalISO, normalizeEpochDateInText } from "@/utils/time.util";

const notificationTypeAliasMap: Record<string, NotificationType> = {
  coin_expiry_reminder: "COIN_EXPIRY_REMINDER",
  wallet_expired: "COIN_EXPIRY_REMINDER",
  coin_expired: "COIN_EXPIRY_REMINDER",
  appointment_success: "APPOINTMENT_SUCCESS",
  appointment_booking_success: "APPOINTMENT_SUCCESS",
  appointment_cancelled: "APPOINTMENT_CANCELLED",
  payment_success: "PAYMENT_SUCCESS",
  payment_update: "PAYMENT_SUCCESS",
};

const normalizeNotificationType = (notification: Notification): NotificationType | undefined => {
  const normalizedKey = String(notification.type ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return notificationTypeAliasMap[normalizedKey];
};

type NotificationDataNormalizerMap = {
  [K in NotificationType]: (data: NotificationMap[K]) => NotificationMap[K];
};

const normalizeDataDateValue = <T extends string | number | Date | null | undefined>(
  value: T
): T => {
  if (value === null || typeof value === "undefined") {
    return value;
  }

  const normalized = normalizeApiDateToLocalISO(value);
  if (!normalized) {
    return value;
  }

  return normalized as T;
};

const notificationDataNormalizers: NotificationDataNormalizerMap = {
  COIN_EXPIRY_REMINDER: (data) => ({
    ...data,
    expiresAt: normalizeDataDateValue(data.expiresAt),
    message: normalizeEpochDateInText(data.message ?? ""),
  }),
  APPOINTMENT_SUCCESS: (data) => ({
    ...data,
    date: normalizeDataDateValue(data.date),
  }),
  APPOINTMENT_CANCELLED: (data) => ({
    ...data,
    date: normalizeDataDateValue(data.date),
  }),
  PAYMENT_SUCCESS: (data) => data,
};

const normalizeNotificationData = (
  type: NotificationType | undefined,
  data: Notification["data"]
): Notification["data"] => {
  if (!type || !data) {
    return data;
  }

  if (type === "COIN_EXPIRY_REMINDER") {
    return notificationDataNormalizers.COIN_EXPIRY_REMINDER(
      data as NotificationMap["COIN_EXPIRY_REMINDER"]
    );
  }

  if (type === "APPOINTMENT_SUCCESS") {
    return notificationDataNormalizers.APPOINTMENT_SUCCESS(
      data as NotificationMap["APPOINTMENT_SUCCESS"]
    );
  }

  if (type === "APPOINTMENT_CANCELLED") {
    return notificationDataNormalizers.APPOINTMENT_CANCELLED(
      data as NotificationMap["APPOINTMENT_CANCELLED"]
    );
  }

  return notificationDataNormalizers.PAYMENT_SUCCESS(
    data as NotificationMap["PAYMENT_SUCCESS"]
  );
};

const normalizeNotificationDate = (notification: Notification): Notification => {
  const normalizedCreatedAt = normalizeApiDateToLocalISO(notification.createdAt);
  const normalizedType = normalizeNotificationType(notification);

  return {
    ...notification,
    type: normalizedType ?? notification.type,
    title: normalizeEpochDateInText(notification.title || ""),
    createdAt: normalizedCreatedAt || notification.createdAt,
    message: normalizeEpochDateInText(notification.message || ""),
    data: normalizeNotificationData(normalizedType ?? notification.type, notification.data),
  };
};

/**
 * Lấy notification của user hiện tại (identity từ JWT) với phân trang.
 */
export const getNotificationsByEmail = async (
  pagination: PaginationQueryDto
): Promise<DataResponse<PaginationResult<Notification>> | undefined> => {
  try {
    const res = await axiosClient.get<DataResponse<PaginationResult<Notification>>>(
      "/notifications/by-email",
      {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      }
    );

    if (res.data?.data?.data) {
      res.data.data.data = res.data.data.data.map(normalizeNotificationDate);
    }

    console.log("[Axios] Get notifications by email:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch notifications by email:", e);
  }
};

export const getUnreadNotificationCount = async (
): Promise<DataResponse<number> | undefined> => {
  try {
    const res = await axiosClient.get<DataResponse<number>>("/notifications/count", {
      params: {},
    });
    console.log("[Axios] Get unread notification count:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch unread notification count:", e);
  }
};

export const markNotificationAsRead = async (id: string) => {
  try {
    const res = await axiosClient.patch<DataResponse<Notification>>(`/notifications/${id}/read`);

    if (res.data?.data) {
      res.data.data = normalizeNotificationDate(res.data.data);
    }

    return res.data;
  } catch (e) {
    console.error("Failed to mark notification as read:", e);
  }
};