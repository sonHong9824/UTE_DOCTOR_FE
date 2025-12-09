import { getWalletDetails } from '@/apis/wallet/wallet.api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import TransactionDetailModal from './transaction-detail-modal';

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

interface WalletHistoryProps {
  patientId?: string;
}

const ITEMS_PER_PAGE = 10;

export const WalletHistoryCard: React.FC<WalletHistoryProps> = ({ patientId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDetails = async (page: number) => {
    try {
      setLoading(true);
      const res = await getWalletDetails(page, ITEMS_PER_PAGE);
      if (res?.data) {
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch wallet details:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDetails(newPage);
      // Scroll to top of card
      const cardElement = document.querySelector('[data-wallet-history]');
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'earn' | 'spend') => {
    setFilter(newFilter);
    fetchDetails(1); // Reset to first page when filter changes
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

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

  const getTransactionIcon = (type: 'earn' | 'spend') => {
    return type === 'earn' ? (
      <TrendingUp className="h-5 w-5 text-green-600" />
    ) : (
      <TrendingDown className="h-5 w-5 text-red-600" />
    );
  };

  const getTransactionColor = (type: 'earn' | 'spend'): string => {
    return type === 'earn' ? 'text-green-600' : 'text-red-600';
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

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      default:
        return status || 'Chưa xác định';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card data-wallet-history>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Lịch sử & Thống kê coin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </>
          ) : (
            <>
              {/* Transaction History Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Lịch sử giao dịch ({pagination.total})
                  </h3>
                  <div className="flex gap-2">
                    {(['all', 'earn', 'spend'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleFilterChange(tab)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                          filter === tab
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tab === 'all' ? 'Tất cả' : tab === 'earn' ? 'Nhận' : 'Dùng'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transactions List */}
                <div className="space-y-3">
                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Chưa có giao dịch</p>
                    </div>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsModalOpen(true);
                        }}
                        className="p-4 border rounded-lg hover:shadow-md transition bg-white cursor-pointer hover:bg-gray-50"
                      >
                        {/* Header: Icon + Reason + Amount */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`p-2 rounded-lg mt-1 ${
                                transaction.type === 'earn' ? 'bg-green-100' : 'bg-red-100'
                              }`}
                            >
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                {getReasonLabel(transaction.reason)}
                              </p>
                              {transaction.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {transaction.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'earn' ? '+' : '-'}{transaction.amount}
                            </p>
                          </div>
                        </div>

                        {/* Footer: Status + Date */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          {transaction.status && (
                            <Badge className={`text-xs font-medium ${getStatusBadgeColor(transaction.status)}`}>
                              {getStatusLabel(transaction.status)}
                            </Badge>
                          )}
                          <p className="text-xs text-gray-500 ml-auto">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && filteredTransactions.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Trang trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                            pagination.page === page
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Trang sau"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <span className="text-xs text-gray-600 ml-2">
                      Trang {pagination.page} / {pagination.totalPages}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default WalletHistoryCard;
