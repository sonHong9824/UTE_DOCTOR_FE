"use client";

import PaymentResultScreen from "@/features/payment-result/screens/PaymentResultScreen";
import { useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const appointmentId = searchParams.get("appointmentId");
  const status = searchParams.get("status");
  const purpose = searchParams.get("purpose");

  return (
    <PaymentResultScreen
      orderId={orderId || paymentId || appointmentId}
      appointmentId={appointmentId}
      statusParam={status}
      purpose={purpose}
    />
  );
}
