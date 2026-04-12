import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WalletTransaction } from "@/features/wallet/types/wallet.types";
import { formatWalletDateTime, getWalletReasonLabel, getWalletStatusClassName, getWalletStatusLabel } from "@/features/wallet/utils/wallet.utils";
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
            {transaction.type === "earn" ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            Chi tiết giao dịch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2 text-sm">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-gray-600">Số coin</p>
            <p className={"text-2xl font-bold " + (transaction.type === "earn" ? "text-green-600" : "text-red-600")}>
              {transaction.type === "earn" ? "+" : "-"}
              {transaction.amount}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Lý do</p>
            <p className="font-medium">{getWalletReasonLabel(transaction.reason)}</p>
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
