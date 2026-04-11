"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    balance,
    details,
    pagination,
    filteredTransactions,
    selectedTransaction,
    isTransactionModalOpen,
    setFilter,
    handlePageChange,
    openTransactionModal,
    closeTransactionModal,
  } = useWallet();

  return (
    <div className="space-y-6 p-6">
      <WalletHeader balance={balance} loading={loading} />

      {errorMessage && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
      )}

      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Số dư
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        <TabsContent value="balance" className="mt-6">
          {loading || !details ? (
            <div className="text-center py-12 text-gray-600">Đang tải...</div>
          ) : (
            <WalletDetailsCard
              coinBalance={details.coinBalance}
              totalCoinEarned={details.totalCoinEarned}
              totalCoinUsed={details.totalCoinUsed}
            />
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <WalletHistoryCard
            loading={loading}
            transactions={filteredTransactions}
            filter={filter}
            pagination={pagination}
            onFilterChange={setFilter}
            onPageChange={handlePageChange}
            onSelectTransaction={openTransactionModal}
          />
        </TabsContent>
      </Tabs>

      <WalletInfoCards />

      <TransactionDetailModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        transaction={selectedTransaction}
      />
    </div>
  );
}
