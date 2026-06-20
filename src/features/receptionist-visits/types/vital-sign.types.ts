import type {
  VitalSignMetricStatus,
  VitalSignRecordResponseDto,
} from "@/apis/receptionist/receptionist.api";

/** Backend-owned metric classification value (re-exported for the feature layer). */
export type VitalSignMetricStatusValue = VitalSignMetricStatus;

/**
 * Raw form values are kept as strings (controlled inputs). The pure validation /
 * payload layer parses and normalizes them before the request is built.
 */
export interface VitalSignFormValues {
  heightCm: string;
  weightKg: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRateBpm: string;
  bloodType: string;
  /** `datetime-local` input value (local time, no timezone). Empty => server time. */
  measuredAt: string;
  note: string;
}

export type VitalSignFieldKey = keyof VitalSignFormValues;

/** Per-field messages plus a `form`-level message for cross-field rules (at-least-one). */
export type VitalSignFieldErrors = Partial<Record<VitalSignFieldKey | "form", string>>;

/** The saved record the dialog shows after a successful write. */
export type VitalSignRecord = VitalSignRecordResponseDto;

export const EMPTY_VITAL_SIGN_FORM: VitalSignFormValues = {
  heightCm: "",
  weightKg: "",
  bloodPressureSystolic: "",
  bloodPressureDiastolic: "",
  heartRateBpm: "",
  bloodType: "",
  measuredAt: "",
  note: "",
};
