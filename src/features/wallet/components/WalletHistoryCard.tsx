import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletFilter, WalletPagination, WalletTransaction } from "@/features/wallet/types/wallet.types";
import {
    formatWalletDateTime,
    getWalletAmountLabel,
    getWalletStatusClassName,
    getWalletStatusLabel,
    getWalletTransactionColor,
    getWalletTransactionKindLabel,
    getWalletTypeLabel,
} from "@/features/wallet/utils/wallet.utils";
import { AlertCircle, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Zap } from "lucide-react";

interface WalletHistoryCardProps {
  loading: boolean;
  transactions: WalletTransaction[];
  filter: WalletFilter;
  pagination: WalletPagination;
  onFilterChange: (filter: WalletFilter) => void;
  onPageChange: (page: number) => void;
  onSelectTransaction: (transaction: WalletTransaction) => void;
}

export const WalletHistoryCard = ({
  loading,
  transactions,
  filter,
  pagination,
  onFilterChange,
  onPageChange,
  onSelectTransaction,
}: WalletHistoryCardProps) => {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Zap className="h-5 w-5 text-sky-600" />
          Transaction history
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Giao dịch ({pagination.total})</h3>
          <div className="flex flex-wrap gap-2">
            {(["all", "credit", "coin"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onFilterChange(tab)}
                className={
                  "px-3 py-1 text-xs font-medium rounded-full transition " +
                  (filter === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                }
              >
                {tab === "all" ? "All" : tab === "credit" ? "Credit" : "Coin"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <>
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-20 w-full rounded-lg" />
            ))}
          </>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-slate-400" />
            <p className="text-sm">Chưa có giao dịch</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <button
                key={transaction._id}
                onClick={() => onSelectTransaction(transaction)}
                className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={
                        "p-2 rounded-lg mt-1 " +
                        (transaction.direction === "income" ? "bg-emerald-100" : "bg-rose-100")
                      }
                    >
                      {transaction.direction === "income" ? (
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-rose-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-slate-900">{getWalletTransactionKindLabel(transaction)}</p>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {getWalletTypeLabel(transaction.walletType)}
                        </Badge>
                      </div>
                      {transaction.description && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{transaction.description}</p>
                      )}
                    </div>
                  </div>

                  <p className={"text-lg font-bold " + getWalletTransactionColor(transaction.direction)}>
                    {getWalletAmountLabel(transaction)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Badge className={getWalletStatusClassName(transaction.status)}>
                    {getWalletStatusLabel(transaction.status)}
                  </Badge>
                  <p className="text-xs text-slate-500">{formatWalletDateTime(transaction.createdAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-slate-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
