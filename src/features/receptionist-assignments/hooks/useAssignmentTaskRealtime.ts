"use client";

import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { ASSIGNMENT_TASKS_CHANGED_EVENT } from "@/lib/realtimeEvents";
import { createNotificationSocket } from "@/services/socket/socket-client";
import { useEffect, useRef } from "react";

// Assignment notification types that should refresh the receptionist queue.
const ASSIGNMENT_TASK_EVENT_TYPES = new Set<string>([
  "ASSIGNMENT_TASK_CREATED",
  "ASSIGNMENT_TASK_REMINDER",
  "ASSIGNMENT_TASK_EXPIRED",
]);

/**
 * Best-effort realtime refresh for the receptionist assignment queue.
 *
 * The receptionist layout does not mount the global NotificationBell, so the queue subscribes to
 * the `/notification` namespace directly. It also listens to the in-app window bus (in case the
 * bell is mounted elsewhere). Either path just calls `onChange` to re-fetch — the DB queue stays
 * the source of truth, so a missed notification is harmless (polling covers it).
 */
export const useAssignmentTaskRealtime = (onChange: () => void): void => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const socket = createNotificationSocket();

    const handleNotification = (...args: unknown[]) => {
      const [payload] = args;
      if (!payload || typeof payload !== "object") return;
      const type = (payload as { type?: string }).type;
      if (type && ASSIGNMENT_TASK_EVENT_TYPES.has(type)) {
        onChangeRef.current();
      }
    };

    const handleWindowEvent = () => onChangeRef.current();

    // Backend auto-joins the email room on connect; JOIN_ROOM is kept for backward compatibility
    // (idempotent) so this works against not-yet-updated backends too.
    const handleConnect = () => {
      void socket.joinRoom();
    };

    socket.onConnect(handleConnect);
    socket.on(SocketEventsEnum.NOTIFICATION_RECEIVED, handleNotification);
    socket.connect();
    if (socket.isConnected()) {
      void socket.joinRoom();
    }

    window.addEventListener(ASSIGNMENT_TASKS_CHANGED_EVENT, handleWindowEvent);

    return () => {
      socket.off(SocketEventsEnum.NOTIFICATION_RECEIVED, handleNotification);
      socket.offConnect(handleConnect);
      window.removeEventListener(ASSIGNMENT_TASKS_CHANGED_EVENT, handleWindowEvent);
    };
  }, []);
};
