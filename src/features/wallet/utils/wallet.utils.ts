import { WalletTransactionStatus, WalletTransactionType } from "@/features/wallet/types/wallet.types";

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

export const getWalletTransactionColor = (type: WalletTransactionType): string => {
  return type === "earn" ? "text-green-600" : "text-red-600";
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
