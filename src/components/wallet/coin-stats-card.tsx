import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Target, TrendingUp } from 'lucide-react';
import React from 'react';

interface CoinStatsProps {
  currentBalance: number;
  thisMonthEarned: number;
  totalEarned: number;
  targetBalance?: number;
}

export const CoinStatsCard: React.FC<CoinStatsProps> = ({
  currentBalance,
  thisMonthEarned,
  totalEarned,
  targetBalance = 5000000,
}) => {
  const progressPercentage = Math.min((currentBalance / targetBalance) * 100, 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Main Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-600" />
            Thống kê Coin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Balance */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Số dư hiện tại</span>
              <Badge variant="secondary">
                {currentBalance.toLocaleString('vi-VN')} coin
              </Badge>
            </div>
          </div>

          {/* This Month */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tháng này kiếm được</span>
              <span className="font-medium text-green-600">
                +{thisMonthEarned.toLocaleString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Total Earned */}
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Tổng đã nhận
              </span>
              <span className="font-medium text-blue-600">
                {totalEarned.toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Mục tiêu hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Tiến độ</span>
              <span className="text-sm font-bold text-amber-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-600 mt-2">
              {currentBalance.toLocaleString('vi-VN')} / {targetBalance.toLocaleString('vi-VN')}{' '}
              coin
            </p>
          </div>

          <div className="bg-amber-50 rounded p-3 text-center">
            <p className="text-xs text-gray-600 mb-1">Để đạt mục tiêu cần</p>
            <p className="font-bold text-amber-600">
              {Math.max(0, targetBalance - currentBalance).toLocaleString('vi-VN')} coin
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinStatsCard;
