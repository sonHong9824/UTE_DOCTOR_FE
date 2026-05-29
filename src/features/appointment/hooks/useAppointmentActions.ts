"use client";

import { appointmentService } from "@/features/appointment/services/appointment.service";
import { ReschedulePayload } from "@/features/appointment/types/appointment.types";
import { getCancelAppointmentErrorMessage } from "@/features/appointment/utils/cancel-appointment-error";
import { getRescheduleAppointmentErrorMessage } from "@/features/appointment/utils/reschedule-appointment-error";
import { useState } from "react";
import { toast } from "sonner";

export const useAppointmentActions = () => {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);

  const cancelAppointmentById = async (appointmentId: string, onSuccess?: () => void, reason?: string) => {
    try {
      setCancelLoading(true);
      await appointmentService.cancel(appointmentId, reason);
      window.dispatchEvent(new Event("wallet:refresh"));
      toast.success("Hủy cuộc hẹn thành công");
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to cancel appointment:", error);
      toast.error(getCancelAppointmentErrorMessage(error));
      throw error;
    } finally {
      setCancelLoading(false);
    }
  };

  const rescheduleByPayload = async (payload: ReschedulePayload, onSuccess?: () => void) => {
    try {
      setRescheduleLoading(true);
      await appointmentService.reschedule(payload);
      toast.success("Đổi lịch hẹn thành công");
      onSuccess?.();
    } catch (error: unknown) {
      console.error("Failed to reschedule appointment:", error);
      toast.error(getRescheduleAppointmentErrorMessage(error));
      throw error;
    } finally {
      setRescheduleLoading(false);
    }
  };

  return {
    cancelLoading,
    rescheduleLoading,
    cancelAppointmentById,
    rescheduleByPayload,
  };
};
