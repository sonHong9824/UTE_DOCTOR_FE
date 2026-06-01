"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { bookBroadAppointment, getSpecialties } from "@/apis/appointment/appointment.api";
import { SpecialtyOption } from "@/features/appointment/types/appointment.types";

type PaymentCategory = "BHYT" | "DICH_VU";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

export default function BroadAppointmentBookingScreen() {
  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [reason, setReason] = useState("");
  const [paymentCategory, setPaymentCategory] = useState<PaymentCategory>("DICH_VU");
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void getSpecialties()
      .then((res) => setSpecialties(res.data ?? []))
      .catch(() => setSpecialties([]));
  }, []);

  const handleSubmit = async () => {
    if (!specialty && !reason.trim()) {
      toast.error("Vui lòng chọn chuyên khoa hoặc nhập lý do khám.");
      return;
    }
    if (paymentCategory === "DICH_VU" && (!depositAmount || depositAmount <= 0)) {
      toast.error("Vui lòng nhập số tiền đặt cọc cho dịch vụ.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookBroadAppointment({
        broadBooking: true,
        specialty: specialty || undefined,
        reasonForAppointment: reason.trim() || undefined,
        paymentCategory,
        depositAmount: paymentCategory === "DICH_VU" ? depositAmount : undefined,
        paymentMethod: paymentCategory === "DICH_VU" ? "VNPAY" : "OFFLINE",
        serviceType: paymentCategory === "DICH_VU" ? "KHAM_DICH_VU" : "KHAM_BHYT",
      });

      const paymentUrl = res.data?.paymentUrl;
      if (paymentUrl) {
        // DICH_VU: open the VNPay deposit page. Deposit confirmation is tracked server-side;
        // the appointment shows as "awaiting assignment" until a receptionist assigns a doctor.
        window.open(paymentUrl, "broadDepositPayment", "width=900,height=700");
        toast.success("Đã tạo yêu cầu. Vui lòng hoàn tất thanh toán đặt cọc.");
      } else {
        toast.success("Đã tạo yêu cầu. Lễ tân sẽ phân công bác sĩ cho bạn.");
      }
      setSubmitted(true);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không thể tạo yêu cầu đặt khám.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarClock className="h-5 w-5 text-emerald-600" />
            Đặt khám không chọn bác sĩ
          </CardTitle>
          <CardDescription>
            Mô tả nhu cầu khám, lễ tân sẽ phân công bác sĩ và khung giờ phù hợp cho bạn.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              Yêu cầu của bạn đang chờ lễ tân phân công bác sĩ. Bạn sẽ nhận được thông báo khi có bác sĩ và lịch khám.
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Chuyên khoa</Label>
                <select className={inputClass} value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  <option value="">-- Chọn chuyên khoa (tùy chọn) --</option>
                  {specialties.map((s) => (
                    <option key={s._id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Lý do khám</Label>
                <textarea
                  className={`${inputClass} min-h-[96px]`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Mô tả triệu chứng / lý do khám"
                />
                <p className="text-xs text-muted-foreground">Cần ít nhất chuyên khoa hoặc lý do khám.</p>
              </div>

              <div className="space-y-1.5">
                <Label>Hình thức</Label>
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentCategory"
                      checked={paymentCategory === "DICH_VU"}
                      onChange={() => setPaymentCategory("DICH_VU")}
                    />
                    Dịch vụ (đặt cọc)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentCategory"
                      checked={paymentCategory === "BHYT"}
                      onChange={() => setPaymentCategory("BHYT")}
                    />
                    BHYT (không đặt cọc)
                  </label>
                </div>
              </div>

              {paymentCategory === "DICH_VU" && (
                <div className="space-y-1.5">
                  <Label>Số tiền đặt cọc (VND)</Label>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              )}

              <Button type="button" onClick={() => void handleSubmit()} disabled={submitting} className="w-full gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Gửi yêu cầu
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
