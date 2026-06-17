"use client";

export type AuthIdentity = {
  id: string;
  email: string;
  role: string;
  key: string;
};

const normalizeStorageValue = (value: string | null) => (value || "").trim();

export const getCurrentAuthIdentity = (): AuthIdentity | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const email = normalizeStorageValue(window.localStorage.getItem("email")).toLowerCase();
  const role = normalizeStorageValue(window.localStorage.getItem("role")).toUpperCase();
  const id = normalizeStorageValue(window.localStorage.getItem("id"));
  const token = normalizeStorageValue(window.localStorage.getItem("accessToken"));

  if (!token || !email) {
    return null;
  }

  return {
    id,
    email,
    role,
    key: [id, email, role].filter(Boolean).join("|"),
  };
};
