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

export const emitAppRealtimeEvent = (name: string, detail?: unknown): void => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
};
