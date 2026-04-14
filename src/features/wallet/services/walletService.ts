import { getWalletBalance, getWalletDetails } from "@/apis/wallet/wallet.api";
import {
  WalletAccountType,
  WalletBalanceData,
  WalletDetails,
  WalletTransaction,
  WalletTransactionApiDto,
  WalletTransactionDirection,
} from "@/features/wallet/types/wallet.types";

const inferWalletType = (walletType: WalletAccountType | undefined, reason: string, type: string): WalletAccountType => {
  if (walletType) {
    return walletType;
  }

  const combined = `${reason} ${type}`.toLowerCase();
  if (combined.includes("credit") || combined.includes("refund") || combined.includes("top") || combined.includes("pay")) {
    return "credit";
  }

  return "coin";
};

const inferDirection = (walletType: WalletAccountType, type: string, reason: string): WalletTransactionDirection => {
  const combined = `${type} ${reason}`.toLowerCase();

  if (walletType === "credit") {
    if (combined.includes("top") || combined.includes("refund") || combined.includes("deposit") || combined.includes("credit")) {
      return "income";
    }

    return "expense";
  }

  if (combined.includes("earn") || combined.includes("refund") || combined.includes("reward") || combined.includes("expired")) {
    return "income";
  }

  return "expense";
};

const normalizeTransaction = (
  transaction: WalletTransactionApiDto,
  fallbackWalletType: WalletAccountType
): WalletTransaction => {
  const type = String(transaction.type ?? transaction.transactionType ?? transaction.reason ?? fallbackWalletType);
  const reason = String(transaction.reason ?? transaction.type ?? transaction.transactionType ?? "");
  const walletType = inferWalletType(transaction.walletType ?? fallbackWalletType, reason, type);
  const direction = inferDirection(walletType, type, reason);

  return {
    _id: transaction._id ?? transaction.id ?? `${walletType}-${transaction.createdAt ?? Date.now()}-${transaction.amount ?? 0}`,
    walletType,
    type,
    direction,
    amount: Number(transaction.amount ?? 0),
    reason,
    description: transaction.description,
    appointmentId: transaction.appointmentId,
    status: transaction.status,
    createdAt: transaction.createdAt ?? new Date().toISOString(),
  };
};

const getBalance = async (): Promise<WalletBalanceData> => {
  const response = await getWalletBalance();
  return {
    balance: response.data.balance,
    coinBalance: response.data.coinBalance,
    creditBalance: response.data.creditBalance,
  };
};

const getDetails = async (page = 1, limit = 10): Promise<WalletDetails> => {
  const response = await getWalletDetails(page, limit);
  const coinTransactions = (response.data.transactions ?? []).map((transaction) =>
    normalizeTransaction(transaction, "coin")
  );
  const creditTransactions = (response.data.creditTransactions ?? []).map((transaction) =>
    normalizeTransaction(transaction, "credit")
  );

  return {
    coinBalance: response.data.coinBalance,
    creditBalance: response.data.creditBalance,
    totalCoinEarned: response.data.totalCoinEarned,
    totalCoinUsed: response.data.totalCoinUsed,
    totalCoinExpired: response.data.totalCoinExpired ?? 0,
    totalCredited: response.data.totalCredited ?? 0,
    totalDebited: response.data.totalDebited ?? 0,
    transactions: [...creditTransactions, ...coinTransactions].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    ),
    creditTransactions,
    pagination: response.data.pagination,
    creditPagination: response.data.creditPagination,
  };
};

export const walletService = {
  getBalance,
  getDetails,
};
