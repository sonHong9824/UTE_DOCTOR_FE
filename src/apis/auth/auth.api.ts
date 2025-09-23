import axiosClient from "@/lib/axiosClient";
import { ApiResponse } from "@/types/apiDTO";
import { LoginResponse } from "@/types/authDTO/login.res.dto";

export const login = async (form: { email: string; password: string }) => {
  const res = await axiosClient.post<ApiResponse<LoginResponse>>("/auth/login", form);
  return res.data;
};