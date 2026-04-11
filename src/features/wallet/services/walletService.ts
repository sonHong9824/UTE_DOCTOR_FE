import { getWalletBalance, getWalletDetails } from "@/apis/wallet/wallet.api";
import { WalletBalanceData, WalletDetails } from "@/features/wallet/types/wallet.types";

const getBalance = async (): Promise<WalletBalanceData> => {
  const response = await getWalletBalance();
  return {
    balance: response.data.balance,
  };
};

const getDetails = async (page = 1, limit = 10): Promise<WalletDetails> => {
  const response = await getWalletDetails(page, limit);
  return {
    coinBalance: response.data.coinBalance,
    totalCoinEarned: response.data.totalCoinEarned,
    totalCoinUsed: response.data.totalCoinUsed,
    transactions: response.data.transactions,
    pagination: response.data.pagination,
  };
};

export const walletService = {
  getBalance,
  getDetails,
};
