// Communication contract between the reschedule popup window and its opener
// (the appointment list/detail page). The reschedule route is same-origin, so
// we use window.postMessage instead of the backend-polling used by the
// cross-origin VNPay deposit popup.

export const RESCHEDULE_POPUP_NAME = "appointmentReschedule";
export const RESCHEDULE_POPUP_FEATURES = "width=900,height=760";

// Marks our own messages so the opener can ignore unrelated postMessage traffic.
export const RESCHEDULE_POPUP_SOURCE = "ute-doctor-reschedule";

export const ReschedulePopupMessageType = {
  SUCCESS: "APPOINTMENT_RESCHEDULE_SUCCESS",
  CANCELLED: "APPOINTMENT_RESCHEDULE_CANCELLED",
  FAILED: "APPOINTMENT_RESCHEDULE_FAILED",
} as const;

export type ReschedulePopupMessageType =
  (typeof ReschedulePopupMessageType)[keyof typeof ReschedulePopupMessageType];

export interface ReschedulePopupMessage {
  source: typeof RESCHEDULE_POPUP_SOURCE;
  type: ReschedulePopupMessageType;
  appointmentId?: string;
}

export const buildReschedulePopupUrl = (appointmentId: string): string =>
  `/appointments/reschedule/${encodeURIComponent(appointmentId)}?popup=1`;

export const isReschedulePopupMessage = (
  data: unknown
): data is ReschedulePopupMessage => {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<ReschedulePopupMessage>;
  return (
    candidate.source === RESCHEDULE_POPUP_SOURCE &&
    typeof candidate.type === "string"
  );
};

// Called from inside the popup to notify the opener (if any) of the outcome.
// Best-effort: silently no-ops when opened directly (no opener) or the opener
// has been closed.
export const notifyRescheduleOpener = (
  type: ReschedulePopupMessageType,
  appointmentId?: string
): void => {
  if (typeof window === "undefined") return;

  let opener: Window | null = null;
  try {
    opener = window.opener as Window | null;
    if (!opener || opener.closed) return;
  } catch {
    return;
  }

  const message: ReschedulePopupMessage = {
    source: RESCHEDULE_POPUP_SOURCE,
    type,
    appointmentId,
  };

  try {
    opener.postMessage(message, window.location.origin);
  } catch {
    // Opener may be cross-origin or gone; nothing else we can do.
  }
};
