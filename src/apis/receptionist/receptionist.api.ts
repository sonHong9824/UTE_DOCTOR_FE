import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { resolveBrowserTimezone } from "@/utils/time.util";

export interface VisitApiItem {
  visitId: string;
  appointmentId: string;
  status: "CREATED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  scheduledAt: number;
  patientName: string;
  doctorName: string;
  appointmentStatus?: string;
}

export type ReceptionistVisitsResponse = DataResponse<VisitApiItem[]>;

export type CheckInVisitResponse = DataResponse<{
  visitId: string;
  status: "CHECKED_IN";
}>;

/**
 * Receptionist-facing write payload for `POST /receptionist/visits/:visitId/vital-signs`.
 *
 * The FE may ONLY send these fields. `patientId`, `appointmentId`, `visitId` (in body),
 * `measuredBy`, `source`, `status`, `recordState`, `bmi`, `createdAt`, `updatedAt` are
 * server-derived and rejected (HTTP 400) if sent.
 */
export interface CreatePatientVitalSignRequestDto {
  heightCm?: number;
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRateBpm?: number;
  bloodType?: string;
  /** Epoch milliseconds (UTC). Omitted => backend uses server time. */
  measuredAt?: number;
  note?: string;
}

/** Backend-owned metric classification; the FE renders it but never derives it. */
export type VitalSignMetricStatus = "NORMAL" | "LOW" | "HIGH" | "UNKNOWN";

/** Focused mirror of the contract's `PatientVitalSignRecordDto` (only what the write side displays). */
export interface VitalSignRecordResponseDto {
  id: string;
  patientId: string;
  appointmentId?: string;
  visitId?: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRateBpm?: number;
  status?: {
    bmi?: VitalSignMetricStatus;
    bloodPressure?: VitalSignMetricStatus;
    heartRate?: VitalSignMetricStatus;
    weight?: VitalSignMetricStatus;
  };
  source: string;
  recordState: string;
  measuredAt: number;
  measuredBy?: {
    id: string;
    name?: string;
    role: "RECEPTIONIST" | "DOCTOR" | "NURSE" | "SYSTEM";
  };
  note?: string;
  createdAt: number;
  updatedAt?: number;
}

export type CreateVisitVitalSignResponse = DataResponse<{
  vitalSign: VitalSignRecordResponseDto;
}>;

export const getTodayVisits = async () => {
  const res = await axiosClient.get<ReceptionistVisitsResponse>("/receptionist/visits", {
    // The backend derives the local calendar day from this zone; timestamps remain epoch values.
    params: { timezone: resolveBrowserTimezone() },
  });
  console.log("API Response for getTodayVisits:", res.data);
  return res.data;
};

export const checkInVisit = async (visitId: string) => {
  const res = await axiosClient.patch<CheckInVisitResponse>(
    `/receptionist/visits/${visitId}/check-in`,
    {}
  );

  return res.data;
};

export const createVisitVitalSign = async (
  visitId: string,
  payload: CreatePatientVitalSignRequestDto
) => {
  const res = await axiosClient.post<CreateVisitVitalSignResponse>(
    `/receptionist/visits/${visitId}/vital-signs`,
    payload
  );

  return res.data;
};
