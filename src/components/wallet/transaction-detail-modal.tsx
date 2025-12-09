import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Check, Copy, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

interface Transaction {
  _id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  description?: string;
  appointmentId?: string;
  status?: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getReasonLabel = (reason: string): string => {
    const reasonMap: Record<string, string> = {
      'refund-reschedule': 'Hoãn lịch khám',
      'refund-cancel': 'Hủy lịch khám',
      'appointment_booking': 'Thanh toán khám chữa bệnh',
      'appointment_reschedule': 'Hoãn cuộc hẹn',
      'appointment_cancel': 'Hủy cuộc hẹn',
    };
    
    for (const [key, label] of Object.entries(reasonMap)) {
      if (reason.includes(key.split('_')[0])) {
        return label;
      }
    }
    return reason;
  };

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      default:
        return 'Chưa xác định';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const DetailRow = ({
    label,
    value,
    copyable = false,
  }: {
    label: string;
    value: React.ReactNode;
    copyable?: boolean;
  }) => (
    <div className="py-3 border-b border-gray-200 last:border-b-0">
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-base font-semibold text-gray-900 break-words flex-1">{value}</p>
        {copyable && value && (
          <button
            onClick={() => copyToClipboard(String(value), label)}
            className="p-1 hover:bg-gray-100 rounded transition"
            title="Sao chép"
          >
            {copiedField === label ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transaction.type === 'earn' ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            Chi tiết giao dịch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Transaction Type & Amount Header */}
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Loại giao dịch</p>
              <Badge
                variant="secondary"
                className={transaction.type === 'earn' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              >
                {transaction.type === 'earn' ? 'Nhận coin' : 'Dùng coin'}
              </Badge>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
              </span>
              <span className="text-lg text-gray-600">coin</span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            <DetailRow label="Lý do" value={getReasonLabel(transaction.reason)} />
            
            {transaction.description && (
              <DetailRow label="Mô tả" value={transaction.description} />
            )}

            <DetailRow label="Trạng thái" value={
              <Badge className={getStatusBadgeColor(transaction.status)}>
                {getStatusLabel(transaction.status)}
              </Badge>
            } />

            <DetailRow label="Thời gian" value={formatDate(transaction.createdAt)} />

            {transaction.appointmentId && (
              <DetailRow 
                label="Mã lịch khám" 
                value={transaction.appointmentId} 
                copyable 
              />
            )}

            <DetailRow label="Mã giao dịch" value={transaction._id} copyable />
          </div>

          {/* Info Note */}
          {transaction.status === 'pending' && (
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Giao dịch đang xử lý</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Giao dịch này đang chờ xác nhận. Vui lòng chờ trong giây lát.
                </p>
              </div>
            </div>
          )}

          {transaction.status === 'failed' && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Giao dịch thất bại</p>
                <p className="text-xs text-red-700 mt-1">
                  Giao dịch này không thành công. Vui lòng liên hệ hỗ trợ nếu cần.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;
