"use client";

import {
  buildReschedulePopupUrl,
  isReschedulePopupMessage,
  RESCHEDULE_POPUP_FEATURES,
  RESCHEDULE_POPUP_NAME,
  ReschedulePopupMessageType,
} from "@/features/appointment/utils/reschedule-popup";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const POPUP_CLOSE_CHECK_INTERVAL_MS = 800;

interface UseReschedulePopupOptions {
  // Called after a successful reschedule so the parent can refresh its data.
  onSuccess?: (appointmentId?: string) => void;
}

export const useReschedulePopup = ({ onSuccess }: UseReschedulePopupOptions = {}) => {
  // The appointment currently being rescheduled in the popup (used to disable
  // its row's action on the parent page). null when idle.
  const [activeAppointmentId, setActiveAppointmentId] = useState<string | null>(null);

  const popupRef = useRef<Window | null>(null);
  const closeCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handledRef = useRef(false);
  const activeIdRef = useRef<string | null>(null);

  // Keep the latest onSuccess without re-subscribing the message listener.
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const clearCloseCheck = useCallback(() => {
    if (closeCheckRef.current) {
      clearInterval(closeCheckRef.current);
      closeCheckRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    clearCloseCheck();
    activeIdRef.current = null;
    setActiveAppointmentId(null);
    popupRef.current = null;
  }, [clearCloseCheck]);

  const closePopup = useCallback(() => {
    try {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    } catch {
      // Ignore — popup may already be gone.
    }
  }, []);

  const startCloseDetection = useCallback(() => {
    clearCloseCheck();
    closeCheckRef.current = setInterval(() => {
      if (!popupRef.current || !popupRef.current.closed) return;
      // Popup was closed manually before posting a result → treat as cancelled.
      if (!handledRef.current) {
        handledRef.current = true;
        resetState();
      } else {
        clearCloseCheck();
      }
    }, POPUP_CLOSE_CHECK_INTERVAL_MS);
  }, [clearCloseCheck, resetState]);

  const openReschedulePopup = useCallback(
    (appointmentId: string) => {
      if (!appointmentId) return;

      // Only one reschedule popup at a time; focus the existing one if asked again.
      if (activeIdRef.current && popupRef.current && !popupRef.current.closed) {
        try {
          popupRef.current.focus();
        } catch {
          // Best effort.
        }
        return;
      }

      handledRef.current = false;
      const popup = window.open(
        buildReschedulePopupUrl(appointmentId),
        RESCHEDULE_POPUP_NAME,
        RESCHEDULE_POPUP_FEATURES
      );

      if (!popup) {
        toast.error(
          "Trình duyệt đã chặn cửa sổ đổi lịch. Vui lòng cho phép popup rồi thử lại."
        );
        return;
      }

      popupRef.current = popup;
      activeIdRef.current = appointmentId;
      setActiveAppointmentId(appointmentId);

      try {
        popup.focus();
      } catch {
        // Best effort.
      }

      startCloseDetection();
    },
    [startCloseDetection]
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!isReschedulePopupMessage(event.data)) return;

      const { type, appointmentId } = event.data;

      switch (type) {
        case ReschedulePopupMessageType.SUCCESS: {
          // Guard against duplicate success events for the same popup.
          if (handledRef.current && activeIdRef.current === null) break;
          handledRef.current = true;
          clearCloseCheck();
          // Popup shows its own success screen; let the user close it themselves.
          activeIdRef.current = null;
          setActiveAppointmentId(null);
          onSuccessRef.current?.(appointmentId);
          break;
        }
        case ReschedulePopupMessageType.FAILED:
        case ReschedulePopupMessageType.CANCELLED: {
          handledRef.current = true;
          resetState();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [clearCloseCheck, resetState]);

  useEffect(() => {
    return () => {
      clearCloseCheck();
    };
  }, [clearCloseCheck]);

  return {
    activeAppointmentId,
    isRescheduling: activeAppointmentId !== null,
    openReschedulePopup,
    closePopup,
  };
};
