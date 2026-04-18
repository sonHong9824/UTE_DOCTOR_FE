"use client";

import { ResponseCode } from "@/enum/response-code.enum";
import { notificationService } from "@/features/notification/services/notification.service";
import { NotificationFilter } from "@/features/notification/types/notification-center.types";
import { Notification } from "@/types/notification.dto";
import { useCallback, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

export const useNotificationCenter = (pageSize = DEFAULT_PAGE_SIZE) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchPage = useCallback(
    async (pageToLoad: number, replace = false) => {
      const response = await notificationService.getNotifications(pageToLoad, pageSize);

      if (response?.code === ResponseCode.SUCCESS && response.data?.data) {
        const incoming = response.data.data;
        setNotifications((prev) => (replace ? incoming : [...prev, ...incoming]));
        setHasMore(incoming.length === pageSize);
        setPage(pageToLoad);
      }
    },
    [pageSize]
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [unreadRes] = await Promise.all([
        notificationService.getUnreadCount(),
        fetchPage(1, true),
      ]);

      if (unreadRes?.code === ResponseCode.SUCCESS && typeof unreadRes.data === "number") {
        setUnreadCount(unreadRes.data);
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) {
      return;
    }

    setLoadingMore(true);
    try {
      await fetchPage(page + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loadingMore, page]);

  const openNotification = useCallback(async (notification: Notification) => {
    setSelectedNotification(notification);

    if (notification.isRead) {
      return;
    }

    const res = await notificationService.markAsRead(notification._id);
    if (res?.code === ResponseCode.SUCCESS) {
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setSelectedNotification((prev) =>
        prev && prev._id === notification._id ? { ...prev, isRead: true } : prev
      );
    }
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === "read") {
      return notifications.filter((item) => item.isRead);
    }

    if (filter === "unread") {
      return notifications.filter((item) => !item.isRead);
    }

    return notifications;
  }, [filter, notifications]);

  const unreadInLoadedList = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  return {
    notifications: filteredNotifications,
    selectedNotification,
    setSelectedNotification,
    filter,
    setFilter,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    unreadCount,
    unreadInLoadedList,
    refresh,
    loadMore,
    openNotification,
  };
};
