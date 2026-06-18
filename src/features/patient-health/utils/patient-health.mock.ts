import type { PatientHealthSummaryDto } from "@/features/patient-health/types/patient-health.types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const createMockPatientHealthSummary = (): PatientHealthSummaryDto => {
  const now = Date.now();
  const patientId = "mock-patient";
  const measurements = [
    { daysAgo: 28, systolic: 125, diastolic: 82, heartRate: 78, weightKg: 69 },
    { daysAgo: 21, systolic: 130, diastolic: 84, heartRate: 76, weightKg: 68.7 },
    { daysAgo: 14, systolic: 128, diastolic: 80, heartRate: 74, weightKg: 68.5 },
    { daysAgo: 7, systolic: 122, diastolic: 78, heartRate: 73, weightKg: 68.2 },
    { daysAgo: 0, systolic: 118, diastolic: 76, heartRate: 72, weightKg: 68 },
  ];

  const history = measurements
    .map((item, index) => {
      const measuredAt = now - item.daysAgo * DAY_MS;

      return {
        id: `mock-vital-sign-${index + 1}`,
        patientId,
        appointmentId: `mock-appointment-${index + 1}`,
        visitId: `mock-visit-${index + 1}`,
        bloodType: "A+",
        heightCm: 172,
        weightKg: item.weightKg,
        bmi: index === measurements.length - 1 ? 23 : 23.3,
        bloodPressureSystolic: item.systolic,
        bloodPressureDiastolic: item.diastolic,
        heartRateBpm: item.heartRate,
        status: {
          bmi: "NORMAL" as const,
          bloodPressure: "NORMAL" as const,
          heartRate: "NORMAL" as const,
          weight: "NORMAL" as const,
        },
        source: "RECEPTIONIST_CHECK_IN" as const,
        recordState: "ACTIVE" as const,
        measuredAt,
        measuredBy: {
          id: "mock-receptionist",
          name: "Nhân viên mẫu",
          role: "RECEPTIONIST" as const,
        },
        createdAt: measuredAt + 30_000,
      };
    })
    .sort((a, b) => b.measuredAt - a.measuredAt);

  return {
    patientId,
    latest: history[0],
    history,
    overallStatus: "STABLE",
    generatedAt: now,
  };
};

