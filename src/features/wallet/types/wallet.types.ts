export type WalletTransactionType = "earn" | "spend";

export type WalletTransactionStatus = "pending" | "completed" | "failed";

export interface WalletTransaction {
  _id: string;
  type: WalletTransactionType;
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

export interface WalletDetails {
  coinBalance: number;
  totalCoinEarned: number;
  totalCoinUsed: number;
  transactions: WalletTransaction[];
  pagination: WalletPagination;
}

export interface WalletBalanceData {
  balance: number;
}

export type WalletFilter = "all" | WalletTransactionType;
