import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, ShieldCheck, Sparkles, Stethoscope, WalletCards } from "lucide-react";

export const WalletInfoCards = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cách kiếm Coin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
              <p>Hoãn lịch hẹn: Nhận coin theo chính sách hoàn tiền.</p>
            </div>
            <div className="flex items-start gap-3">
              <Gift className="h-4 w-4 text-pink-600 mt-0.5" />
              <p>Ưu đãi khách hàng: Nhận coin từ chương trình khuyến mãi.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>Quà tặng đặc biệt: Nhận thêm coin theo sự kiện.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cách dùng Coin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Stethoscope className="h-4 w-4 text-green-600 mt-0.5" />
              <p>Thanh toán lịch khám.</p>
            </div>
            <div className="flex items-start gap-3">
              <WalletCards className="h-4 w-4 text-indigo-600 mt-0.5" />
              <p>Thanh toán một số dịch vụ hỗ trợ.</p>
            </div>
            <div className="flex items-start gap-3">
              <Gift className="h-4 w-4 text-rose-600 mt-0.5" />
              <p>Đổi ưu đãi theo chương trình.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">Bảo mật Coin</CardTitle>
          <CardDescription>Thông tin quan trọng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>Coin được quản lý và bảo vệ trong hệ thống tài khoản của bạn.</p>
          <p>Chỉ tài khoản đăng nhập mới có quyền sử dụng số dư Coin.</p>
          <p>Vui lòng bảo mật thông tin đăng nhập để tránh rủi ro.</p>
        </CardContent>
      </Card>
    </>
  );
};
