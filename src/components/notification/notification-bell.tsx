"use client";

import { getNotificationsByEmail, getUnreadNotificationCount, markNotificationAsRead } from "@/apis/notification/notification.api";
import { ResponseCode } from "@/enum/response-code.enum";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { createNotificationSocket } from "@/services/socket/socket-client";
import {
    Notification,
    NotificationMap,
    NotificationPayload,
} from "@/types/notification.dto";
import {
    APPOINTMENT_DOCTOR_ASSIGNED_EVENT,
    ASSIGNMENT_TASKS_CHANGED_EVENT,
    emitAppRealtimeEvent,
} from "@/lib/realtimeEvents";
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
  // Broad-booking / assignment events. Realtime is a best-effort nudge: we broadcast a window
  // event so the receptionist queue (or patient appointment list) refreshes sooner. Correctness
  // still comes from polling / list APIs, so we never branch on `data.online`.
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

export default function NotificationBell({
  pageSize = 10,
  buttonClassName,
  iconClassName,
  badgeClassName,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);  

  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

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
    setSelectedNotif(notif); // mở modal
    if (!notif.isRead) {
        const res = await markNotificationAsRead(notif._id);
        if (res?.code === ResponseCode.SUCCESS) {
        setNotifications(prev =>
            prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(prev - 1, 0));
        }
    }
    };

  const refreshBell = useCallback(async () => {
    try {
      const [countRes, notifRes] = await Promise.all([
        getUnreadNotificationCount(),
        getNotificationsByEmail({ page: 1, limit: pageSize }),
      ]);
      if (countRes?.code === ResponseCode.SUCCESS && typeof countRes.data === "number") {
        setUnreadCount(countRes.data);
      }
      if (notifRes?.code === ResponseCode.SUCCESS && notifRes.data?.data) {
        setNotifications(notifRes.data.data);
        setHasMore(notifRes.data.data.length === pageSize);
        setPage(1);
      }
    } catch (err) {
      console.error("[NotificationBell] Failed to refresh notifications", err);
    }
  }, [pageSize]);

  const dispatchNotification = useCallback(
    <K extends keyof NotificationMap>(payload: { type: K; data: NotificationMap[K] }) => {
      // Defensive: the backend may emit a notification type the FE has not mapped yet. Skip it
      // (the bell list/count still refreshes) instead of crashing on `handlers[type]` undefined.
      const handler = handlers[payload.type];
      if (typeof handler === "function") {
        handler(payload.data);
      } else {
        console.warn("[NotificationBell] Unhandled notification type:", payload.type);
      }
    },
    []
  );

  const handleNotification = useCallback(
    (payload: NotificationPayload) => {
      dispatchNotification(payload);
    },
    [dispatchNotification]
  );

  useEffect(() => {
    void refreshBell();
  }, [refreshBell]);

  // Keep the bell tied to the auth boundary even if it stays mounted across an account switch:
  // wipe the previous user's notifications/count on logout, and refetch for the new user on login.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleAuthLogout = () => {
      setNotifications([]);
      setUnreadCount(0);
      setSelectedNotif(null);
      setPage(1);
      setHasMore(true);
    };

    const handleUserLoggedIn = () => {
      void refreshBell();
    };

    window.addEventListener("auth-logout", handleAuthLogout);
    window.addEventListener("user-logged-in", handleUserLoggedIn);

    return () => {
      window.removeEventListener("auth-logout", handleAuthLogout);
      window.removeEventListener("user-logged-in", handleUserLoggedIn);
    };
  }, [refreshBell]);

  useEffect(() => {
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

      handleNotification(payload as NotificationPayload);
      await refreshBell();
    };

    notificationSocket.onConnect(handleConnect);
    notificationSocket.on(
      SocketEventsEnum.NOTIFICATION_RECEIVED,
      onNotificationReceived
    );

    notificationSocket.connect();
    if (notificationSocket.isConnected()) {
      void joinNotificationRoom();
    }

    return () => {
      notificationSocket.off(
        SocketEventsEnum.NOTIFICATION_RECEIVED,
        onNotificationReceived
      );
      notificationSocket.offConnect(handleConnect);
    };
  }, [handleNotification, refreshBell]);


  const loadNotifications = async (pageToLoad: number, replace = false) => {
    try {
      const res = await getNotificationsByEmail({ page: pageToLoad, limit: pageSize });
      if (res?.code === ResponseCode.SUCCESS && res.data?.data) {
        const newData = res.data.data;
        setNotifications((prev) => (replace ? newData : [...prev, ...newData]));
        setHasMore(newData.length === pageSize);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  };

  const handleShowMore = () => {
    const nextPage = page + 1;
    void loadNotifications(nextPage);
    setPage(nextPage);
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

  if (open) document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [open]);


  // portal dropdown + overlay
  const rect = bellRef.current?.getBoundingClientRect();
  const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
  const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
  const dropdownTop = (rect?.bottom ?? 0) + scrollY;
  const dropdownWidth = 320;
  const dropdownLeft = Math.max(8, (rect?.right ?? 0) + scrollX - dropdownWidth);

  const dropdownElement = open && typeof document !== "undefined" ? (
    createPortal(
      <>
        {/* overlay */}
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => {
            setSelectedNotif(null);
            setOpen(false);
          }}
        />
        {/* dropdown panel */}
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
          {selectedNotif && createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                    onClick={() => setSelectedNotif(null)}
                >
                    ✕
                </button>
                <h3 className="text-lg font-bold mb-2">{selectedNotif.title}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedNotif.message}</p>
                </div>
            </div>,
            document.body
            )}
        </div>
      </>,
      document.body
    )
  ) : null;

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
      <button
        ref={bellRef}
        onClick={toggleBell}
        className={mergedButtonClass}
      >
        <Bell className={mergedIconClass} />
        {unreadCount > 0 && (
          <span className={mergedBadgeClass}>
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownElement}
    </>
  );
}
