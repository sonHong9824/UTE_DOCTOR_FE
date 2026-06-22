import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import PaymentResultContent from "./PaymentResultContent";

function PaymentResultFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center text-slate-500">
          <Spinner size="lg" className="border-sky-600" />
          <p className="text-sm">Đang tải kết quả thanh toán...</p>
        </div>
      </div>
    </main>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<PaymentResultFallback />}>
      <PaymentResultContent />
    </Suspense>
  );
}
