import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { LoginResponse } from "@/types/authDTO/login.res.dto";
import { RegisterResponse } from "@/types/authDTO/register.res.dto";

export interface LoginPayload {
  email: string;
  password: string;
}

export type RegisterRole = "PATIENT" | "DOCTOR";

export interface RegisterPayload {
  email: string;
  password: string;
  role?: RegisterRole;
  chuyenKhoaId?: string;
  degree?: string;
  yearsOfExperience?: number;
}

export const login = async (form: LoginPayload) => {
  const res = await axiosClient.post<DataResponse<LoginResponse>>("/auth/login", form);
  return res.data;
};

export const register = async (form: RegisterPayload) => {
  const res = await axiosClient.post<DataResponse<RegisterResponse>>("/auth/register", form);
  return res.data;
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const res = await axiosClient.post<DataResponse<{ accessToken: string; refreshToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
};

export const sendOtp = async (email: string) => {
  const res = await axiosClient.post<DataResponse<{ otp: string }>>("/auth/send-otp", { email });
  return res.data;
};

export const verifyOtp = async (payload: { email: string; otp: string }) => {
  const res = await axiosClient.post<DataResponse<null>>("/auth/verify-otp", payload);
  return res.data;
};
