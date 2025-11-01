"use client";
import React, { useEffect, useState } from "react";
import type { Slot } from "@/app/doctor/schedule/page";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function CancelShiftModal({
  open,
  onOpenChange,
  shift,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shift: Slot | null;
  loading?: boolean;
  onConfirm: (shiftId: string, reason: string) => Promise<void>;
}) {
  const REASONS = [
    "Bệnh đột xuất",
    "Việc gia đình",
    "Tham gia hội thảo",
    "Lý do khác"
  ];

  const [reasonChoice, setReasonChoice] = useState<string>(REASONS[0]);
  const [customReason, setCustomReason] = useState<string>("");

  useEffect(() => {
    if (!open) {
      setReasonChoice(REASONS[0]);
      setCustomReason("");
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!shift || !shift._id) return;
    const reason = reasonChoice === "Lý do khác" ? (customReason.trim() || "Không có lý do cụ thể") : reasonChoice;
    await onConfirm(shift._id, reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <DialogTitle>Hủy ca có bệnh nhân</DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-3">
          <p className="text-sm text-muted-foreground mb-3">
            Hủy ca này sẽ gửi email thông báo cho bệnh nhân. Vui lòng chọn lý do:
          </p>

          <div className="space-y-2">
            {REASONS.map((r) => (
              <label key={r} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="cancel-reason"
                  value={r}
                  checked={reasonChoice === r}
                  onChange={() => setReasonChoice(r)}
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}

            {reasonChoice === "Lý do khác" && (
              <div className="mt-2">
                <Textarea
                  value={customReason}
                  onChange={(e: any) => setCustomReason(e.target.value)}
                  placeholder="Ghi rõ lý do hủy..."
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          {shift && (
            <div className="mt-4 text-xs text-muted-foreground">
              <div><strong>Ngày:</strong> {shift.date}</div>
              <div><strong>Ca:</strong> {shift.shiftKey}</div>
              {shift.location && <div><strong>Địa điểm:</strong> {shift.location}</div>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Đóng
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !shift?._id}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Đang hủy...
              </>
            ) : (
              "Xác nhận hủy và gửi mail"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}