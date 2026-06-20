"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { adminAppointmentLifecycleService } from "@/features/admin-appointment-lifecycle/services/adminAppointmentLifecycleService";
import { getMarkNoShowErrorMessage } from "@/features/appointment/utils/mark-no-show-error";

export const useMarkAppointmentNoShow = () => {
  const [markingAppointmentId, setMarkingAppointmentId] = useState<string | null>(null);

  const markNoShow = useCallback(async (appointmentId: string, onSuccess?: () => void | Promise<void>) => {
    if (markingAppointmentId) return;

    setMarkingAppointmentId(appointmentId);
    try {
      const result = await adminAppointmentLifecycleService.markNoShow(appointmentId);
      toast.success(
        result?.alreadyNoShow
          ? "Lịch khám đã được ghi nhận không đến khám trước đó."
          : "Đã đánh dấu bệnh nhân không đến khám."
      );
      await onSuccess?.();
    } catch (error: unknown) {
      toast.error(getMarkNoShowErrorMessage(error));
    } finally {
      setMarkingAppointmentId(null);
    }
  }, [markingAppointmentId]);

  return {
    markingAppointmentId,
    markNoShow,
  };
};
