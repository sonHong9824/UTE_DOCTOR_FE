import { WalletTransactionApiDto } from "@/features/wallet/types/wallet.types";
import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export type WalletBalanceApiResponse = DataResponse<{
  balance: number;
  coinBalance: number;
  creditBalance: number;
}>;

export type WalletDetailsApiResponse = DataResponse<{
  coinBalance: number;
  totalCoinEarned: number;
  totalCoinUsed: number;
  totalCoinExpired?: number;
  creditBalance: number;
  totalCredited?: number;
  totalDebited?: number;
  transactions: WalletTransactionApiDto[];
  creditTransactions: WalletTransactionApiDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  creditPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;

export const getWalletBalance = async () => {
  try {
    const res = await axiosClient.get<WalletBalanceApiResponse>("/wallet/balance");

    return res.data;
  } catch (e) {
    console.error("Failed to fetch wallet balance:", e);
    throw e;
  }
};

export const getWalletDetails = async (page: number = 1, limit: number = 10) => {
  try {
    const res = await axiosClient.get<WalletDetailsApiResponse>(`/wallet/details?page=${page}&limit=${limit}`);

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
