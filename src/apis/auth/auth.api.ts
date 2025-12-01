import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { LoginResponse } from "@/types/authDTO/login.res.dto";
import { RegisterResponse } from "@/types/authDTO/register.res.dto";

export const login = async (form: { email: string; password: string }) => {
  const res = await axiosClient.post<DataResponse<LoginResponse>>("/auth/login", form);
  return res.data;
};

export const register = async (form: { email: string; password: string}) => {
  const res = await axiosClient.post<DataResponse<RegisterResponse>>("/auth/register", form);
  return res.data;
}

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const res = await axiosClient.post<DataResponse<LoginResponse>>("/auth/refresh", { refreshToken });
    return res.data;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
};