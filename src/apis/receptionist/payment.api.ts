import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export interface ReceptionistPaymentQrResponseDto {
  paymentId: string;
  paymentUrl: string;
  amount: number;
}

export interface ReceptionistCashMarkResponseDto {
  paymentId: string;
  billingId: string;
  status: "SUCCESS" | string;
  amount: number;
  method: string;
}

export const getPaymentQR = async (billingId: string) => {
  // Contract: GET /receptionist/payments/:billingId/qr
  const res = await axiosClient.get<ReceptionistPaymentQrResponseDto>(`/receptionist/payments/${billingId}/qr`);
  return res.data;
};

export const markCashPaid = async (paymentId: string) => {
  // Contract: POST /receptionist/payments/:paymentId/mark-paid
  const res = await axiosClient.post<DataResponse<ReceptionistCashMarkResponseDto>>(
    `/receptionist/payments/${paymentId}/mark-paid`
  );

  return res.data;
};