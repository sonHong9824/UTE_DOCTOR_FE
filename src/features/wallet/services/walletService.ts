import { getWalletBalance, getWalletCoinSummary, getWalletDetails } from "@/apis/wallet/wallet.api";
import {
  WalletAccountType,
  WalletBalanceData,
  WalletCoinBreakdownItem,
  WalletDetails,
  WalletTransaction,
  WalletTransactionApiDto,
  WalletTransactionDirection,
} from "@/features/wallet/types/wallet.types";

const getCoinBreakdownRank = (item: WalletCoinBreakdownItem): number => {
  if (item.category === "expired") return 0;
  if (item.category === "active") return 1;
  return 2;
};

const getExpirySortTime = (item: WalletCoinBreakdownItem): number => {
  if (!item.expiresAt) return Number.MAX_SAFE_INTEGER;
  const parsed = new Date(item.expiresAt).getTime();
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const sortCoinBreakdownByFEFO = (items: WalletCoinBreakdownItem[]): WalletCoinBreakdownItem[] => {
  return [...items].sort((left, right) => {
    const rankDiff = getCoinBreakdownRank(left) - getCoinBreakdownRank(right);
    if (rankDiff !== 0) return rankDiff;

    const expiryDiff = getExpirySortTime(left) - getExpirySortTime(right);
    if (expiryDiff !== 0) return expiryDiff;

    return left.transactionId.localeCompare(right.transactionId);
  });
};

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
  const [response, coinSummaryResponse] = await Promise.all([
    getWalletDetails(page, limit),
    getWalletCoinSummary(),
  ]);

  const coinSummary = coinSummaryResponse.data;
  const coinBreakdown = sortCoinBreakdownByFEFO(coinSummary?.breakdown ?? []);
  const coinTransactions = (response.data.transactions ?? []).map((transaction) =>
    normalizeTransaction(transaction, "coin")
  );
  const creditTransactions = (response.data.creditTransactions ?? []).map((transaction) =>
    normalizeTransaction(transaction, "credit")
  );

  return {
    coinBalance: response.data.coinBalance,
    creditBalance: response.data.creditBalance,
    usableCoin: coinSummary?.usableCoin ?? response.data.coinBalance,
    expiringSoon: coinSummary?.expiringSoon ?? 0,
    totalCoinEarned: response.data.totalCoinEarned,
    totalCoinUsed: response.data.totalCoinUsed,
    totalCoinExpired: coinSummary?.expiredCoin ?? response.data.totalCoinExpired ?? 0,
    totalCredited: response.data.totalCredited ?? 0,
    totalDebited: response.data.totalDebited ?? 0,
    coinBreakdown,
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
