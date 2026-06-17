"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  getDoctorBySpecialty,
  getSpecialties,
  getTimeSlotsByDoctorAndDate,
} from "@/apis/appointment/appointment.api";
import {
  AssignmentTask,
  assignAssignmentTask,
  getBlockedReasonMessage,
} from "@/apis/appointment/assignment-task.api";
import { DoctorOption, SpecialtyOption } from "@/features/appointment/types/appointment.types";
import { TimeSlotDto } from "@/types/timeslot.dto";
import { buildZonedISO } from "@/utils/time.util";

interface Props {
  task: AssignmentTask | null;
  onClose: () => void;
  onAssigned: () => void;
}

const selectClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

export function AssignDoctorSlotDialog({ task, onClose, onAssigned }: Props) {
  const open = task !== null;

  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<TimeSlotDto[]>([]);
  const [timeSlotId, setTimeSlotId] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset the form whenever the dialog opens for a new task.
  useEffect(() => {
    if (!open) return;
    setSpecialtyId("");
    setDoctors([]);
    setDoctorId("");
    setDate("");
    setSlots([]);
    setTimeSlotId("");
    void getSpecialties()
      .then((res) => setSpecialties(res.data ?? []))
      .catch(() => setSpecialties([]));
  }, [open]);

  // Load doctors when a specialty is chosen.
  useEffect(() => {
    if (!specialtyId) {
      setDoctors([]);
      return;
    }
    setLoadingDoctors(true);
    setDoctorId("");
    setSlots([]);
    setTimeSlotId("");
    void getDoctorBySpecialty({ specialtyId, keyword: "" })
      .then((res) => setDoctors(res.data ?? []))
      .catch(() => setDoctors([]))
      .finally(() => setLoadingDoctors(false));
  }, [specialtyId]);

  const loadSlots = useCallback(async (nextDoctorId: string, nextDate: string) => {
    if (!nextDoctorId || !nextDate) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setTimeSlotId("");
    try {
      const res = await getTimeSlotsByDoctorAndDate({ doctorId: nextDoctorId, date: nextDate });
      setSlots(res?.data ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (doctorId && date) void loadSlots(doctorId, date);
  }, [doctorId, date, loadSlots]);

  const handleSubmit = async () => {
    if (!task) return;
    if (!doctorId || !timeSlotId || !date) {
      toast.error("Vui lòng chọn bác sĩ, ngày và khung giờ.");
      return;
    }
    const slot = slots.find((s) => s.id === timeSlotId);
    const appointmentDate = buildZonedISO(date, slot?.start ?? "00:00");

    setSubmitting(true);
    try {
      await assignAssignmentTask(task._id, { doctorId, timeSlotId, appointmentDate });
      toast.success("Đã phân công bác sĩ và khung giờ.");
      onAssigned();
    } catch (error) {
      toast.error(getBlockedReasonMessage(error, "Phân công thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Phân công bác sĩ &amp; khung giờ</DialogTitle>
          <DialogDescription>
            {task?.specialty ? `Chuyên khoa gợi ý: ${task.specialty}. ` : ""}
            Chọn bác sĩ và khung giờ trống để hoàn tất lịch hẹn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Chuyên khoa</Label>
            <select
              className={selectClass}
              value={specialtyId}
              onChange={(e) => setSpecialtyId(e.target.value)}
            >
              <option value="">-- Chọn chuyên khoa --</option>
              {specialties.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Bác sĩ</Label>
            <select
              className={selectClass}
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              disabled={!specialtyId || loadingDoctors}
            >
              <option value="">{loadingDoctors ? "Đang tải..." : "-- Chọn bác sĩ --"}</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Ngày khám</Label>
            <input
              type="date"
              className={selectClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={!doctorId}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Khung giờ</Label>
            <select
              className={selectClass}
              value={timeSlotId}
              onChange={(e) => setTimeSlotId(e.target.value)}
              disabled={!doctorId || !date || loadingSlots}
            >
              <option value="">
                {loadingSlots ? "Đang tải..." : slots.length ? "-- Chọn khung giờ --" : "Không có khung trống"}
              </option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label || `${slot.start} - ${slot.end}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={submitting} className="gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Phân công
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
