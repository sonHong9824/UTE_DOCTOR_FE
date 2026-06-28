"use client";

export type AssistantRole = "PATIENT" | "DOCTOR" | "RECEPTIONIST" | "ADMIN" | string;
export type AssistantFeature = "chat" | "medical-ai";

const CHAT_ROLES = new Set(["PATIENT", "DOCTOR", "RECEPTIONIST"]);
const MEDICAL_AI_ROLES = new Set(["PATIENT"]);

export const normalizeAssistantRole = (role?: string | null): AssistantRole =>
  (role || "").trim().toUpperCase();

export const getAssistantFeaturesForRole = (role?: string | null): AssistantFeature[] => {
  const normalizedRole = normalizeAssistantRole(role);
  const features: AssistantFeature[] = [];

  if (CHAT_ROLES.has(normalizedRole)) {
    features.push("chat");
  }

  if (MEDICAL_AI_ROLES.has(normalizedRole)) {
    features.push("medical-ai");
  }

  return features;
};

export const canUseAssistantFeature = (
  role: string | null | undefined,
  feature: AssistantFeature
) => getAssistantFeaturesForRole(role).includes(feature);
