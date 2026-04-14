import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCoin, formatCurrency } from "@/utils/money.util";
import { Coins, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface WalletDetailsCardProps {
  coinBalance: number;
  creditBalance: number;
  usableCoin: number;
  expiringSoon: number;
  totalCoinEarned: number;
  totalCoinUsed: number;
  totalCoinExpired: number;
  totalCredited: number;
  totalDebited: number;
}

export const WalletDetailsCard = ({
  coinBalance,
  creditBalance,
  usableCoin,
  expiringSoon,
  totalCoinEarned,
  totalCoinUsed,
  totalCoinExpired,
  totalCredited,
  totalDebited,
}: WalletDetailsCardProps) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sky-900">
              <Wallet className="h-6 w-6 text-sky-600" />
              Credit Wallet
            </CardTitle>
            <CardDescription>Tiền thật dùng cho thanh toán và hoàn tiền</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Số dư hiện tại</span>
                <Badge variant="secondary" className="bg-sky-100 text-sky-700">
                  {formatCurrency(creditBalance)}
                </Badge>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{formatCurrency(creditBalance)}</p>
              <p className="mt-1 text-sm text-slate-500">Thanh toán dịch vụ hoặc nhận hoàn tiền về ví credit.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Tổng nạp</p>
                <p className="mt-2 text-xl font-bold text-emerald-600">{formatCurrency(totalCredited)}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Tổng chi</p>
                <p className="mt-2 text-xl font-bold text-rose-600">-{formatCurrency(totalDebited)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Coins className="h-6 w-6 text-amber-600" />
              Coin Wallet
            </CardTitle>
            <CardDescription>Điểm thưởng chỉ dùng để giảm giá booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Số dư hiện tại</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                  {formatCoin(coinBalance)}
                </Badge>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{formatCoin(coinBalance)}</p>
              <p className="mt-1 text-sm text-slate-500">Coin được khấu trừ tối đa theo quy tắc chiết khấu của booking.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Earned</p>
                <p className="mt-2 text-xl font-bold text-emerald-600">+{formatCoin(totalCoinEarned)}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Used</p>
                <p className="mt-2 text-xl font-bold text-rose-600">-{formatCoin(totalCoinUsed)}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Expired</p>
                <p className="mt-2 text-xl font-bold text-amber-600">-{formatCoin(totalCoinExpired)}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Usable coin</p>
                <p className="mt-2 text-xl font-bold text-sky-600">{formatCoin(usableCoin)}</p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Expiring soon</p>
                <p className="mt-2 text-xl font-bold text-orange-600">{formatCoin(expiringSoon)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Coin earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{formatCoin(totalCoinEarned)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-rose-600" />
              Coin used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">-{formatCoin(totalCoinUsed)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
