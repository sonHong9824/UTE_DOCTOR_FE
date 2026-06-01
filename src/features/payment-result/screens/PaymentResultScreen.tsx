"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getAppointmentById } from "@/apis/appointment/appointment.api";
import { usePaymentStatus } from "@/features/payment-result/hooks/usePaymentStatus";
import { PaymentViewStatus } from "@/features/payment-result/types/payment-result.types";
import { TimeHelper } from "@/lib/time";
import { ArrowLeft, CheckCircle2, Clock3, Home, RefreshCw, TriangleAlert, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface PaymentResultScreenProps {
  orderId: string | null;
  appointmentId?: string | null;
  statusParam?: string | null;
  purpose?: string | null;
}

type DepositAppointmentSnapshot = {
  appointmentStatus?: string;
  depositStatus?: string;
};

const formatCurrencyVnd = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

const formatVietnameseDateTime = (value: string) =>
  TimeHelper.formatVietnamDateTime(value, "vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusConfig: Record<Exclude<PaymentViewStatus, null>, { title: string; description: string; icon: typeof CheckCircle2; className: string }> = {
  COMPLETED: {
    title: "Thanh toán thành công",
    description: "Giao dịch đã được xác nhận và lịch hẹn của bạn đã sẵn sàng.",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  FAILED: {
    title: "Thanh toán thất bại",
    description: "Giao dịch không hoàn tất. Bạn có thể thử lại hoặc quay lại sau.",
    icon: XCircle,
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  PENDING: {
    title: "Đang xử lý thanh toán",
    description: "Hệ thống đang xác nhận giao dịch. Vui lòng đợi thêm một chút.",
    icon: Clock3,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  TIMEOUT: {
    title: "Đang xử lý, vui lòng kiểm tra lại sau",
    description: "Thanh toán vẫn chưa được xác nhận sau nhiều lần kiểm tra.",
    icon: TriangleAlert,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
};

const normalizeQueryStatus = (status?: string | null): PaymentViewStatus | null => {
  const normalized = status?.toUpperCase();
  if (!normalized) return null;
  if (["SUCCESS", "COMPLETED", "PAID", "00"].includes(normalized)) return "COMPLETED";
  if (["FAILED", "FAIL", "CANCELLED", "CANCELED"].includes(normalized)) return "FAILED";
  if (normalized === "PENDING") return "PENDING";
  return null;
};

export default function PaymentResultScreen({ orderId, appointmentId, statusParam, purpose }: PaymentResultScreenProps) {
  const queryStatus = normalizeQueryStatus(statusParam);
  const { status, loading, error, payment, retry } = usePaymentStatus(queryStatus ? null : orderId);
  const popupHandledRef = useRef(false);
  const isDepositPayment = purpose === "APPOINTMENT_DEPOSIT" || Boolean(queryStatus);
  const [appointmentSnapshot, setAppointmentSnapshot] = useState<DepositAppointmentSnapshot | null>(null);

  useEffect(() => {
    if (!appointmentId || !queryStatus) {
      return;
    }

    const fetchAppointment = async () => {
      try {
        const response = await getAppointmentById(appointmentId);
        const data = response?.data as DepositAppointmentSnapshot | undefined;
        setAppointmentSnapshot(data ?? null);
      } catch (error) {
        console.error("Failed to fetch appointment after deposit payment", error);
      }
    };

    void fetchAppointment();
  }, [appointmentId, queryStatus]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const effectiveStatus = queryStatus ?? status;

    if (!orderId || !effectiveStatus || loading || error) {
      return;
    }

    if (!window.opener || popupHandledRef.current) {
      return;
    }

    popupHandledRef.current = true;
    window.opener.postMessage(
      {
        type: "PAYMENT_RESULT",
        orderId,
        status: effectiveStatus,
      },
      "*"
    );
  }, [error, loading, orderId, queryStatus, status]);

  if (!orderId && !queryStatus) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
          <Card className="w-full max-w-xl border border-slate-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <TriangleAlert className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Không tìm thấy mã thanh toán</CardTitle>
              <CardDescription className="text-base">
                Đường dẫn hiện tại chưa có <span className="font-medium">orderId</span> hợp lệ.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/user/my-profile">
                  <ArrowLeft className="h-4 w-4" />
                  Xem lịch hẹn
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (loading && !payment && !queryStatus) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
          <Card className="w-full max-w-xl border border-slate-200 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                <Spinner size="lg" className="border-sky-600" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Đang xác nhận thanh toán...</h1>
                <p className="text-sm text-slate-500">Vui lòng giữ nguyên trang để hệ thống kiểm tra giao dịch.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const effectiveStatus = queryStatus ?? status ?? payment?.status ?? null;
  const displayStatus = effectiveStatus ?? (error ? "FAILED" : "PENDING");
  const config = displayStatus ? statusConfig[displayStatus] : null;
  const Icon = config?.icon ?? TriangleAlert;
  const formattedAmount = payment ? formatCurrencyVnd(payment.amount) : "-";
  const formattedPaidAt = payment?.paidAt ? formatVietnameseDateTime(payment.paidAt) : "Chưa xác định";
  const title = isDepositPayment && displayStatus === "COMPLETED"
    ? "Thanh toán phí giữ chỗ thành công"
    : config?.title ?? "Thanh toán";
  const description = isDepositPayment && displayStatus === "COMPLETED"
    ? "Phí giữ chỗ đã được xác nhận và lịch hẹn của bạn đã được xác nhận."
    : isDepositPayment && displayStatus === "FAILED"
      ? "Thanh toán phí giữ chỗ không hoàn tất. Lịch hẹn chưa được xác nhận."
      : config?.description ?? "Đang tải dữ liệu thanh toán.";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl items-center justify-center">
        <Card className="w-full overflow-hidden border border-slate-200 shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-white/80 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${config?.className ?? "bg-slate-100 text-slate-700"}`}>
              <Icon className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-slate-900">{title}</CardTitle>
            <CardDescription className="text-base text-slate-600">{description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 py-6">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{isDepositPayment ? "Mã thanh toán" : "Mã đơn hàng"}</p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-900">{payment?.orderId ?? orderId ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Số tiền</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formattedAmount}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Trạng thái</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{displayStatus}</p>
              </div>
              {appointmentSnapshot && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lịch hẹn</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {appointmentSnapshot.appointmentStatus ?? "-"} / {appointmentSnapshot.depositStatus ?? "-"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Thời gian thanh toán</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formattedPaidAt}</p>
              </div>
            </div>

            {(displayStatus === "PENDING" || displayStatus === "TIMEOUT") && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <Spinner size="sm" className="border-amber-600" />
                <span>Hệ thống vẫn đang theo dõi trạng thái thanh toán trong nền.</span>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={retry} disabled={loading || Boolean(queryStatus)} className="flex-1">
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/user/my-profile">
                  <ArrowLeft className="h-4 w-4" />
                  Xem lịch hẹn
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Về trang chủ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
