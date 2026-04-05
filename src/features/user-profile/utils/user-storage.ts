"use client";

// Storage helpers for user profile feature.
const safeGetItem = (key: string) => {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getStoredEmail = () => safeGetItem("email") || "";

export const getStoredPatientId = () => safeGetItem("patientId") || "";
