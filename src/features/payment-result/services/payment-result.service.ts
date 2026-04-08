import { getPaymentStatus } from "@/apis/payment/payment.api";
import { PaymentResultData } from "@/features/payment-result/types/payment-result.types";

const normalizePaymentResponse = (payload: any, fallbackOrderId: string): PaymentResultData => {
  const data = payload?.data && typeof payload.data === "object" && "orderId" in payload.data ? payload.data : payload;

  if (!data || typeof data !== "object") {
    throw new Error("Phản hồi thanh toán không hợp lệ.");
  }

  const status = data.status as PaymentResultData["status"];

  if (!data.orderId || !status) {
    throw new Error("Phản hồi thanh toán không đầy đủ.");
  }

  return {
    orderId: String(data.orderId || fallbackOrderId),
    status,
    amount: Number(data.amount ?? 0),
    paidAt: data.paidAt ?? null,
  };
};

export const paymentResultService = {
  async fetchPaymentStatus(orderId: string): Promise<PaymentResultData> {
    const response = await getPaymentStatus(orderId);
    return normalizePaymentResponse(response, orderId);
  },
};