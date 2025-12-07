import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  date: string;
  appointmentId?: string;
}

interface WalletHistoryProps {
  patientId: string;
}

export const WalletHistoryCard: React.FC<WalletHistoryProps> = ({ patientId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earn' | 'spend'>('all');

  useEffect(() => {
    // TODO: Fetch from backend when API is ready
    // For now, show mock data
    setTimeout(() => {
      setTransactions([
        {
          id: '1',
          type: 'earn',
          amount: 400000,
          reason: 'Hoãn lịch hẹn khám',
          date: new Date().toISOString(),
          appointmentId: 'apt-001',
        },
        {
          id: '2',
          type: 'spend',
          amount: 300000,
          reason: 'Thanh toán lịch hẹn khám',
          date: new Date(Date.now() - 86400000).toISOString(),
          appointmentId: 'apt-002',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [patientId]);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getTransactionIcon = (type: 'earn' | 'spend') => {
    return type === 'earn' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTransactionColor = (type: 'earn' | 'spend') => {
    return type === 'earn' ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionBg = (type: 'earn' | 'spend') => {
    return type === 'earn' ? 'bg-green-50' : 'bg-red-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Lịch sử giao dịch
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="earn">Nhận</TabsTrigger>
            <TabsTrigger value="spend">Dùng</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Transactions List */}
        <div className="space-y-3">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">Không có giao dịch</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`p-3 rounded-lg border ${getTransactionBg(transaction.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getTransactionBg(transaction.type)}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.reason}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={transaction.type === 'earn' ? 'default' : 'secondary'}
                    className={getTransactionColor(transaction.type)}
                  >
                    {transaction.type === 'earn' ? '+' : '-'}
                    {transaction.amount.toLocaleString('vi-VN')}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredTransactions.length > 0 && filteredTransactions.length >= 10 && (
          <div className="text-center mt-4">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Xem thêm
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletHistoryCard;
