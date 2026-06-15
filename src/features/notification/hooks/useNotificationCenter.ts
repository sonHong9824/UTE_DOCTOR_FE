"use client";

import { ResponseCode } from "@/enum/response-code.enum";
import { AuthIdentity, getCurrentAuthIdentity } from "@/features/auth/utils/auth-identity";
import { notificationService } from "@/features/notification/services/notification.service";
import { NotificationFilter } from "@/features/notification/types/notification-center.types";
import { Notification } from "@/types/notification.dto";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

export const useNotificationCenter = (pageSize = DEFAULT_PAGE_SIZE) => {
  const [authIdentity, setAuthIdentity] = useState<AuthIdentity | null>(() =>
    getCurrentAuthIdentity()
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const authIdentityRef = useRef<AuthIdentity | null>(authIdentity);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    authIdentityRef.current = authIdentity;
  }, [authIdentity]);

  const resetState = useCallback(() => {
    requestVersionRef.current += 1;
    setNotifications([]);
    setSelectedNotification(null);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setLoadingMore(false);
    setRefreshing(false);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleAuthLogout = () => {
      resetState();
      setAuthIdentity(null);
    };

    const handleUserLoggedIn = () => {
      resetState();
      setLoading(true);
      setAuthIdentity(getCurrentAuthIdentity());
    };

    window.addEventListener("auth-logout", handleAuthLogout);
    window.addEventListener("user-logged-in", handleUserLoggedIn);

    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
      window.removeEventListener("user-logged-in", handleUserLoggedIn);
    };
  }, [resetState]);

  const fetchPage = useCallback(
    async (pageToLoad: number, replace = false) => {
      const identityKey = authIdentityRef.current?.key;
      if (!identityKey) {
        resetState();
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      const response = await notificationService.getNotifications(pageToLoad, pageSize);

      if (
        requestVersion !== requestVersionRef.current ||
        authIdentityRef.current?.key !== identityKey
      ) {
        return;
      }

      if (response?.code === ResponseCode.SUCCESS && response.data?.data) {
        const incoming = response.data.data;
        setNotifications((prev) => (replace ? incoming : [...prev, ...incoming]));
        setHasMore(incoming.length === pageSize);
        setPage(pageToLoad);
      }
    },
    [pageSize, resetState]
  );

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const identityKey = authIdentityRef.current?.key;
    if (!identityKey) {
      resetState();
      return;
    }

    const requestVersion = ++requestVersionRef.current;
    setRefreshing(true);
    setLoading(true);

    try {
      const [unreadRes, notificationRes] = await Promise.all([
        notificationService.getUnreadCount({ signal }),
        notificationService.getNotifications(1, pageSize, { signal }),
      ]);

      if (
        signal?.aborted ||
        requestVersion !== requestVersionRef.current ||
        authIdentityRef.current?.key !== identityKey
      ) {
        return;
      }

      if (unreadRes?.code === ResponseCode.SUCCESS && typeof unreadRes.data === "number") {
        setUnreadCount(unreadRes.data);
      }

      if (notificationRes?.code === ResponseCode.SUCCESS && notificationRes.data?.data) {
        const incoming = notificationRes.data.data;
        setNotifications(incoming);
        setHasMore(incoming.length === pageSize);
        setPage(1);
      }
    } finally {
      if (!signal?.aborted && authIdentityRef.current?.key === identityKey) {
        setRefreshing(false);
        setLoading(false);
      }
    }
  }, [pageSize, resetState]);

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
    const identityKey = authIdentityRef.current?.key;
    if (!identityKey) {
      return;
    }

    setSelectedNotification(notification);

    if (notification.isRead) {
      return;
    }

    const res = await notificationService.markAsRead(notification._id);
    if (authIdentityRef.current?.key !== identityKey) {
      return;
    }

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
