"use client";

import { useCallback, useEffect, useState } from "react";

import { adminAppointmentLifecycleService } from "@/features/admin-appointment-lifecycle/services/adminAppointmentLifecycleService";
import { LifecycleTree } from "@/features/admin-appointment-lifecycle/types/admin-appointment-lifecycle.types";

const getErrorMessage = (error: unknown): string => {
  const apiError = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };

  if (apiError?.response?.status === 404) {
    return apiError.response.data?.message || "Appointment lifecycle was not found.";
  }

  if (apiError?.response?.status === 403) {
    return apiError.response.data?.message || "Only admins can view appointment lifecycle data.";
  }

  return apiError?.response?.data?.message || apiError?.message || "Unable to load appointment lifecycle.";
};

export const useAdminAppointmentLifecycle = (appointmentId: string) => {
  const [tree, setTree] = useState<LifecycleTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!appointmentId) return;
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setError(null);

      try {
        const result = await adminAppointmentLifecycleService.getLifecycle(appointmentId);
        setTree(result);
      } catch (loadError: unknown) {
        setTree(null);
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [appointmentId]
  );

  useEffect(() => {
    void load("initial");
  }, [load]);

  return {
    tree,
    loading,
    refreshing,
    error,
    refresh: () => load("refresh"),
  };
};
