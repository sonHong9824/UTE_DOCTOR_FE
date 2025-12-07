import { getWalletBalance } from '@/apis/wallet/wallet.api';
import { Coins } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WalletBalanceProps {
  refreshTrigger?: number; // Increment this to trigger a refresh
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ refreshTrigger = 0 }) => {
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoading(true);
      try {
        const response = await getWalletBalance();
        if (response?.data) {
          setCoinBalance(response.data.balance);
        }
      } catch (err) {
        console.error("Failed to fetch wallet balance", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Coins className="h-4 w-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-500">Đang tải...</span>
      </div>
    );
  }

  if (coinBalance === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer">
      <Coins className="h-5 w-5 text-amber-600" />
      <div className="flex flex-col">
        <span className="text-xs text-amber-600 font-semibold">Coins</span>
        <span className="text-lg font-bold text-amber-700">{coinBalance.toLocaleString('vi-VN')}</span>
      </div>
    </div>
  );
};

export default WalletBalance;
