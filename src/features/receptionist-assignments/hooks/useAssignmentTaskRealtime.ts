"use client";

import { ASSIGNMENT_TASKS_CHANGED_EVENT } from "@/lib/realtimeEvents";
import { useEffect, useRef } from "react";

/**
 * Best-effort realtime refresh for the receptionist assignment queue.
 *
 * ReceptionistLayout mounts NotificationBell, which owns the notification socket and emits
 * ASSIGNMENT_TASKS_CHANGED_EVENT for ASSIGNMENT_TASK_* payloads. This hook listens to that
 * in-app event and re-fetches; polling remains the source-of-truth fallback.
 */
export const useAssignmentTaskRealtime = (onChange: () => void): void => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const handleWindowEvent = () => onChangeRef.current();

    window.addEventListener(ASSIGNMENT_TASKS_CHANGED_EVENT, handleWindowEvent);

    return () => {
      window.removeEventListener(ASSIGNMENT_TASKS_CHANGED_EVENT, handleWindowEvent);
    };
  }, []);
};
