"use client";

import PaymentResultScreen from "@/features/payment-result/screens/PaymentResultScreen";
import { useSearchParams } from "next/navigation";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return <PaymentResultScreen orderId={orderId} />;
}