"use client";

import { useCallback, useEffect, useState } from "react";

import { adminAppointmentLifecycleService } from "@/features/admin-appointment-lifecycle/services/adminAppointmentLifecycleService";
import { LifecycleNodeDetail } from "@/features/admin-appointment-lifecycle/types/admin-appointment-lifecycle.types";

const getErrorMessage = (error: unknown): string => {
  const apiError = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };

  if (apiError?.response?.status === 404) {
    return apiError.response.data?.message || "Node detail was not found.";
  }

  return apiError?.response?.data?.message || apiError?.message || "Unable to load node detail.";
};

export const useLifecycleNodeDetail = (appointmentId: string, nodeId: string | null) => {
  const [detail, setDetail] = useState<LifecycleNodeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!appointmentId || !nodeId) {
      setDetail(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await adminAppointmentLifecycleService.getNodeDetail(appointmentId, nodeId);
      setDetail(result);
    } catch (loadError: unknown) {
      setDetail(null);
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [appointmentId, nodeId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    detail,
    loading,
    error,
    retry: load,
  };
};
