"use client";

import { getNotificationsByEmail, getUnreadNotificationCount, markNotificationAsRead } from "@/apis/notification/notification.api";
import { ResponseCode } from "@/enum/response-code.enum";
import { Notification } from "@/types/notification.dto";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import NotificationList from "./notification-list";

interface Props {
  email: string;
  pageSize?: number;
}

export default function NotificationBell({ email, pageSize = 10 }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);  

  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

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

    useEffect(() => {
    const fetchInitial = async () => {
        try {
        // 1. fetch tổng số chưa đọc
        const countRes = await getUnreadNotificationCount(email);
        if (countRes?.code === ResponseCode.SUCCESS && typeof countRes.data === 'number') {
            setUnreadCount(countRes.data);
        }

        // 2. fetch page đầu tiên
        const notifRes = await getNotificationsByEmail(email, { page: 1, limit: pageSize });
        if (notifRes?.code === ResponseCode.SUCCESS && notifRes.data?.data) {
            setNotifications(notifRes.data.data);
            setHasMore(notifRes.data.data.length === pageSize);
            setPage(1);
        }
        } catch (e) {
        console.error("Failed to fetch initial notifications:", e);
        }
    };

    fetchInitial();
    }, [email]);


  const loadNotifications = async (pageToLoad: number, replace = false) => {
    try {
      const res = await getNotificationsByEmail(email, { page: pageToLoad, limit: pageSize });
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
    loadNotifications(nextPage);
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
        setOpen(false);
        }
    };

  if (open) document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [open]);


  // portal dropdown + overlay
  const dropdownElement = open ? (
    createPortal(
      <>
        {/* overlay */}
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setOpen(false)}
        />
        {/* dropdown panel */}
        <div
          className="absolute z-50 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-3 max-h-80 overflow-y-auto animate-fadeIn"
         style={{
            top: (bellRef.current?.getBoundingClientRect().bottom ?? 0) + window.scrollY,
            left: (bellRef.current?.getBoundingClientRect().left ?? 0) + window.scrollX,
            }}
        >
          <NotificationList
            notifications={notifications}
            hasMore={hasMore}
            onLoadMore={handleShowMore}
            onClickNotification={(noti) => {
                setSelectedNotif(noti);
                // mark as read API
                handleClickNotification(noti);
            }}
          />
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

  return (
    <>
      <button
        ref={bellRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {dropdownElement}
    </>
  );
}
