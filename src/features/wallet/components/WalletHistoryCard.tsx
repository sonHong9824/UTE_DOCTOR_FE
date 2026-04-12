import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletFilter, WalletPagination, WalletTransaction } from "@/features/wallet/types/wallet.types";
import {
    formatWalletDateTime,
    getWalletReasonLabel,
    getWalletStatusClassName,
    getWalletStatusLabel,
    getWalletTransactionColor,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Lịch sử giao dịch coin
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Giao dịch ({pagination.total})</h3>
          <div className="flex gap-2">
            {(["all", "earn", "spend"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => onFilterChange(tab)}
                className={
                  "px-3 py-1 text-xs font-medium rounded-full transition " +
                  (filter === tab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300")
                }
              >
                {tab === "all" ? "Tất cả" : tab === "earn" ? "Nhận" : "Dùng"}
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
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">Chưa có giao dịch</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <button
                key={transaction._id}
                onClick={() => onSelectTransaction(transaction)}
                className="w-full text-left p-4 border rounded-lg hover:shadow-md transition bg-white hover:bg-gray-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={
                        "p-2 rounded-lg mt-1 " +
                        (transaction.type === "earn" ? "bg-green-100" : "bg-red-100")
                      }
                    >
                      {transaction.type === "earn" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-sm">{getWalletReasonLabel(transaction.reason)}</p>
                      {transaction.description && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{transaction.description}</p>
                      )}
                    </div>
                  </div>

                  <p className={"text-lg font-bold " + getWalletTransactionColor(transaction.type)}>
                    {transaction.type === "earn" ? "+" : "-"}
                    {transaction.amount}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <Badge className={getWalletStatusClassName(transaction.status)}>
                    {getWalletStatusLabel(transaction.status)}
                  </Badge>
                  <p className="text-xs text-gray-500">{formatWalletDateTime(transaction.createdAt)}</p>
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
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
