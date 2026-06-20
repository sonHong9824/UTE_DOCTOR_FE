// Lightweight in-app realtime event bus built on window CustomEvents.
//
// Notifications are best-effort: the DB queue (receptionist) / appointment APIs (patient)
// remain the source of truth, but when a `NOTIFICATION_RECEIVED` socket event arrives we
// broadcast a typed window event so any mounted screen can refresh sooner. This decouples
// the global notification bell from feature screens (which may live in different layouts).
//
// Follows the existing `token-refreshed` / `auth-logout` window-event pattern used by
// authTokenStore.

/** Fired when an assignment task may have changed (created / reminder / expired / mutated). */
export const ASSIGNMENT_TASKS_CHANGED_EVENT = "assignment-tasks:changed";

/** Fired when a patient's broad appointment has had a doctor/slot assigned. */
export const APPOINTMENT_DOCTOR_ASSIGNED_EVENT = "appointment:doctor-assigned";

/** Fired when a patient's appointment state changed and mounted appointment views should refresh. */
export const APPOINTMENT_CANCELLED_EVENT = "appointment:cancelled";

/** Fired when an appointment is terminalized because the patient did not check in. */
export const APPOINTMENT_NO_SHOW_EVENT = "appointment:no-show";

/** Fired whenever a notification socket payload arrives for the current user. */
export const NOTIFICATIONS_CHANGED_EVENT = "notifications:changed";

export const emitAppRealtimeEvent = (name: string, detail?: unknown): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
};
