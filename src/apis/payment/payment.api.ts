import axiosClient from "@/lib/axiosClient";

export interface PaymentStatusDto {
  orderId: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  amount: number;
  paidAt: string | null;
}

export const getPaymentStatus = async (orderId: string) => {
  const res = await axiosClient.get(`/payments/${orderId}`);
  return res.data;
};