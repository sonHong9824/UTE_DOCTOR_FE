import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, CircleDollarSign, Gift, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

export const WalletInfoCards = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Banknote className="h-4 w-4 text-sky-600" />
              Credit hoạt động thế nào
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-sky-600 mt-0.5" />
              <p>Nạp tiền online sẽ cộng vào ví credit.</p>
            </div>
            <div className="flex items-start gap-3">
              <Gift className="h-4 w-4 text-emerald-600 mt-0.5" />
              <p>Hủy hoặc hoàn tiền sẽ trả về credit, không phải coin.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5" />
              <p>Credit là tiền thật, hiển thị theo VND.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CircleDollarSign className="h-4 w-4 text-amber-600" />
              Coin hoạt động thế nào
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <Stethoscope className="h-4 w-4 text-amber-600 mt-0.5" />
              <p>Coin là reward và chỉ dùng để giảm giá booking.</p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-amber-600 mt-0.5" />
              <p>Coin có thể bị giới hạn theo % trên hóa đơn và cap tối đa.</p>
            </div>
            <div className="flex items-start gap-3">
              <Gift className="h-4 w-4 text-rose-600 mt-0.5" />
              <p>Coin có thể hết hạn nếu backend ghi nhận giao dịch expired.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm">Ghi chú sử dụng ví</CardTitle>
          <CardDescription>Thông tin quan trọng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>Credit và coin được quản lý độc lập trong cùng một tài khoản.</p>
          <p>Coin không thay thế cho credit trong thanh toán.</p>
          <p>Booking chỉ được phép dùng coin như một khoản giảm trừ.</p>
        </CardContent>
      </Card>
    </>
  );
};
