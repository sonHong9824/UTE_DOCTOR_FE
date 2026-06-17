"use client";

// Auth storage helpers (side-effects are isolated here).
export type AuthSession = {
  email: string;
  accessToken: string;
  refreshToken: string;
  role: string;
  id: string;
  patientId?: string;
  doctorId?: string;
  profileId?: string;
};

// Every localStorage key that represents auth identity. Kept as a single source of truth so logout
// clears the full session (no stray key keeps a stale identity alive).
const AUTH_STORAGE_KEYS = [
  "isLoggedIn",
  "email",
  "accessToken",
  "refreshToken",
  "role",
  "id",
  "accountId",
  "userId",
  "name",
  "patientId",
  "doctorId",
  "profileId",
] as const;

const safeSetItem = (key: string, value: string) => {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (private mode, quota, etc.)
  }
};

export const setAuthSession = (session: AuthSession) => {
  safeSetItem("isLoggedIn", "true");
  safeSetItem("email", session.email);
  safeSetItem("accessToken", session.accessToken);
  safeSetItem("refreshToken", session.refreshToken);
  safeSetItem("role", session.role);
  safeSetItem("id", session.id);
  safeSetItem("patientId", session.patientId || "");
  safeSetItem("doctorId", session.doctorId || "");
  safeSetItem("profileId", session.profileId || "");

  // Bind the socket layer to the new identity: `token-refreshed` makes the shared sockets reconnect
  // with the new user's JWT (so the /notification socket joins the new email room). `user-logged-in`
  // lets mounted UI (e.g. the notification bell) refetch for the new user.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("token-refreshed"));
    window.dispatchEvent(new Event("user-logged-in"));
  }
};

// Single logout path. Clears the whole auth session AND notifies the socket layer / UI so no
// connection or cached state survives authenticated as the previous user.
export const clearAuthSession = () => {
  if (typeof window === "undefined") return;

  AUTH_STORAGE_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors.
    }
  });

  // `auth-logout` is what the socket service listens to in order to disconnect; `user-logged-out`
  // lets mounted UI reset its local notification state.
  window.dispatchEvent(new Event("auth-logout"));
  window.dispatchEvent(new Event("user-logged-out"));
};
