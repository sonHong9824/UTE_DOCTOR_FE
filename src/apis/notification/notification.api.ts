import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { Notification } from "@/types/notification.dto";
import { PaginationQueryDto } from "@/types/pagination/pagination-query.dto";
import { PaginationResult } from "@/types/pagination/pagination-result.dto";

/**
 * Lấy notification theo email với phân trang
 * @param email email người dùng
 * @param pagination { page, limit }
 */
export const getNotificationsByEmail = async (
  email: string,
  pagination: PaginationQueryDto
): Promise<DataResponse<PaginationResult<Notification>> | undefined> => {
  try {
    const res = await axiosClient.get<DataResponse<PaginationResult<Notification>>>(
      "/notifications/by-email",
      {
        params: {
          email,
          page: pagination.page,
          limit: pagination.limit,
        },
      }
    );
    console.log("[Axios] Get notifications by email:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch notifications by email:", e);
  }
};

export const getUnreadNotificationCount = async (
  email: string
): Promise<DataResponse<number> | undefined> => {
  try {
    const res = await axiosClient.get<DataResponse<number>>("/notifications/count", {
      params: { email },
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
    return res.data;
  } catch (e) {
    console.error("Failed to mark notification as read:", e);
  }
};