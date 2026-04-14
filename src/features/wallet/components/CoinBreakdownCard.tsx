import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletCoinBreakdownItem } from "@/features/wallet/types/wallet.types";
import { formatCoin } from "@/utils/money.util";
import { AlertTriangle, Clock3, ListOrdered } from "lucide-react";

interface CoinBreakdownCardProps {
  breakdown: WalletCoinBreakdownItem[];
}

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

const formatExpireDate = (value?: string): string => {
  if (!value) return "Khong gioi han";

  return new Date(value).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const CoinBreakdownCard = ({ breakdown }: CoinBreakdownCardProps) => {
  const sortedBreakdown = [...breakdown].sort((left, right) => {
    if (left.isExpiringSoon !== right.isExpiringSoon) {
      return left.isExpiringSoon ? -1 : 1;
    }

    const leftTime = left.expiresAt ? new Date(left.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
    const rightTime = right.expiresAt ? new Date(right.expiresAt).getTime() : Number.MAX_SAFE_INTEGER;
    return leftTime - rightTime;
  });

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <ListOrdered className="h-5 w-5 text-amber-600" />
          Coin Breakdown (FIFO)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedBreakdown.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Chua co du lieu lo coin.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedBreakdown.map((item) => (
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

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 sm:grid-cols-4">
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
                      {formatExpireDate(item.expiresAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Transaction</p>
                    <p className="font-mono text-[11px] text-slate-900 break-all">{item.transactionId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
