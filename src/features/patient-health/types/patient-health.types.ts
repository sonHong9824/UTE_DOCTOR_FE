export type HealthMetricStatus = "NORMAL" | "LOW" | "HIGH" | "UNKNOWN";

export type OverallHealthStatus = "STABLE" | "NEEDS_ATTENTION" | "UNEVALUATED";

export type VitalSignRecordState = "ACTIVE" | "SUPERSEDED" | "VOIDED";

export type VitalSignSource =
  | "RECEPTIONIST_CHECK_IN"
  | "VISIT_INTAKE"
  | "MIGRATED"
  | "UNKNOWN";

export type PatientHealthDataSource = "API" | "MOCK";

export interface PatientVitalSignRecordDto {
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
    bmi?: HealthMetricStatus;
    bloodPressure?: HealthMetricStatus;
    heartRate?: HealthMetricStatus;
    weight?: HealthMetricStatus;
  };
  source: VitalSignSource;
  recordState: VitalSignRecordState;
  measuredAt: number;
  measuredBy?: {
    id: string;
    name?: string;
    role: "RECEPTIONIST" | "DOCTOR" | "NURSE" | "SYSTEM";
  };
  supersedesRecordId?: string;
  correctionReason?: string;
  correctedBy?: {
    id: string;
    role: "RECEPTIONIST" | "DOCTOR" | "NURSE" | "SYSTEM";
  };
  note?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface PatientHealthSummaryDto {
  patientId: string;
  latest: PatientVitalSignRecordDto | null;
  history: PatientVitalSignRecordDto[];
  overallStatus: OverallHealthStatus;
  generatedAt: number;
}

export interface PatientHealthMetricViewModel {
  key: "height" | "weight" | "bmi" | "bloodType" | "bloodPressure" | "heartRate";
  label: string;
  value: string;
  unit?: string;
  status?: HealthMetricStatus;
}

export interface PatientHealthChartPoint {
  id: string;
  label: string;
  measuredAt: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
}

export interface PatientHealthViewModel {
  metrics: PatientHealthMetricViewModel[];
  overallStatus: OverallHealthStatus;
  overallStatusLabel: string;
  measuredAtLabel: string;
  provenanceLabel: string;
  bloodPressurePoints: PatientHealthChartPoint[];
  heartRatePoints: PatientHealthChartPoint[];
  history: PatientVitalSignRecordDto[];
}

export type PatientHealthLoadState =
  | { status: "loading" }
  | {
      status: "success";
      dataSource: PatientHealthDataSource;
      data: PatientHealthSummaryDto;
      refreshing: boolean;
      refreshError?: string;
    }
  | {
      status: "empty";
      dataSource: "API";
      data: PatientHealthSummaryDto;
      refreshing: boolean;
      refreshError?: string;
    }
  | { status: "error"; message: string };

