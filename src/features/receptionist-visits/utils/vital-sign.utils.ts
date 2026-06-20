import dayjs from "dayjs";

import type { CreatePatientVitalSignRequestDto } from "@/apis/receptionist/receptionist.api";
import { BloodType } from "@/enum/blood-type.enum";
import type {
  VitalSignFieldErrors,
  VitalSignFormValues,
} from "@/features/receptionist-visits/types/vital-sign.types";

/**
 * Pure validation + payload helpers for receptionist vital-sign entry.
 *
 * These rules exist ONLY to help the receptionist fill the form correctly. The backend
 * remains the source of truth: physiological ranges, BMI, and metric classification are all
 * backend-owned and are deliberately NOT reproduced here.
 */

export const VITAL_SIGN_MESSAGES = {
  empty: "Vui lòng nhập ít nhất một chỉ số đo.",
  partialBloodPressure: "Vui lòng nhập đầy đủ huyết áp tâm thu và tâm trương.",
  bloodPressureOrder: "Huyết áp tâm thu phải lớn hơn huyết áp tâm trương.",
  invalidDecimal: "Giá trị phải là số dương hợp lệ.",
  invalidInteger: "Giá trị phải là số nguyên dương.",
  invalidBloodType: "Nhóm máu không hợp lệ.",
  invalidMeasuredAt: "Thời điểm đo không hợp lệ.",
  futureMeasuredAt: "Thời điểm đo không được ở tương lai.",
} as const;

/** Allowed clock skew for a client-provided `measuredAt` (mirrors the backend's friendliest rule). */
const FUTURE_SKEW_MS = 5 * 60 * 1000;

const ALLOWED_BLOOD_TYPES = new Set<string>(Object.values(BloodType));

type DecimalParse =
  | { state: "empty" }
  | { state: "valid"; value: number }
  | { state: "invalid" };

const parseDecimal = (raw: string): DecimalParse => {
  const trimmed = raw.trim();
  if (!trimmed) return { state: "empty" };

  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return { state: "invalid" };

  return { state: "valid", value };
};

const parseInteger = (raw: string): DecimalParse => {
  const decimal = parseDecimal(raw);
  if (decimal.state !== "valid") return decimal;
  if (!Number.isInteger(decimal.value)) return { state: "invalid" };

  return decimal;
};

/** Parse a `datetime-local` value (local time, no timezone) into epoch milliseconds. */
const parseMeasuredAt = (
  raw: string
): { state: "empty" } | { state: "valid"; value: number } | { state: "invalid" } => {
  const trimmed = raw.trim();
  if (!trimmed) return { state: "empty" };

  const parsed = dayjs(trimmed);
  if (!parsed.isValid()) return { state: "invalid" };

  return { state: "valid", value: parsed.valueOf() };
};

export const validateVitalSignForm = (
  values: VitalSignFormValues
): VitalSignFieldErrors => {
  const errors: VitalSignFieldErrors = {};

  const height = parseDecimal(values.heightCm);
  const weight = parseDecimal(values.weightKg);
  const systolic = parseInteger(values.bloodPressureSystolic);
  const diastolic = parseInteger(values.bloodPressureDiastolic);
  const heartRate = parseInteger(values.heartRateBpm);

  if (height.state === "invalid") errors.heightCm = VITAL_SIGN_MESSAGES.invalidDecimal;
  if (weight.state === "invalid") errors.weightKg = VITAL_SIGN_MESSAGES.invalidDecimal;
  if (systolic.state === "invalid")
    errors.bloodPressureSystolic = VITAL_SIGN_MESSAGES.invalidInteger;
  if (diastolic.state === "invalid")
    errors.bloodPressureDiastolic = VITAL_SIGN_MESSAGES.invalidInteger;
  if (heartRate.state === "invalid")
    errors.heartRateBpm = VITAL_SIGN_MESSAGES.invalidInteger;

  // Blood pressure is atomic: both supplied or both omitted.
  const systolicFilled = systolic.state !== "empty";
  const diastolicFilled = diastolic.state !== "empty";
  let partialBloodPressure = false;
  if (systolicFilled !== diastolicFilled) {
    partialBloodPressure = true;
    if (!systolicFilled) errors.bloodPressureSystolic = VITAL_SIGN_MESSAGES.partialBloodPressure;
    if (!diastolicFilled) errors.bloodPressureDiastolic = VITAL_SIGN_MESSAGES.partialBloodPressure;
  }

  const hasCompleteBloodPressure = systolic.state === "valid" && diastolic.state === "valid";

  // When both are valid, systolic must be greater than diastolic.
  if (hasCompleteBloodPressure && systolic.value <= diastolic.value) {
    errors.bloodPressureSystolic = VITAL_SIGN_MESSAGES.bloodPressureOrder;
  }

  // Blood type is an optional snapshot; validate the enum only when provided.
  const bloodType = values.bloodType.trim();
  if (bloodType && !ALLOWED_BLOOD_TYPES.has(bloodType)) {
    errors.bloodType = VITAL_SIGN_MESSAGES.invalidBloodType;
  }

  // Measurement time is optional; validate format/skew only when provided.
  const measuredAt = parseMeasuredAt(values.measuredAt);
  if (measuredAt.state === "invalid") {
    errors.measuredAt = VITAL_SIGN_MESSAGES.invalidMeasuredAt;
  } else if (measuredAt.state === "valid" && measuredAt.value > Date.now() + FUTURE_SKEW_MS) {
    errors.measuredAt = VITAL_SIGN_MESSAGES.futureMeasuredAt;
  }

  // At least one real measurement is required. Blood type alone is never enough.
  const hasMeasurement =
    height.state === "valid" ||
    weight.state === "valid" ||
    heartRate.state === "valid" ||
    hasCompleteBloodPressure;

  // A partial blood pressure already surfaces a more actionable message, so don't
  // double up with the generic "enter at least one measurement" form error.
  if (!hasMeasurement && !partialBloodPressure) {
    errors.form = VITAL_SIGN_MESSAGES.empty;
  }

  return errors;
};

export const hasVitalSignErrors = (errors: VitalSignFieldErrors): boolean =>
  Object.keys(errors).length > 0;

/**
 * Build the request payload from validated form values. Only fields the FE is allowed to
 * send are included; absent metrics stay absent (never coerced to 0). Server-derived fields
 * (patientId, visitId, measuredBy, source, status, bmi, ...) are never added here.
 */
export const buildVitalSignPayload = (
  values: VitalSignFormValues
): CreatePatientVitalSignRequestDto => {
  const payload: CreatePatientVitalSignRequestDto = {};

  const height = parseDecimal(values.heightCm);
  if (height.state === "valid") payload.heightCm = height.value;

  const weight = parseDecimal(values.weightKg);
  if (weight.state === "valid") payload.weightKg = weight.value;

  const systolic = parseInteger(values.bloodPressureSystolic);
  const diastolic = parseInteger(values.bloodPressureDiastolic);
  if (systolic.state === "valid" && diastolic.state === "valid") {
    payload.bloodPressureSystolic = systolic.value;
    payload.bloodPressureDiastolic = diastolic.value;
  }

  const heartRate = parseInteger(values.heartRateBpm);
  if (heartRate.state === "valid") payload.heartRateBpm = heartRate.value;

  const bloodType = values.bloodType.trim();
  if (bloodType) payload.bloodType = bloodType;

  const measuredAt = parseMeasuredAt(values.measuredAt);
  if (measuredAt.state === "valid") payload.measuredAt = measuredAt.value;

  const note = values.note.trim();
  if (note) payload.note = note;

  return payload;
};
