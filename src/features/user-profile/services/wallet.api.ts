// Wallet API layer used in user profile (HTTP-only).
import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export const getWalletBalance = async () => {
  const res = await axiosClient.get<DataResponse<{ balance: number }>>("/wallet/balance");
  return res.data;
};
