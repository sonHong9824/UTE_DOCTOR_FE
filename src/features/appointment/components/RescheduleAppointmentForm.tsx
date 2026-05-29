"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RescheduleFormValues, RescheduleTimeSlotOption } from "@/features/appointment/types/reschedule.types";
import { cn } from "@/lib/utils";
import { AlertCircle, CalendarDays } from "lucide-react";

interface RescheduleAppointmentFormProps {
  doctorName: string;
  appointmentStatus: string;
  currentScheduledDisplay: string;
  currentSlotDisplay: string;
  isEligible: boolean;
  ineligibilityReason: string | null;
  formValues: RescheduleFormValues;
  slotOptions: RescheduleTimeSlotOption[];
  loadingSlots: boolean;
  submitting: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  getSlotLabel: (slot: RescheduleTimeSlotOption) => string;
  onDateChange: (date: string) => Promise<void>;
  onSlotChange: (slotId: string) => void;
  onReasonChange: (reason: string) => void;
  onSubmit: () => Promise<void>;
}

export default function RescheduleAppointmentForm({
  doctorName,
  appointmentStatus,
  currentScheduledDisplay,
  currentSlotDisplay,
  isEligible,
  ineligibilityReason,
  formValues,
  slotOptions,
  loadingSlots,
  submitting,
  errorMessage,
  successMessage,
  getSlotLabel,
  onDateChange,
  onSlotChange,
  onReasonChange,
  onSubmit,
}: RescheduleAppointmentFormProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <CalendarDays className="h-6 w-6" />
          Đổi lịch hẹn
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p>
              <strong>Bác sĩ:</strong> {doctorName}
            </p>
            <p>
              <strong>Trạng thái:</strong> {appointmentStatus || "--"}
            </p>
            <p>
              <strong>Lịch hiện tại:</strong> {currentScheduledDisplay}
            </p>
            <p>
              <strong>Khung giờ hiện tại:</strong> {currentSlotDisplay}
            </p>
          </div>
        </div>

        {!isEligible && ineligibilityReason && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{ineligibilityReason}</AlertDescription>
          </Alert>
        )}

        {isEligible && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày khám mới</label>
              <input
                type="date"
                min={today}
                value={formValues.appointmentDate}
                onChange={(e) => {
                  void onDateChange(e.target.value);
                }}
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Khung giờ mới</label>

              {loadingSlots ? (
                <p className="text-sm text-muted-foreground">Đang tải khung giờ...</p>
              ) : slotOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có khung giờ trống cho ngày đã chọn.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {slotOptions.map((slot) => {
                    const selected = formValues.timeSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => onSlotChange(slot.id)}
                        className={cn(
                          "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:border-primary/40"
                        )}
                      >
                        {getSlotLabel(slot)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lý do đổi lịch (tùy chọn)</label>
              <textarea
                value={formValues.reason ?? ""}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder="Nhập lý do đổi lịch..."
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm resize-none"
              />
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  void onSubmit();
                }}
                disabled={submitting || !formValues.appointmentDate || !formValues.timeSlotId}
              >
                {submitting ? "Đang cập nhật..." : "Xác nhận đổi lịch"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
