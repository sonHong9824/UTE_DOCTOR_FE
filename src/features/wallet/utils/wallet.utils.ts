import { WalletAccountType, WalletTransaction, WalletTransactionStatus } from "@/features/wallet/types/wallet.types";
import { formatCoin, formatCurrency } from "@/utils/money.util";

export const getWalletReasonLabel = (reason: string): string => {
  const lowerReason = reason.toLowerCase();

  if (lowerReason.includes("refund") && lowerReason.includes("reschedule")) {
    return "Hoãn lịch khám";
  }

  if (lowerReason.includes("refund") && lowerReason.includes("cancel")) {
    return "Hủy lịch khám";
  }

  if (lowerReason.includes("booking") || lowerReason.includes("appointment")) {
    return "Thanh toán lịch khám";
  }

  if (lowerReason.includes("top") || lowerReason.includes("deposit") || lowerReason.includes("recharge")) {
    return "Nạp tiền";
  }

  if (lowerReason.includes("expired")) {
    return "Coin hết hạn";
  }

  if (lowerReason.includes("coin") && lowerReason.includes("discount")) {
    return "Giảm giá bằng coin";
  }

  return reason;
};

export const getWalletStatusLabel = (status?: WalletTransactionStatus): string => {
  switch (status) {
    case "completed":
      return "Thành công";
    case "pending":
      return "Đang xử lý";
    case "failed":
      return "Thất bại";
    default:
      return "Chưa xác định";
  }
};

export const getWalletStatusClassName = (status?: WalletTransactionStatus): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getWalletTransactionColor = (direction: "income" | "expense"): string => {
  return direction === "income" ? "text-emerald-600" : "text-rose-600";
};

export const formatWalletDateTime = (value: string): string => {
  return new Date(value).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getWalletTypeLabel = (walletType: WalletAccountType): string => (walletType === "credit" ? "Credit" : "Coin");

export const getWalletTransactionAmountLabel = (transaction: WalletTransaction): string =>
  transaction.walletType === "credit"
    ? `${transaction.direction === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}`
    : `${transaction.direction === "income" ? "+" : "-"}${formatCoin(transaction.amount)}`;

export const getWalletAmountLabel = getWalletTransactionAmountLabel;

export const getWalletTransactionKindLabel = (transaction: WalletTransaction): string => {
  const lowerType = transaction.type.toLowerCase();

  if (transaction.walletType === "credit") {
    if (lowerType.includes("top") || lowerType.includes("deposit") || lowerType.includes("recharge")) {
      return "Nạp tiền";
    }

    if (lowerType.includes("refund")) {
      return "Hoàn tiền";
    }

    if (lowerType.includes("pay") || lowerType.includes("debit") || lowerType.includes("spend")) {
      return "Thanh toán";
    }

    return getWalletReasonLabel(transaction.reason);
  }

  if (lowerType.includes("earn") || lowerType.includes("reward")) {
    return "Nhận coin";
  }

  if (lowerType.includes("expired")) {
    return "Coin hết hạn";
  }

  if (lowerType.includes("spend") || lowerType.includes("use") || lowerType.includes("discount")) {
    return "Dùng coin";
  }

  return getWalletReasonLabel(transaction.reason);
};
