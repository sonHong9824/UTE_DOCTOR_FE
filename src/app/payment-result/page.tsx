"use client";

import PaymentResultScreen from "@/features/payment-result/screens/PaymentResultScreen";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}

function PaymentResultContent() {
  const searchParams = useSearchParams();

  const orderId =
    searchParams.get("orderId") ||
    searchParams.get("paymentId") ||
    searchParams.get("appointmentId");

  const paymentId = searchParams.get("paymentId");
  const appointmentId = searchParams.get("appointmentId");
  const status = searchParams.get("status");
  const purpose = searchParams.get("purpose");

  return (
    <PaymentResultScreen
      orderId={orderId}
      appointmentId={appointmentId}
      statusParam={status}
      purpose={purpose}
    />
  );
}