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
};
