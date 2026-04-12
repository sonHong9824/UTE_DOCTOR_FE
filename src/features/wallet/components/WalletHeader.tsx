import { Coins, Wallet } from "lucide-react";

interface WalletHeaderProps {
  balance: number;
  loading: boolean;
}

export const WalletHeader = ({ balance, loading }: WalletHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Wallet className="h-8 w-8 text-amber-600" />
          Ví điện tử
        </h1>
        <p className="text-gray-600 mt-1">Quản lý Coin và lịch sử giao dịch</p>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <Coins className="h-5 w-5 text-amber-600" />
        <div className="flex flex-col">
          <span className="text-xs text-amber-700 font-semibold">Coin</span>
          <span className="text-lg font-bold text-amber-700">
            {loading ? "..." : balance.toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </div>
  );
};
