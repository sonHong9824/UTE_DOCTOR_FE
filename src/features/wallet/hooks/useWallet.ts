"use client";

import { walletService } from "@/features/wallet/services/walletService";
import {
    WalletDetails,
    WalletFilter,
    WalletPagination,
    WalletTransaction,
} from "@/features/wallet/types/wallet.types";
import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_LIMIT = 10;

const EMPTY_PAGINATION: WalletPagination = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
};

export const useWallet = () => {
  const [details, setDetails] = useState<WalletDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [filter, setFilter] = useState<WalletFilter>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const openTransactionModal = useCallback((transaction: WalletTransaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  }, []);

  const closeTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false);
  }, []);

  const loadData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const walletDetails = await walletService.getDetails(page, DEFAULT_LIMIT);
      setDetails(walletDetails);
    } catch (error) {
      console.error("Failed to fetch wallet data", error);
      setErrorMessage("Không thể tải dữ liệu ví. Vui lòng thử lại.");
      setDetails(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData(1);
  }, [loadData]);

  useEffect(() => {
    const handleRefresh = () => {
      void loadData(1);
    };

    window.addEventListener("wallet:refresh", handleRefresh);
    return () => window.removeEventListener("wallet:refresh", handleRefresh);
  }, [loadData]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (!details) {
        return;
      }

      const currentPagination = filter === "credit" ? details.creditPagination : details.pagination;

      if (nextPage < 1 || nextPage > currentPagination.totalPages) {
        return;
      }

      void loadData(nextPage);
    },
    [details, filter, loadData]
  );

  const filteredTransactions = useMemo(() => {
    const source = details?.transactions ?? [];
    if (filter === "all") {
      return source;
    }

    return source.filter((transaction) => transaction.walletType === filter);
  }, [details?.transactions, filter]);

  const activePagination = useMemo(() => {
    if (!details) {
      return EMPTY_PAGINATION;
    }

    if (filter === "credit") {
      return details.creditPagination;
    }

    if (filter === "coin") {
      return details.pagination;
    }

    return {
      page: details.pagination.page,
      limit: details.pagination.limit,
      total: details.pagination.total + details.creditPagination.total,
      totalPages: Math.max(details.pagination.totalPages, details.creditPagination.totalPages),
    };
  }, [details, filter]);

  return {
    loading,
    errorMessage,
    filter,
    details,
    coinBalance: details?.coinBalance ?? 0,
    creditBalance: details?.creditBalance ?? 0,
    usableCoin: details?.usableCoin ?? 0,
    expiringSoon: details?.expiringSoon ?? 0,
    totalCoinEarned: details?.totalCoinEarned ?? 0,
    totalCoinUsed: details?.totalCoinUsed ?? 0,
    totalCoinExpired: details?.totalCoinExpired ?? 0,
    totalCredited: details?.totalCredited ?? 0,
    totalDebited: details?.totalDebited ?? 0,
    coinBreakdown: details?.coinBreakdown ?? [],
    pagination: activePagination,
    filteredTransactions,
    selectedTransaction,
    isTransactionModalOpen,

    setFilter,
    loadData,
    handlePageChange,
    openTransactionModal,
    closeTransactionModal,
  };
};
