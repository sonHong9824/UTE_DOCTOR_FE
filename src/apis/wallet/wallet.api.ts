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

export const getWalletDetails = async (page: number = 1, limit: number = 10) => {
  try {
    const res = await axiosClient.get<DataResponse<{
      coinBalance: number;
      totalCoinEarned: number;
      totalCoinUsed: number;
      transactions: Array<{
        _id: string;
        type: 'earn' | 'spend';
        amount: number;
        reason: string;
        description?: string;
        appointmentId?: string;
        status?: 'pending' | 'completed' | 'failed';
        createdAt: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>>(`/wallet/details?page=${page}&limit=${limit}`);

    return res.data;
  } catch (e) {
    console.error("Failed to fetch wallet details:", e);
    throw e;
  }
};

export default {
  getWalletBalance,
  getWalletDetails,
};
