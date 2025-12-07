import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';
import React from 'react';

interface CoinRefundNotificationProps {
  isOpen: boolean;
  appointmentId: string;
  doctorName: string;
  refundAmount: number;
  consultationFee: number;
  onClose: () => void;
}

export const CoinRefundNotification: React.FC<CoinRefundNotificationProps> = ({
  isOpen,
  appointmentId,
  doctorName,
  refundAmount,
  consultationFee,
  onClose,
}) => {
  if (!isOpen) return null;

  const refundPercentage = Math.round((refundAmount / consultationFee) * 100);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom">
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Hoãn lịch thành công!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Refund Details */}
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Lịch khám với <span className="font-medium">{doctorName}</span> đã được hoãn.
            </p>
            <div className="bg-white rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Phí tư vấn ban đầu</span>
                <span className="font-medium">
                  {consultationFee.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <Zap className="h-4 w-4 text-amber-600" />
                  Coin hoàn lại ({refundPercentage}%)
                </span>
                <span className="font-bold text-lg text-amber-600">
                  +{refundAmount.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              Coin của bạn đã được cộng vào tài khoản. Sử dụng để thanh toán lịch hẹn tiếp theo!
            </AlertDescription>
          </Alert>

          {/* Close Hint */}
          <p className="text-xs text-gray-600 text-center">
            Sẽ tự đóng trong 5 giây
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinRefundNotification;
