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
  const [balance, setBalance] = useState<number>(0);
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

      const [walletBalance, walletDetails] = await Promise.all([
        walletService.getBalance(),
        walletService.getDetails(page, DEFAULT_LIMIT),
      ]);

      setBalance(walletBalance.balance);
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

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (!details?.pagination) {
        return;
      }

      if (nextPage < 1 || nextPage > details.pagination.totalPages) {
        return;
      }

      void loadData(nextPage);
    },
    [details?.pagination, loadData]
  );

  const filteredTransactions = useMemo(() => {
    const source = details?.transactions ?? [];
    if (filter === "all") {
      return source;
    }

    return source.filter((transaction) => transaction.type === filter);
  }, [details?.transactions, filter]);

  return {
    loading,
    errorMessage,
    filter,
    balance,
    details,
    pagination: details?.pagination ?? EMPTY_PAGINATION,
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
