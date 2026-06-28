import axios from "axios";

import type {
  ReceptionistFormErrors,
  ReceptionistFormState,
} from "@/features/admin-receptionists/types/admin-receptionist.types";
import type { AdminCreateReceptionistPayload } from "@/types/admin-staff.dto";
import { buildZonedISO, toUTCISOString } from "@/utils/time.util";

export const createInitialReceptionistForm = (): ReceptionistFormState => ({
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  hospitalName: "",
});

export const validateReceptionistForm = (
  form: ReceptionistFormState
): ReceptionistFormErrors => {
  const errors: ReceptionistFormErrors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Vui lòng nhập họ và tên.";
  }

  if (!form.email.trim()) {
    errors.email = "Vui lòng nhập email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Email không hợp lệ.";
  }

  return errors;
};

const optionalValue = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed || undefined;
};

export const buildReceptionistPayload = (
  form: ReceptionistFormState
): AdminCreateReceptionistPayload => ({
  profile: {
    name: form.fullName.trim(),
    email: form.email.trim(),
    phone: optionalValue(form.phone),
    gender: optionalValue(form.gender),
    address: optionalValue(form.address),
    dob: form.dateOfBirth
      ? toUTCISOString(buildZonedISO(form.dateOfBirth, "00:00"))
      : undefined,
  },
  hospitalName: optionalValue(form.hospitalName),
});

export const getCreateReceptionistErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return error instanceof Error
      ? error.message
      : "Không thể tạo tài khoản lễ tân. Vui lòng thử lại.";
  }

  const message = String(error.response?.data?.message ?? error.message ?? "");
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("email") && normalizedMessage.includes("exist")) {
    return "Email này đã tồn tại trong hệ thống.";
  }
  if (error.response?.status === 403) {
    return "Bạn không có quyền tạo tài khoản lễ tân.";
  }
  if (!error.response && error.request) {
    return "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
  }

  return message || "Không thể tạo tài khoản lễ tân. Vui lòng thử lại.";
};

export const getReceptionistListErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError<{ message?: string }>(error)) {
    return error instanceof Error
      ? error.message
      : "Không thể tải danh sách lễ tân.";
  }
  if (error.response?.status === 403) {
    return "Bạn không có quyền xem danh sách lễ tân.";
  }
  if (!error.response && error.request) {
    return "Không thể kết nối đến máy chủ.";
  }
  return error.response?.data?.message || "Không thể tải danh sách lễ tân.";
};
