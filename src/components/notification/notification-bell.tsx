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
import {
  APPOINTMENT_DOCTOR_ASSIGNED_EVENT,
  ASSIGNMENT_TASKS_CHANGED_EVENT,
  emitAppRealtimeEvent,
} from "@/lib/realtimeEvents";
import { createNotificationSocket } from "@/services/socket/socket-client";
import {
  Notification,
  NotificationMap,
  NotificationPayload,
} from "@/types/notification.dto";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import NotificationList from "./notification-list";

interface Props {
  email?: string;
  pageSize?: number;
  buttonClassName?: string;
  iconClassName?: string;
  badgeClassName?: string;
}

type NotificationHandlerMap = {
  [K in keyof NotificationMap]: (data: NotificationMap[K]) => void;
};

const handlers: NotificationHandlerMap = {
  COIN_EXPIRY_REMINDER: (data) => {
    console.log("Coin expiry", data);
  },
  APPOINTMENT_SUCCESS: (data) => {
    console.log("Appointment success", data);
  },
  APPOINTMENT_CANCELLED: (data) => {
    console.log("Appointment cancelled", data);
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
  APPOINTMENT_DOCTOR_ASSIGNED: (data) => {
    emitAppRealtimeEvent(APPOINTMENT_DOCTOR_ASSIGNED_EVENT, data);
    toast.success("Bác sĩ đã được phân công cho lịch hẹn của bạn.");
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
  buttonClassName,
  iconClassName,
  badgeClassName,
}: Props) {
  const router = useRouter();
  const [authIdentity, setAuthIdentity] = useState<AuthIdentity | null>(() =>
    getCurrentAuthIdentity()
  );
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const authIdentityRef = useRef<AuthIdentity | null>(authIdentity);
  const requestVersionRef = useRef(0);

  useEffect(() => {
    authIdentityRef.current = authIdentity;
  }, [authIdentity]);

  const resetBellState = useCallback(() => {
    requestVersionRef.current += 1;
    setOpen(false);
    setNotifications([]);
    setUnreadCount(0);
    setSelectedNotif(null);
    setPage(1);
    setHasMore(true);
  }, []);

  const toggleBell = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setSelectedNotif(null);
      }
      return next;
    });
  };

  const handleViewAllNotifications = () => {
    setSelectedNotif(null);
    setOpen(false);
    router.push("/user/my-profile?tab=notifications");
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
        }

        if (notifRes?.code === ResponseCode.SUCCESS && notifRes.data?.data) {
          setNotifications(notifRes.data.data);
          setHasMore(notifRes.data.data.length === pageSize);
          setPage(1);
        }
      } catch (err) {
        if (signal?.aborted) {
          return;
        }
        console.error("[NotificationBell] Failed to refresh notifications", err);
      }
    },
    [pageSize, resetBellState]
  );

  const dispatchNotification = useCallback((payload: NotificationPayload) => {
    const handler = handlers[payload.type] as
      | ((data: NotificationPayload["data"]) => void)
      | undefined;

    if (typeof handler === "function") {
      handler(payload.data);
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
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
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
        setSelectedNotif(null);
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const rect = bellRef.current?.getBoundingClientRect();
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
  const dropdownTop = (rect?.bottom ?? 0) + scrollY;
  const dropdownWidth = 320;
  const dropdownLeft = Math.max(8, (rect?.right ?? 0) + scrollX - dropdownWidth);

  const dropdownElement =
    open && typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => {
                setSelectedNotif(null);
                setOpen(false);
              }}
            />
            <div
              ref={dropdownRef}
              className="absolute z-50 max-h-80 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 shadow-lg animate-fadeIn dark:border-gray-800 dark:bg-gray-900"
              style={{
                top: dropdownTop,
                left: dropdownLeft,
              }}
            >
              <NotificationList
                notifications={notifications}
                hasMore={hasMore}
                onLoadMore={handleShowMore}
                onClickNotification={(noti) => {
                  void handleClickNotification(noti);
                }}
              />
              <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleViewAllNotifications}
                  className="w-full rounded-md px-3 py-2 text-center text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                >
                  View all notifications
                </button>
              </div>
              {selectedNotif &&
                createPortal(
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                        onClick={() => setSelectedNotif(null)}
                        aria-label="Close notification detail"
                      >
                        ✕
                      </button>
                      <h3 className="mb-2 text-lg font-bold">{selectedNotif.title}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedNotif.message}
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
    : "relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800";
  const mergedIconClass = iconClassName
    ? iconClassName
    : "w-6 h-6 text-gray-700 dark:text-gray-300";
  const mergedBadgeClass = badgeClassName
    ? badgeClassName
    : "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center";

  return (
    <>
      <button ref={bellRef} onClick={toggleBell} className={mergedButtonClass}>
        <Bell className={mergedIconClass} />
        {unreadCount > 0 && <span className={mergedBadgeClass}>{unreadCount}</span>}
      </button>

      {dropdownElement}
    </>
  );
}
