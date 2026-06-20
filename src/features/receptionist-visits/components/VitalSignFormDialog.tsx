"use client";

import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BloodType } from "@/enum/blood-type.enum";
import { useVitalSignForm } from "@/features/receptionist-visits/hooks/useVitalSignForm";
import type { VisitItem } from "@/features/receptionist-visits/types/visit.types";
import type {
  VitalSignFieldKey,
  VitalSignMetricStatusValue,
  VitalSignRecord,
} from "@/features/receptionist-visits/types/vital-sign.types";
import { getVisitStatusLabel } from "@/features/receptionist-visits/utils/visit.utils";
import { formatApiDateToLocalDateTime } from "@/utils/time.util";

const BLOOD_TYPE_NONE = "__none__";
const BLOOD_TYPE_OPTIONS = Object.values(BloodType);

const SAFETY_NOTE =
  "Chỉ số được ghi nhận nhằm hỗ trợ theo dõi sức khỏe và không thay thế chẩn đoán hoặc tư vấn của nhân viên y tế.";

interface VitalSignFormDialogProps {
  visit: VisitItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const metricStatusBadge = (
  status?: VitalSignMetricStatusValue
): { label: string; variant: "green" | "orange" | "red" | "gray" } | null => {
  switch (status) {
    case "NORMAL":
      return { label: "Bình thường", variant: "green" };
    case "LOW":
      return { label: "Thấp", variant: "orange" };
    case "HIGH":
      return { label: "Cao", variant: "red" };
    case "UNKNOWN":
      return { label: "Chưa xác định", variant: "gray" };
    default:
      return null;
  }
};

const SavedSummary = ({ record }: { record: VitalSignRecord }) => {
  const rows: { label: string; value: string; status?: VitalSignMetricStatusValue }[] = [];

  if (record.heightCm != null) rows.push({ label: "Chiều cao", value: `${record.heightCm} cm` });
  if (record.weightKg != null) rows.push({ label: "Cân nặng", value: `${record.weightKg} kg` });
  if (record.bmi != null)
    rows.push({ label: "BMI", value: String(record.bmi), status: record.status?.bmi });
  if (record.bloodPressureSystolic != null && record.bloodPressureDiastolic != null)
    rows.push({
      label: "Huyết áp",
      value: `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic} mmHg`,
      status: record.status?.bloodPressure,
    });
  if (record.heartRateBpm != null)
    rows.push({
      label: "Nhịp tim",
      value: `${record.heartRateBpm} bpm`,
      status: record.status?.heartRate,
    });
  if (record.bloodType) rows.push({ label: "Nhóm máu", value: record.bloodType });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <span>Đã ghi nhận chỉ số sinh hiệu</span>
      </div>

      <div className="divide-y rounded-lg border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="flex items-center gap-2 font-medium">
              {row.value}
              {(() => {
                const badge = metricStatusBadge(row.status);
                return badge ? <Badge variant={badge.variant}>{badge.label}</Badge> : null;
              })()}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Thời điểm đo</span>
          <span className="font-medium">{formatApiDateToLocalDateTime(record.measuredAt)}</span>
        </div>
        {record.measuredBy?.name ? (
          <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Người đo</span>
            <span className="font-medium">{record.measuredBy.name}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default function VitalSignFormDialog({
  visit,
  open,
  onOpenChange,
}: VitalSignFormDialogProps) {
  const {
    values,
    setField,
    blurField,
    visibleError,
    formError,
    submitting,
    serverError,
    savedRecord,
    submit,
    reset,
  } = useVitalSignForm({ visitId: visit?.id ?? "" });

  // Each time the dialog opens (incl. for a different visit), start from a clean form.
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const numericField = (key: VitalSignFieldKey, label: string, props: Partial<{
    step: string;
    inputMode: "decimal" | "numeric";
    placeholder: string;
  }> = {}) => {
    const error = visibleError(key);
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`vital-${key}`}>{label}</Label>
        <Input
          id={`vital-${key}`}
          type="number"
          min={0}
          step={props.step ?? "1"}
          inputMode={props.inputMode ?? "numeric"}
          placeholder={props.placeholder}
          value={values[key]}
          aria-invalid={Boolean(error)}
          disabled={submitting}
          onChange={(event) => setField(key, event.target.value)}
          onBlur={() => blurField(key)}
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ghi nhận chỉ số sinh hiệu</DialogTitle>
          <DialogDescription>
            Thông tin này được lưu vào hồ sơ sức khỏe của bệnh nhân.
          </DialogDescription>
        </DialogHeader>

        {visit ? (
          <div className="mt-3 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{visit.patientName}</span>
              <Badge variant="blue">{getVisitStatusLabel(visit.status)}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">Bác sĩ: {visit.doctorName}</p>
          </div>
        ) : null}

        {savedRecord ? (
          <div className="mt-4">
            <SavedSummary record={savedRecord} />
            <DialogFooter className="mt-5">
              <Button type="button" variant="outline" onClick={() => reset()}>
                Ghi nhận chỉ số khác
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{SAFETY_NOTE}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {numericField("heightCm", "Chiều cao (cm)", { step: "0.1", inputMode: "decimal" })}
              {numericField("weightKg", "Cân nặng (kg)", { step: "0.1", inputMode: "decimal" })}
              {numericField("bloodPressureSystolic", "Huyết áp tâm thu")}
              {numericField("bloodPressureDiastolic", "Huyết áp tâm trương")}
              {numericField("heartRateBpm", "Nhịp tim (bpm)")}

              <div className="space-y-1.5">
                <Label htmlFor="vital-bloodType">Nhóm máu (tùy chọn)</Label>
                <Select
                  value={values.bloodType || BLOOD_TYPE_NONE}
                  disabled={submitting}
                  onValueChange={(value) =>
                    setField("bloodType", value === BLOOD_TYPE_NONE ? "" : value)
                  }
                >
                  <SelectTrigger id="vital-bloodType">
                    <SelectValue placeholder="Chọn nhóm máu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={BLOOD_TYPE_NONE}>Không chọn</SelectItem>
                    {BLOOD_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vital-measuredAt">Thời điểm đo (tùy chọn)</Label>
              <Input
                id="vital-measuredAt"
                type="datetime-local"
                value={values.measuredAt}
                aria-invalid={Boolean(visibleError("measuredAt"))}
                disabled={submitting}
                onChange={(event) => setField("measuredAt", event.target.value)}
                onBlur={() => blurField("measuredAt")}
              />
              {visibleError("measuredAt") ? (
                <p className="text-xs text-destructive">{visibleError("measuredAt")}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Bỏ trống nếu đo tại thời điểm hiện tại.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vital-note">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="vital-note"
                value={values.note}
                disabled={submitting}
                onChange={(event) => setField("note", event.target.value)}
                rows={2}
              />
            </div>

            {formError ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            {serverError ? (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {serverError}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Đang lưu" : "Lưu chỉ số"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
