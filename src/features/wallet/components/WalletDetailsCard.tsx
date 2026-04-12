import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface WalletDetailsCardProps {
  coinBalance: number;
  totalCoinEarned: number;
  totalCoinUsed: number;
}

export const WalletDetailsCard = ({
  coinBalance,
  totalCoinEarned,
  totalCoinUsed,
}: WalletDetailsCardProps) => {
  return (
    <div className="space-y-4">
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
              {coinBalance.toLocaleString("vi-VN")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-amber-600 mb-2">{coinBalance.toLocaleString("vi-VN")}</p>
            <p className="text-sm text-gray-600">Tương đương: {coinBalance.toLocaleString("vi-VN")} VND</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Đã nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{totalCoinEarned.toLocaleString("vi-VN")}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Đã dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{totalCoinUsed.toLocaleString("vi-VN")}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
