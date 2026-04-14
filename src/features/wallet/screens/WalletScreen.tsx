"use client";

import { TransactionDetailModal } from "@/features/wallet/components/TransactionDetailModal";
import { WalletDetailsCard } from "@/features/wallet/components/WalletDetailsCard";
import { WalletHeader } from "@/features/wallet/components/WalletHeader";
import { WalletHistoryCard } from "@/features/wallet/components/WalletHistoryCard";
import { WalletInfoCards } from "@/features/wallet/components/WalletInfoCards";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import { Wallet, Zap } from "lucide-react";

export default function WalletScreen() {
  const {
    loading,
    errorMessage,
    filter,
    details,
    pagination,
    filteredTransactions,
    selectedTransaction,
    isTransactionModalOpen,
    setFilter,
    handlePageChange,
    openTransactionModal,
    closeTransactionModal,
    coinBalance,
    creditBalance,
    totalCoinEarned,
    totalCoinUsed,
    totalCoinExpired,
    totalCredited,
    totalDebited,
  } = useWallet();

  return (
    <div className="space-y-6 p-6">
      <WalletHeader coinBalance={coinBalance} creditBalance={creditBalance} loading={loading} />

      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
      )}

      {loading || !details ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
          Đang tải dữ liệu ví...
        </div>
      ) : (
        <WalletDetailsCard
          coinBalance={coinBalance}
          creditBalance={creditBalance}
          totalCoinEarned={totalCoinEarned}
          totalCoinUsed={totalCoinUsed}
          totalCoinExpired={totalCoinExpired}
          totalCredited={totalCredited}
          totalDebited={totalDebited}
        />
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <WalletHistoryCard
          loading={loading}
          transactions={filteredTransactions}
          filter={filter}
          pagination={pagination}
          onFilterChange={setFilter}
          onPageChange={handlePageChange}
          onSelectTransaction={openTransactionModal}
        />

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Wallet className="h-4 w-4 text-slate-600" />
              Balance snapshots
            </div>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Credit</span>
                <span className="font-semibold text-slate-900">{creditBalance.toLocaleString("vi-VN")} VND</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Coin</span>
                <span className="font-semibold text-slate-900">{coinBalance.toLocaleString("vi-VN")} coin</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Zap className="h-4 w-4 text-sky-600" />
              Filtered history
            </div>
            <p className="mt-2">
              Use the filter chips to switch between all, credit, and coin transactions. Each row shows the wallet type, amount, description, and status.
            </p>
          </div>
        </div>
      </div>

      <WalletInfoCards />

      <TransactionDetailModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        transaction={selectedTransaction}
      />
    </div>
  );
}
