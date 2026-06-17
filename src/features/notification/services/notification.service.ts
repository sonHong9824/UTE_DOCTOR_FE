import {
    getNotificationsByEmail,
    getUnreadNotificationCount,
    markNotificationAsRead,
} from "@/apis/notification/notification.api";

export const notificationService = {
  async getNotifications(page: number, limit: number, options?: { signal?: AbortSignal }) {
    return getNotificationsByEmail({ page, limit }, options);
  },

  async getUnreadCount(options?: { signal?: AbortSignal }) {
    return getUnreadNotificationCount(options);
  },

  async markAsRead(notificationId: string) {
    return markNotificationAsRead(notificationId);
  },
};
