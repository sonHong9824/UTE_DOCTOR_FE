import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export const getWalletBalance = async () => {
  try {
    const res = await axiosClient.get<DataResponse<{
      balance: number;
    }>>("/wallet/balance");

    return res.data;
  } catch (e) {
    console.error("Failed to fetch wallet balance:", e);
    throw e;
  }
};

export default {
  getWalletBalance
};
