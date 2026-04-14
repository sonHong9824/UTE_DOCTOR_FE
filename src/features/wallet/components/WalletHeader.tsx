import { formatCoin, formatCurrency } from "@/utils/money.util";
import { Coins, Wallet } from "lucide-react";

interface WalletHeaderProps {
  coinBalance: number;
  creditBalance: number;
  loading: boolean;
}

export const WalletHeader = ({ coinBalance, creditBalance, loading }: WalletHeaderProps) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-amber-50 p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            <Wallet className="h-3.5 w-3.5 text-slate-600" />
            Wallet
          </div>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Ví của bạn</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Credit là tiền thật để thanh toán và hoàn tiền. Coin là điểm thưởng chỉ dùng để giảm giá.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[420px]">
          <div className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700">
              <Wallet className="h-4 w-4" />
              Credit
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : formatCurrency(creditBalance)}</div>
            <p className="mt-1 text-xs text-slate-500">Số dư tiền dùng cho thanh toán / hoàn tiền</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <Coins className="h-4 w-4" />
              Coin
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">{loading ? "..." : formatCoin(coinBalance)}</div>
            <p className="mt-1 text-xs text-slate-500">Điểm thưởng dùng để giảm giá booking</p>
          </div>
        </div>
      </div>
    </div>
  );
};
