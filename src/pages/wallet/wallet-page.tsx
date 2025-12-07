import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletBalance } from '@/components/wallet/wallet-balance';
import { WalletDetailsCard } from '@/components/wallet/wallet-details-card';
import { WalletHistoryCard } from '@/components/wallet/wallet-history-card';
import { Wallet, Zap } from 'lucide-react';
import React from 'react';

interface WalletPageProps {
  patientId: string;
  email: string;
}

export const WalletPage: React.FC<WalletPageProps> = ({ patientId, email }) => {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8 text-amber-600" />
            Ví Điện Tử
          </h1>
          <p className="text-gray-600 mt-1">Quản lý Coin và lịch sử giao dịch</p>
        </div>
        <WalletBalance refreshTrigger={refreshTrigger} />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Số dư
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Lịch sử
          </TabsTrigger>
        </TabsList>

        {/* Balance Tab */}
        <TabsContent value="balance" className="mt-6">
          <div className="max-w-2xl">
            <WalletDetailsCard
              coinBalance={1400000}
              totalCoinEarned={1400000}
              totalCoinUsed={0}
            />
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-6">
          <WalletHistoryCard patientId={patientId} />
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Coin Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cách kiếm Coin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <p className="font-medium text-sm">Hoãn lịch hẹn</p>
                <p className="text-xs text-gray-600">Nhận 80% phí tư vấn dưới dạng Coin</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <p className="font-medium text-sm">Ưu đãi khách hàng</p>
                <p className="text-xs text-gray-600">Nhận Coin từ các chương trình khuyến mãi</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <p className="font-medium text-sm">Tặng quà tặng</p>
                <p className="text-xs text-gray-600">Nhận Coin từ các quà tặng đặc biệt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coin Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cách dùng Coin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="text-2xl">💳</div>
              <div>
                <p className="font-medium text-sm">Thanh toán khám bệnh</p>
                <p className="text-xs text-gray-600">Dùng Coin để thanh toán phí tư vấn</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🏥</div>
              <div>
                <p className="font-medium text-sm">Mua dịch vụ</p>
                <p className="text-xs text-gray-600">Thanh toán cho các dịch vụ khác</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🎁</div>
              <div>
                <p className="font-medium text-sm">Đổi quà</p>
                <p className="text-xs text-gray-600">Đổi Coin lấy các phần quà độc quyền</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">Bảo mật Coin</CardTitle>
          <CardDescription>Thông tin quan trọng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-gray-700">
            ✓ Coin của bạn luôn an toàn và được bảo vệ bởi hệ thống mã hóa
          </p>
          <p className="text-gray-700">
            ✓ Chỉ bạn mới có thể sử dụng Coin của mình
          </p>
          <p className="text-gray-700">
            ✓ Không thể chuyển Coin cho người khác
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
