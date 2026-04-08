export type PaymentBackendStatus = "PENDING" | "COMPLETED" | "FAILED";

export type PaymentViewStatus = PaymentBackendStatus | "TIMEOUT";

export interface PaymentResultData {
  orderId: string;
  status: PaymentBackendStatus;
  amount: number;
  paidAt: string | null;
}

export interface PaymentResultState {
  status: PaymentViewStatus | null;
  loading: boolean;
  error: string | null;
  payment: PaymentResultData | null;
  retry: () => void;
}