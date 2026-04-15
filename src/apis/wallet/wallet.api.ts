import { WalletCoinBreakdownItem, WalletTransactionApiDto } from "@/features/wallet/types/wallet.types";
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

export type WalletCoinSummaryApiResponse = DataResponse<{
  totalBalance: number;
  usableCoin: number;
  expiredCoin: number;
  expiringSoon: number;
  breakdown: Array<{
    transactionId: string;
    amount: number;
    used: number;
    remaining: number;
    createdAt: number | string;
    expiresAt: number | string | null;
    category: WalletCoinBreakdownItem["category"];
    isExpiringSoon: boolean;
  }>;
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

export const getWalletCoinSummary = async () => {
  try {
    const res = await axiosClient.get<WalletCoinSummaryApiResponse>("/wallet/coin/summary");
    return res.data;
  } catch (e) {
    console.error("Failed to fetch wallet coin summary:", e);
    throw e;
  }
};

const walletApi = {
  getWalletBalance,
  getWalletDetails,
  getWalletCoinSummary,
};

export default walletApi;
