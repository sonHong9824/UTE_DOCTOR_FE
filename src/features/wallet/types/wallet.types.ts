export type WalletTransactionStatus = "pending" | "completed" | "failed";

export type WalletAccountType = "credit" | "coin";

export type WalletTransactionDirection = "income" | "expense";

export interface WalletTransaction {
  _id: string;
  walletType: WalletAccountType;
  type: string;
  direction: WalletTransactionDirection;
  amount: number;
  reason: string;
  description?: string;
  appointmentId?: string;
  status?: WalletTransactionStatus;
  createdAt: string;
}

export interface WalletPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type WalletCoinCategory = "active" | "expired" | "non_expiring";

export interface WalletCoinBreakdownItem {
  transactionId: string;
  amount: number;
  used: number;
  remaining: number;
  expiresAt?: string;
  category: WalletCoinCategory;
  isExpiringSoon: boolean;
}

export interface WalletCoinSummary {
  totalBalance: number;
  usableCoin: number;
  expiredCoin: number;
  expiringSoon: number;
  breakdown: WalletCoinBreakdownItem[];
}

export interface WalletDetails {
  coinBalance: number;
  creditBalance: number;
  usableCoin: number;
  expiringSoon: number;
  totalCoinEarned: number;
  totalCoinUsed: number;
  totalCoinExpired: number;
  totalCredited: number;
  totalDebited: number;
  coinBreakdown: WalletCoinBreakdownItem[];
  transactions: WalletTransaction[];
  creditTransactions: WalletTransaction[];
  pagination: WalletPagination;
  creditPagination: WalletPagination;
}

export interface WalletBalanceData {
  balance: number;
  coinBalance: number;
  creditBalance: number;
}

export type WalletFilter = "all" | WalletAccountType;

export interface WalletTransactionApiDto {
  _id?: string;
  id?: string;
  walletType?: WalletAccountType;
  type?: string;
  transactionType?: string;
  amount?: number;
  reason?: string;
  description?: string;
  appointmentId?: string;
  status?: WalletTransactionStatus;
  createdAt?: string;
}
