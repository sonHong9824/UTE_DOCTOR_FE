import axios, { AxiosError } from "axios";

import type {
  OverallHealthStatus,
  PatientHealthSummaryDto,
  PatientVitalSignRecordDto,
} from "@/features/patient-health/types/patient-health.types";
import axiosClient from "@/lib/axiosClient";
import type { DataResponse } from "@/types/apiDTO";

const HEALTH_SUMMARY_PATH = "/patients/me/health-summary";
const overallStatuses: OverallHealthStatus[] = ["STABLE", "NEEDS_ATTENTION", "UNEVALUATED"];

const isVitalSignRecord = (value: unknown): value is PatientVitalSignRecordDto => {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<PatientVitalSignRecordDto>;

  return (
    typeof record.id === "string" &&
    typeof record.patientId === "string" &&
    typeof record.measuredAt === "number" &&
    Number.isFinite(record.measuredAt) &&
    typeof record.createdAt === "number" &&
    Number.isFinite(record.createdAt) &&
    typeof record.source === "string" &&
    record.recordState === "ACTIVE"
  );
};

const normalizeHealthSummary = (value: unknown): PatientHealthSummaryDto => {
  if (!value || typeof value !== "object") {
    throw new Error("Phản hồi dữ liệu sức khỏe không hợp lệ.");
  }

  const summary = value as Partial<PatientHealthSummaryDto>;
  if (
    typeof summary.patientId !== "string" ||
    !Array.isArray(summary.history) ||
    !summary.history.every(isVitalSignRecord) ||
    typeof summary.generatedAt !== "number" ||
    !Number.isFinite(summary.generatedAt)
  ) {
    throw new Error("Phản hồi dữ liệu sức khỏe không đầy đủ.");
  }

  if (summary.latest !== null && !isVitalSignRecord(summary.latest)) {
    throw new Error("Bản ghi sức khỏe gần nhất không hợp lệ.");
  }

  const overallStatus = overallStatuses.includes(summary.overallStatus as OverallHealthStatus)
    ? (summary.overallStatus as OverallHealthStatus)
    : "UNEVALUATED";

  return {
    patientId: summary.patientId,
    latest: summary.latest ?? null,
    history: summary.history,
    overallStatus,
    generatedAt: summary.generatedAt,
  };
};

export const getMyHealthSummary = async (limit = 10): Promise<PatientHealthSummaryDto> => {
  const response = await axiosClient.get<DataResponse<unknown>>(HEALTH_SUMMARY_PATH, {
    params: { limit },
  });

  return normalizeHealthSummary(response.data.data);
};

export const isPatientHealthMockFallbackEnabled = () =>
  process.env.NEXT_PUBLIC_PATIENT_HEALTH_MOCK_FALLBACK === "true";

export const isMissingHealthSummaryRoute = (error: unknown): boolean => {
  if (!axios.isAxiosError(error) || error.response?.status !== 404) return false;

  const data = error.response.data as
    | { code?: unknown; message?: unknown; error?: unknown }
    | string
    | undefined;
  const errorCode = typeof data === "object" && data ? data.code : undefined;
  if (errorCode === "ROUTE_NOT_FOUND") return true;
  if (errorCode === "PATIENT_NOT_FOUND") return false;

  const message =
    typeof data === "string"
      ? data
      : typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : "";

  return /Cannot\s+GET\s+\/(?:api\/)?patients\/me\/health-summary\b/i.test(message);
};

export const getPatientHealthErrorMessage = (error: unknown): string => {
  if (error instanceof Error && !axios.isAxiosError(error)) return error.message;

  const apiError = error as AxiosError<{ message?: string; code?: string }>;
  if (apiError.response?.data?.code === "PATIENT_NOT_FOUND") {
    return "Không tìm thấy hồ sơ bệnh nhân cho tài khoản hiện tại.";
  }

  if (apiError.response?.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (apiError.response?.status === 403) return "Bạn không có quyền xem dữ liệu sức khỏe này.";
  if (apiError.response?.status === 404) return "Chưa thể truy cập dịch vụ dữ liệu sức khỏe.";
  if (apiError.response && apiError.response.status >= 500) {
    return "Máy chủ chưa thể tải dữ liệu sức khỏe. Vui lòng thử lại sau.";
  }
  if (apiError.request) return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.";

  return apiError.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu sức khỏe.";
};

