import {
    getNotificationsByEmail,
    getUnreadNotificationCount,
    markNotificationAsRead,
} from "@/apis/notification/notification.api";

export const notificationService = {
  async getNotifications(page: number, limit: number) {
    return getNotificationsByEmail({ page, limit });
  },

  async getUnreadCount() {
    return getUnreadNotificationCount();
  },

  async markAsRead(notificationId: string) {
    return markNotificationAsRead(notificationId);
  },
};
