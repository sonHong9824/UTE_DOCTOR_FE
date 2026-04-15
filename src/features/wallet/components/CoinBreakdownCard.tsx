import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletCoinBreakdownItem } from "@/features/wallet/types/wallet.types";
import { formatCoin } from "@/utils/money.util";
import { formatApiDateToLocalTimeWithSeconds, parseApiDateTimeToLocal } from "@/utils/time.util";
import { AlertTriangle, Clock3, ListOrdered } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CoinBreakdownCardProps {
  breakdown: WalletCoinBreakdownItem[];
}

const ITEMS_PER_PAGE = 3;

type ExpireFilter = "all" | "expired" | "not_expired";
type SortField = "default" | "expiresAt" | "createdAt";
type SortOrder = "asc" | "desc";

const categoryLabel: Record<WalletCoinBreakdownItem["category"], string> = {
  active: "Active",
  expired: "Expired",
  non_expiring: "Non-expiring",
};

const categoryClassName: Record<WalletCoinBreakdownItem["category"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  expired: "bg-rose-100 text-rose-700",
  non_expiring: "bg-slate-100 text-slate-700",
};

const formatWalletDateTime = (value: number | null | undefined): string => {
  if (!value) return "Khong gioi han";

  const parsed = parseApiDateTimeToLocal(value);
  if (!parsed) return "Khong gioi han";

  const date = parsed.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = formatApiDateToLocalTimeWithSeconds(parsed);

  return `${date} ${time}`;
};

export const CoinBreakdownCard = ({ breakdown }: CoinBreakdownCardProps) => {
  const [expireFilter, setExpireFilter] = useState<ExpireFilter>("all");
  const [sortField, setSortField] = useState<SortField>("default");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAndSortedBreakdown = useMemo(() => {
    const filtered = breakdown.filter((item) => {
      if (expireFilter === "expired") {
        return item.category === "expired";
      }

      if (expireFilter === "not_expired") {
        return item.category !== "expired";
      }

      return true;
    });

    if (sortField === "default") {
      return filtered;
    }

    return [...filtered].sort((left, right) => {
      const leftValue = left[sortField];
      const rightValue = right[sortField];

      if (leftValue == null && rightValue == null) return 0;
      if (leftValue == null) return 1;
      if (rightValue == null) return -1;

      const diff = leftValue - rightValue;
      if (diff === 0) {
        return left.transactionId.localeCompare(right.transactionId);
      }

      return sortOrder === "asc" ? diff : -diff;
    });
  }, [breakdown, expireFilter, sortField, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [expireFilter, sortField, sortOrder]);

  const handleResetDefault = () => {
    setExpireFilter("all");
    setSortField("default");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedBreakdown.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedBreakdown = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedBreakdown.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [safeCurrentPage, filteredAndSortedBreakdown]);

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <ListOrdered className="h-5 w-5 text-amber-600" />
          Coin Breakdown (FEFO)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            value={expireFilter}
            onChange={(event) => setExpireFilter(event.target.value as ExpireFilter)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="all">Tất cả lô coin</option>
            <option value="expired">Đã hết hạn</option>
            <option value="not_expired">Chưa hết hạn</option>
          </select>

          <select
            value={sortField}
            onChange={(event) => setSortField(event.target.value as SortField)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="default">Thứ tự mặc định (FEFO)</option>
            <option value="expiresAt">Sort theo Expires At</option>
            <option value="createdAt">Sort theo Created At</option>
          </select>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            disabled={sortField === "default"}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="asc">Tăng dần</option>
            <option value="desc">Giảm dần</option>
          </select>

          <button
            type="button"
            onClick={handleResetDefault}
            className="h-9 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Mặc định
          </button>
        </div>

        {filteredAndSortedBreakdown.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Khong co du lieu phu hop bo loc.
          </div>
        ) : (
          <div className="space-y-3">
            {pagedBreakdown.map((item) => (
              <div key={item.transactionId} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge className={categoryClassName[item.category]}>{categoryLabel[item.category]}</Badge>
                    {item.isExpiringSoon && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Expiring soon
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm font-semibold text-slate-900">Remain: {formatCoin(item.remaining)}</div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-5">
                  <div>
                    <p className="text-slate-500">Amount</p>
                    <p className="font-semibold text-slate-900">{formatCoin(item.amount)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Used</p>
                    <p className="font-semibold text-slate-900">{formatCoin(item.used)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Expires At</p>
                    <p className="font-semibold text-slate-900 flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5 text-slate-500" />
                      {formatWalletDateTime(item.expiresAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Created At</p>
                    <p className="font-semibold text-slate-900">{formatWalletDateTime(item.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Transaction</p>
                    <p className="font-mono text-[11px] text-slate-900 break-all">{item.transactionId}</p>
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Truoc
                </button>
                <span className="text-xs text-slate-500">
                  Trang {safeCurrentPage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
