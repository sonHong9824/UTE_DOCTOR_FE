import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { Notification } from "@/types/notification.dto";
import { PaginationQueryDto } from "@/types/pagination/pagination-query.dto";
import { PaginationResult } from "@/types/pagination/pagination-result.dto";
import { normalizeApiDateToLocalISO, normalizeEpochDateInText } from "@/utils/time.util";

const normalizeNotificationDate = (notification: Notification): Notification => {
  const normalizedCreatedAt = normalizeApiDateToLocalISO(notification.createdAt);
  return {
    ...notification,
    createdAt: normalizedCreatedAt || notification.createdAt,
    message: normalizeEpochDateInText(notification.message || ""),
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