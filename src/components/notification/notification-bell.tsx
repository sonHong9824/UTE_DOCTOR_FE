"use client";

import {
  getNotificationsByEmail,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "@/apis/notification/notification.api";
import { ResponseCode } from "@/enum/response-code.enum";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import {
  AuthIdentity,
  getCurrentAuthIdentity,
} from "@/features/auth/utils/auth-identity";
import { renderNotification } from "@/lib/notification/renderNotification";
import {
  APPOINTMENT_CANCELLED_EVENT,
  APPOINTMENT_DOCTOR_ASSIGNED_EVENT,
  APPOINTMENT_NO_SHOW_EVENT,
  ASSIGNMENT_TASKS_CHANGED_EVENT,
  emitAppRealtimeEvent,
  NOTIFICATIONS_CHANGED_EVENT,
} from "@/lib/realtimeEvents";
import { cn } from "@/lib/utils";
import { createNotificationSocket } from "@/services/socket/socket-client";
import {
  Notification,
  NotificationMap,
  NotificationPayload,
} from "@/types/notification.dto";
import { Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import NotificationList, {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationListSkeleton,
  formatNotificationCount,
  formatNotificationTimestamp,
} from "./notification-list";

const DROPDOWN_ANIMATION_MS = 180;

interface Props {
  email?: string;
  pageSize?: number;
  viewAllHref?: string;
  buttonClassName?: string;
  iconClassName?: string;
  badgeClassName?: string;
}

type NotificationHandlerMap = {
  [K in keyof NotificationMap]: (
    data: NotificationMap[K],
    payload: Extract<NotificationPayload, { type: K }>
  ) => void;
};

const handlers: NotificationHandlerMap = {
  COIN_EXPIRY_REMINDER: (data) => {
    console.log("Coin expiry", data);
  },
  APPOINTMENT_SUCCESS: (data) => {
    console.log("Appointment success", data);
  },
  APPOINTMENT_CANCELLED: (data) => {
    emitAppRealtimeEvent(APPOINTMENT_CANCELLED_EVENT, data);
  },
  APPOINTMENT_NO_SHOW: (data) => {
    emitAppRealtimeEvent(APPOINTMENT_NO_SHOW_EVENT, data);
  },
  APPOINTMENT_RESCHEDULED: (data) => {
    console.log("Appointment rescheduled", data);
  },
  PAYMENT_SUCCESS: (data) => {
    console.log("Payment success", data);
  },
  ASSIGNMENT_TASK_CREATED: (data) => {
    emitAppRealtimeEvent(ASSIGNMENT_TASKS_CHANGED_EVENT, data);
  },
  ASSIGNMENT_TASK_REMINDER: (data) => {
    emitAppRealtimeEvent(ASSIGNMENT_TASKS_CHANGED_EVENT, data);
  },
  ASSIGNMENT_TASK_EXPIRED: (data) => {
    emitAppRealtimeEvent(ASSIGNMENT_TASKS_CHANGED_EVENT, data);
  },
  APPOINTMENT_DOCTOR_ASSIGNED: (data, payload) => {
    emitAppRealtimeEvent(APPOINTMENT_DOCTOR_ASSIGNED_EVENT, data);
    toast.success(renderNotification(payload).message);
  },
};

const isNotificationPayloadForIdentity = (
  payload: NotificationPayload,
  identity: AuthIdentity | null
) => {
  if (!payload.recipientEmail) {
    return true;
  }

  return payload.recipientEmail.trim().toLowerCase() === identity?.email;
};

export default function NotificationBell({
  pageSize = 10,
  viewAllHref = "/user/my-profile?tab=notifications",
  buttonClassName,
  iconClassName,
  badgeClassName,
}: Props) {
  const router = useRouter();
  const [authIdentity, setAuthIdentity] = useState<AuthIdentity | null>(() =>
    getCurrentAuthIdentity()
  );
  const [open, setOpen] = useState(false);
  const [dropdownMounted, setDropdownMounted] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authIdentityRef = useRef<AuthIdentity | null>(authIdentity);
  const requestVersionRef = useRef(0);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrameRef = useRef<number | null>(null);

  useEffect(() => {
    authIdentityRef.current = authIdentity;
  }, [authIdentity]);

  const resetBellState = useCallback(() => {
    requestVersionRef.current += 1;
    if (openFrameRef.current !== null) {
      cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }
    setOpen(false);
    setDropdownMounted(false);
    setNotifications([]);
    setUnreadCount(0);
    setSelectedNotif(null);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    setLoadingMore(false);
    setError(null);
  }, []);

  const closeDropdown = useCallback(() => {
    if (openFrameRef.current !== null) {
      cancelAnimationFrame(openFrameRef.current);
      openFrameRef.current = null;
    }

    setSelectedNotif(null);
    setOpen(false);

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = setTimeout(() => {
      setDropdownMounted(false);
      closeTimerRef.current = null;
    }, DROPDOWN_ANIMATION_MS);
  }, []);

  const openDropdown = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setSelectedNotif(null);
    setDropdownMounted(true);
    openFrameRef.current = requestAnimationFrame(() => {
      setOpen(true);
      openFrameRef.current = null;
    });
  }, []);

  const toggleBell = () => {
    if (open) {
      closeDropdown();
      return;
    }

    openDropdown();
  };

  const handleViewAllNotifications = () => {
    setSelectedNotif(null);
    closeDropdown();
    router.push(viewAllHref);
  };

  const handleClickNotification = async (notif: Notification) => {
    const identityKey = authIdentityRef.current?.key;
    if (!identityKey) {
      return;
    }

    setSelectedNotif(notif);
    if (notif.isRead) {
      return;
    }

    const res = await markNotificationAsRead(notif._id);
    if (authIdentityRef.current?.key !== identityKey) {
      return;
    }

    if (res?.code === ResponseCode.SUCCESS) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setSelectedNotif((prev) =>
        prev && prev._id === notif._id ? { ...prev, isRead: true } : prev
      );
    }
  };

  const refreshBell = useCallback(
    async (signal?: AbortSignal) => {
      const identityKey = authIdentityRef.current?.key;
      if (!identityKey) {
        resetBellState();
        return;
      }

      const requestVersion = ++requestVersionRef.current;
      setError(null);
      setLoading(true);

      try {
        const [countRes, notifRes] = await Promise.all([
          getUnreadNotificationCount({ signal }),
          getNotificationsByEmail({ page: 1, limit: pageSize }, { signal }),
        ]);

        if (
          signal?.aborted ||
          requestVersion !== requestVersionRef.current ||
          authIdentityRef.current?.key !== identityKey
        ) {
          return;
        }

        if (countRes?.code === ResponseCode.SUCCESS && typeof countRes.data === "number") {
          setUnreadCount(countRes.data);
        } else {
          setError("Không tải được số thông báo chưa đọc.");
        }

        if (notifRes?.code === ResponseCode.SUCCESS && notifRes.data?.data) {
          setNotifications(notifRes.data.data);
          setHasMore(notifRes.data.data.length === pageSize);
          setPage(1);
        } else {
          setError("Không tải được danh sách thông báo.");
        }
      } catch (err) {
        if (signal?.aborted) {
          return;
        }
        setError("Không tải được thông báo.");
        console.error("[NotificationBell] Failed to refresh notifications", err);
      } finally {
        if (!signal?.aborted && authIdentityRef.current?.key === identityKey) {
          setLoading(false);
        }
      }
    },
    [pageSize, resetBellState]
  );

  const dispatchNotification = useCallback((payload: NotificationPayload) => {
    const handler = handlers[payload.type] as
      | ((data: NotificationPayload["data"], payload: NotificationPayload) => void)
      | undefined;

    if (typeof handler === "function") {
      handler(payload.data, payload);
      return;
    }

    console.warn("[NotificationBell] Unhandled notification type:", payload.type);
  }, []);

  const handleNotification = useCallback(
    (payload: NotificationPayload) => {
      if (!isNotificationPayloadForIdentity(payload, authIdentityRef.current)) {
        return;
      }

      dispatchNotification(payload);
    },
    [dispatchNotification]
  );

  useEffect(() => {
    if (!authIdentity?.key) {
      resetBellState();
      return;
    }

    const controller = new AbortController();
    void refreshBell(controller.signal);

    return () => {
      controller.abort();
    };
  }, [authIdentity?.key, refreshBell, resetBellState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleAuthLogout = () => {
      resetBellState();
      setAuthIdentity(null);
    };

    const handleUserLoggedIn = () => {
      resetBellState();
      setAuthIdentity(getCurrentAuthIdentity());
    };

    window.addEventListener("auth-logout", handleAuthLogout);
    window.addEventListener("user-logged-in", handleUserLoggedIn);

    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
      window.removeEventListener("user-logged-in", handleUserLoggedIn);
    };
  }, [resetBellState]);

  useEffect(() => {
    return () => {
      if (openFrameRef.current !== null) {
        cancelAnimationFrame(openFrameRef.current);
      }

      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!authIdentity?.key) {
      return;
    }

    const notificationSocket = createNotificationSocket();

    const joinNotificationRoom = async () => {
      await notificationSocket.joinRoom();
      console.log("[NotificationBell] JOIN_ROOM emitted for notification namespace");
    };

    const handleConnect = () => {
      void joinNotificationRoom();
    };

    const onNotificationReceived = async (...args: unknown[]) => {
      const [payload] = args;
      if (!payload || typeof payload !== "object") {
        return;
      }

      const typedPayload = payload as NotificationPayload;
      if (!isNotificationPayloadForIdentity(typedPayload, authIdentityRef.current)) {
        return;
      }

      emitAppRealtimeEvent(NOTIFICATIONS_CHANGED_EVENT, typedPayload);
      handleNotification(typedPayload);
      await refreshBell();
    };

    notificationSocket.onConnect(handleConnect);
    notificationSocket.on(SocketEventsEnum.NOTIFICATION_RECEIVED, onNotificationReceived);

    notificationSocket.connect();
    if (notificationSocket.isConnected()) {
      void joinNotificationRoom();
    }

    return () => {
      notificationSocket.off(SocketEventsEnum.NOTIFICATION_RECEIVED, onNotificationReceived);
      notificationSocket.offConnect(handleConnect);
      notificationSocket.disconnect();
    };
  }, [authIdentity?.key, handleNotification, refreshBell]);

  const loadNotifications = async (pageToLoad: number, replace = false) => {
    const identityKey = authIdentityRef.current?.key;
    if (!identityKey) {
      resetBellState();
      return;
    }

    const requestVersion = ++requestVersionRef.current;
    setLoadingMore(true);
    setError(null);

    try {
      const res = await getNotificationsByEmail({ page: pageToLoad, limit: pageSize });
      if (
        requestVersion !== requestVersionRef.current ||
        authIdentityRef.current?.key !== identityKey
      ) {
        return;
      }

      if (res?.code === ResponseCode.SUCCESS && res.data?.data) {
        const newData = res.data.data;
        setNotifications((prev) => (replace ? newData : [...prev, ...newData]));
        setHasMore(newData.length === pageSize);
        setPage(pageToLoad);
      } else {
        setError("Không tải được thêm thông báo.");
      }
    } catch (e) {
      setError("Không tải được thêm thông báo.");
      console.error("Failed to load notifications:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleShowMore = () => {
    void loadNotifications(page + 1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bellRef.current &&
        dropdownRef.current &&
        !bellRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      if (selectedNotif) {
        setSelectedNotif(null);
        return;
      }

      closeDropdown();
    };

    if (dropdownMounted) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeDropdown, dropdownMounted, selectedNotif]);

  const rect = bellRef.current?.getBoundingClientRect();
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 400;
  const dropdownTop = (rect?.bottom ?? 0) + scrollY + 10;
  const dropdownWidth = Math.min(400, Math.max(280, viewportWidth - 16));
  const dropdownLeft = Math.min(
    Math.max(8 + scrollX, (rect?.right ?? 0) + scrollX - dropdownWidth),
    scrollX + viewportWidth - dropdownWidth - 8
  );
  const renderedSelectedNotif = selectedNotif ? renderNotification(selectedNotif) : null;
  const badgeText = formatNotificationCount(unreadCount);

  const dropdownElement =
    dropdownMounted && typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className={cn(
                "fixed inset-0 z-40 bg-slate-950/20 transition-opacity",
                open ? "opacity-100 duration-200 ease-out" : "opacity-0 duration-150 ease-in"
              )}
              onClick={() => {
                closeDropdown();
              }}
            />
            <div
              ref={dropdownRef}
              className={cn(
                "absolute z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30",
                "transition-[opacity,transform] will-change-[opacity,transform]",
                open
                  ? "translate-y-0 scale-100 opacity-100 duration-200 ease-out"
                  : "pointer-events-none -translate-y-2 scale-[0.96] opacity-0 duration-150 ease-in"
              )}
              style={{
                top: dropdownTop,
                left: dropdownLeft,
                width: dropdownWidth,
                transformOrigin: "top right",
              }}
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                      Thông báo
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {unreadCount > 0
                        ? `${formatNotificationCount(unreadCount)} thông báo chưa đọc`
                        : "Bạn đã đọc hết thông báo"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900">
                      {formatNotificationCount(unreadCount)}
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-[calc(100vh-210px)] overflow-y-auto px-3 py-3 sm:max-h-[420px]">
                {loading && notifications.length === 0 ? (
                  <NotificationListSkeleton count={4} variant="dropdown" />
                ) : error && notifications.length === 0 ? (
                  <NotificationErrorState
                    compact
                    description={error}
                    onRetry={() => void refreshBell()}
                  />
                ) : notifications.length === 0 ? (
                  <NotificationEmptyState
                    compact
                    title="Chưa có thông báo"
                    description="Các cập nhật lịch khám, thanh toán và phân công sẽ xuất hiện tại đây."
                  />
                ) : (
                  <NotificationList
                    notifications={notifications}
                    hasMore={hasMore}
                    loadingMore={loadingMore}
                    variant="dropdown"
                    onLoadMore={handleShowMore}
                    onClickNotification={(noti) => {
                      void handleClickNotification(noti);
                    }}
                  />
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={handleViewAllNotifications}
                  className="w-full rounded-lg px-3 py-2 text-center text-sm font-semibold text-sky-700 transition hover:bg-white hover:text-sky-800 dark:text-sky-300 dark:hover:bg-slate-800"
                >
                  Xem tất cả thông báo
                </button>
              </div>
              {selectedNotif &&
                createPortal(
                  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-950">
                      <button
                        type="button"
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                        onClick={() => setSelectedNotif(null)}
                        aria-label="Close notification detail"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="mb-2 text-xs font-medium text-sky-700 dark:text-sky-300">
                        {formatNotificationTimestamp(selectedNotif.createdAt)}
                      </p>
                      <h3 className="pr-8 text-lg font-semibold text-slate-950 dark:text-slate-50">
                        {renderedSelectedNotif?.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {renderedSelectedNotif?.message}
                      </p>
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </>,
          document.body
        )
      : null;

  const mergedButtonClass = buttonClassName
    ? buttonClassName
    : "relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-sky-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-300";
  const mergedIconClass = iconClassName ? iconClassName : "h-6 w-6";
  const mergedBadgeClass = badgeClassName
    ? badgeClassName
    : "absolute -right-1 -top-1 bg-rose-500 text-white";

  return (
    <>
      <button ref={bellRef} type="button" onClick={toggleBell} className={mergedButtonClass}>
        <Bell className={mergedIconClass} />
        {unreadCount > 0 && (
          <span
            className={cn(
              mergedBadgeClass,
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold leading-none text-white ring-2 ring-white dark:ring-slate-950"
            )}
          >
            {badgeText}
          </span>
        )}
      </button>

      {dropdownElement}
    </>
  );
}
