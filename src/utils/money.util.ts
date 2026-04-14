export interface CoinDiscountRule {
  availableCoin: number;
  originalAmount: number;
  requestedCoin?: number;
  useCoin?: boolean;
  maxRate?: number;
  maxCap?: number;
}

export interface CoinDiscountResult {
  discount: number;
  final: number;
  maxUsableCoin: number;
  requestedCoin: number;
}

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export const formatCoin = (value: number): string => `${Math.max(0, Math.round(value)).toLocaleString("vi-VN")} coin`;

export const calculateDiscount = ({
  availableCoin,
  originalAmount,
  requestedCoin = 0,
  useCoin = false,
  maxRate = 0.1,
  maxCap = 30000,
}: CoinDiscountRule): CoinDiscountResult => {
  const safeOriginalAmount = Math.max(0, Math.round(originalAmount || 0));
  const safeAvailableCoin = Math.max(0, Math.round(availableCoin || 0));
  const safeRequestedCoin = Math.max(0, Math.round(requestedCoin || 0));
  const maxByRate = Math.floor(safeOriginalAmount * maxRate);
  const maxUsableCoin = Math.max(0, Math.min(safeAvailableCoin, maxByRate, maxCap));
  const requestedAmount = useCoin ? safeRequestedCoin || maxUsableCoin : 0;
  const discount = useCoin ? Math.max(0, Math.min(requestedAmount, maxUsableCoin)) : 0;
  const final = Math.max(0, safeOriginalAmount - discount);

  return {
    discount,
    final,
    maxUsableCoin,
    requestedCoin: requestedAmount,
  };
};