import type {
  HealthMetricStatus,
  OverallHealthStatus,
  PatientHealthDataSource,
  PatientHealthSummaryDto,
  PatientHealthViewModel,
  PatientVitalSignRecordDto,
  VitalSignSource,
} from "@/features/patient-health/types/patient-health.types";
import {
  formatApiDateToLocalDate,
  formatApiDateToLocalDateTime,
} from "@/utils/time.util";

const EMPTY_VALUE = "Chưa có dữ liệu";

const statusLabels: Record<HealthMetricStatus, string> = {
  NORMAL: "Bình thường",
  LOW: "Thấp",
  HIGH: "Cao",
  UNKNOWN: "Chưa đánh giá",
};

const overallStatusLabels: Record<OverallHealthStatus, string> = {
  STABLE: "Ổn định",
  NEEDS_ATTENTION: "Cần theo dõi",
  UNEVALUATED: "Chưa đánh giá",
};

const sourceLabels: Record<VitalSignSource, string> = {
  RECEPTIONIST_CHECK_IN: "Dữ liệu được ghi nhận tại quầy tiếp nhận",
  VISIT_INTAKE: "Dữ liệu được ghi nhận trong quá trình khám",
  MIGRATED: "Dữ liệu được chuyển từ hồ sơ trước đây",
  UNKNOWN: "Nguồn dữ liệu chưa xác định",
};

const hasNumber = (value: number | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeBloodType = (value: string) => value.trim().toUpperCase().replace(/\s+/g, "");

export const resolveBloodTypeDisplay = (history: PatientVitalSignRecordDto[]): string => {
  const values = history
    .filter((record) => record.recordState === "ACTIVE")
    .map((record) => record.bloodType)
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map(normalizeBloodType);

  if (values.length === 0) return EMPTY_VALUE;

  const distinctValues = new Set(values);
  return distinctValues.size === 1 ? values[0] : "Chưa xác minh";
};

export const getMetricStatusLabel = (status?: HealthMetricStatus) =>
  status ? statusLabels[status] : "Chưa đánh giá";

export const getSourceLabel = (
  source: VitalSignSource | undefined,
  dataSource: PatientHealthDataSource
) => {
  if (dataSource === "MOCK") return "Dữ liệu minh họa";
  return source ? sourceLabels[source] : sourceLabels.UNKNOWN;
};

export const mapPatientHealthSummaryToViewModel = (
  summary: PatientHealthSummaryDto,
  dataSource: PatientHealthDataSource
): PatientHealthViewModel => {
  const latest = summary.latest;
  const hasBloodPressure =
    hasNumber(latest?.bloodPressureSystolic) && hasNumber(latest?.bloodPressureDiastolic);

  const bloodPressurePoints = summary.history
    .filter(
      (record) =>
        hasNumber(record.bloodPressureSystolic) && hasNumber(record.bloodPressureDiastolic)
    )
    .slice(0, 5)
    .reverse()
    .map((record) => ({
      id: record.id,
      label: formatApiDateToLocalDate(record.measuredAt).slice(0, 5),
      measuredAt: record.measuredAt,
      systolic: record.bloodPressureSystolic,
      diastolic: record.bloodPressureDiastolic,
    }));

  const heartRatePoints = summary.history
    .filter((record) => hasNumber(record.heartRateBpm))
    .slice(0, 5)
    .reverse()
    .map((record) => ({
      id: record.id,
      label: formatApiDateToLocalDate(record.measuredAt).slice(0, 5),
      measuredAt: record.measuredAt,
      heartRate: record.heartRateBpm,
    }));

  return {
    metrics: [
      {
        key: "height",
        label: "Chiều cao",
        value: hasNumber(latest?.heightCm) ? String(latest.heightCm) : EMPTY_VALUE,
        unit: hasNumber(latest?.heightCm) ? "cm" : undefined,
      },
      {
        key: "weight",
        label: "Cân nặng",
        value: hasNumber(latest?.weightKg) ? String(latest.weightKg) : EMPTY_VALUE,
        unit: hasNumber(latest?.weightKg) ? "kg" : undefined,
        status: hasNumber(latest?.weightKg) ? latest.status?.weight : undefined,
      },
      {
        key: "bmi",
        label: "BMI",
        value: hasNumber(latest?.bmi) ? String(latest.bmi) : EMPTY_VALUE,
        status: hasNumber(latest?.bmi) ? latest.status?.bmi : undefined,
      },
      {
        key: "bloodType",
        label: "Nhóm máu",
        value: resolveBloodTypeDisplay(summary.history),
      },
      {
        key: "bloodPressure",
        label: "Huyết áp",
        value: hasBloodPressure
          ? `${latest.bloodPressureSystolic}/${latest.bloodPressureDiastolic}`
          : EMPTY_VALUE,
        unit: hasBloodPressure ? "mmHg" : undefined,
        status: hasBloodPressure ? latest.status?.bloodPressure : undefined,
      },
      {
        key: "heartRate",
        label: "Nhịp tim",
        value: hasNumber(latest?.heartRateBpm) ? String(latest.heartRateBpm) : EMPTY_VALUE,
        unit: hasNumber(latest?.heartRateBpm) ? "bpm" : undefined,
        status: hasNumber(latest?.heartRateBpm) ? latest.status?.heartRate : undefined,
      },
    ],
    overallStatus: summary.overallStatus,
    overallStatusLabel: overallStatusLabels[summary.overallStatus] ?? "Chưa đánh giá",
    measuredAtLabel: latest
      ? formatApiDateToLocalDateTime(latest.measuredAt)
      : "Chưa có dữ liệu",
    provenanceLabel: getSourceLabel(latest?.source, dataSource),
    bloodPressurePoints,
    heartRatePoints,
    history: summary.history,
  };
};

