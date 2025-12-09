import { getWalletDetails } from '@/apis/wallet/wallet.api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface WalletDetailsProps {
  coinBalance?: number;
  totalCoinEarned?: number;
  totalCoinUsed?: number;
}

export const WalletDetailsCard: React.FC<WalletDetailsProps> = ({
  coinBalance: propCoinBalance,
  totalCoinEarned: propTotalEarned,
  totalCoinUsed: propTotalUsed,
}) => {
  const [coinBalance, setCoinBalance] = useState(propCoinBalance || 0);
  const [totalCoinEarned, setTotalCoinEarned] = useState(propTotalEarned || 0);
  const [totalCoinUsed, setTotalCoinUsed] = useState(propTotalUsed || 0);
  const [loading, setLoading] = useState(!propCoinBalance);

  useEffect(() => {
    // If props provided, use them; otherwise fetch from API
    if (propCoinBalance !== undefined && propTotalEarned !== undefined && propTotalUsed !== undefined) {
      return;
    }

    const fetchDetails = async () => {
      try {
        const res = await getWalletDetails(1, 10); // Fetch with default pagination
        if (res?.data) {
          setCoinBalance(res.data.coinBalance);
          setTotalCoinEarned(res.data.totalCoinEarned);
          setTotalCoinUsed(res.data.totalCoinUsed);
        }
      } catch (err) {
        console.error('Failed to fetch wallet details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [propCoinBalance, propTotalEarned, propTotalUsed]);

  const conversionRate = 1000; // 1 coin = 1000 VNĐ equivalent

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="border-2 border-amber-200">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent className="pt-6">
            <Skeleton className="h-12 w-40 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card className="border-2 border-amber-200">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-6 w-6 text-amber-600" />
                Ví Coin
              </CardTitle>
              <CardDescription>Tài khoản ảo của bạn</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-2">
              <Coins className="h-4 w-4 mr-1" />
              {coinBalance.toLocaleString('vi-VN')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-600 mb-2">
              {coinBalance.toLocaleString('vi-VN')}
            </p>
            <p className="text-sm text-gray-600">
              Tương đương: {(coinBalance * conversionRate).toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Earned */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Đã nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{totalCoinEarned.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Từ {Math.floor(totalCoinEarned / 400000) || 0} lần hoãn
            </p>
          </CardContent>
        </Card>

        {/* Used */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Đã dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{totalCoinUsed.toLocaleString('vi-VN')}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Cho {Math.floor(totalCoinUsed / 300000) || 0} lịch hẹn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rules */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">Quy tắc Coin</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-gray-700">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">•</span>
            <span>Hoãn lịch hẹn: Nhận 80% phí tư vấn dưới dạng Coin</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">•</span>
            <span>Sử dụng Coin để thanh toán lịch hẹn tiếp theo</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-blue-600">•</span>
            <span>Coin không có thời hạn sử dụng</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletDetailsCard;
