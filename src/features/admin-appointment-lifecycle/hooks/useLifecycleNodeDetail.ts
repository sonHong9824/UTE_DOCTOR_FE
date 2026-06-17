"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!appointmentId || !nodeId) {
      requestIdRef.current += 1;
      setDetail(null);
      setError(null);
      setLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);
    setDetail(null);

    try {
      const result = await adminAppointmentLifecycleService.getNodeDetail(appointmentId, nodeId);
      if (requestId !== requestIdRef.current) return;
      setDetail(result);
    } catch (loadError: unknown) {
      if (requestId !== requestIdRef.current) return;
      setDetail(null);
      setError(getErrorMessage(loadError));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
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
