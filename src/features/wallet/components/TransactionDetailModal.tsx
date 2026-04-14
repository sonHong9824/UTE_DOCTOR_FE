import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WalletTransaction } from "@/features/wallet/types/wallet.types";
import {
    formatWalletDateTime,
    getWalletAmountLabel,
    getWalletReasonLabel,
    getWalletStatusClassName,
    getWalletStatusLabel,
    getWalletTransactionKindLabel,
    getWalletTypeLabel,
} from "@/features/wallet/utils/wallet.utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: WalletTransaction | null;
}

export const TransactionDetailModal = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) => {
  if (!transaction) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {transaction.direction === "income" ? (
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-rose-600" />
            )}
            Chi tiết giao dịch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2 text-sm">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Loại ví</p>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                {getWalletTypeLabel(transaction.walletType)}
              </Badge>
            </div>
            <p className={"mt-2 text-2xl font-bold " + (transaction.direction === "income" ? "text-emerald-600" : "text-rose-600")}>
              {getWalletAmountLabel(transaction.walletType, transaction.amount, transaction.direction)}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Lý do</p>
            <p className="font-medium">{getWalletTransactionKindLabel(transaction) || getWalletReasonLabel(transaction.reason)}</p>
          </div>

          {transaction.description && (
            <div>
              <p className="text-gray-500">Mô tả</p>
              <p className="font-medium">{transaction.description}</p>
            </div>
          )}

          <div>
            <p className="text-gray-500">Trạng thái</p>
            <Badge className={getWalletStatusClassName(transaction.status)}>
              {getWalletStatusLabel(transaction.status)}
            </Badge>
          </div>

          <div>
            <p className="text-gray-500">Thời gian</p>
            <p className="font-medium">{formatWalletDateTime(transaction.createdAt)}</p>
          </div>

          <div>
            <p className="text-gray-500">Mã giao dịch</p>
            <p className="font-mono text-xs break-all">{transaction._id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
