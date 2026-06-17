"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { adminAppointmentLifecycleService } from "@/features/admin-appointment-lifecycle/services/adminAppointmentLifecycleService";
import {
  AdminAppointmentQuery,
  AdminAppointmentSummary,
} from "@/features/admin-appointment-lifecycle/types/admin-appointment-lifecycle.types";
import { normalizeDateInputToEpochMs } from "@/features/admin-appointment-lifecycle/utils/lifecycle-formatters";

export interface AppointmentLifecycleFilters {
  status: string;
  paymentCategory: string;
  depositStatus: string;
  assignmentStatus: string;
  patientEmail: string;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: AppointmentLifecycleFilters = {
  status: "ALL",
  paymentCategory: "ALL",
  depositStatus: "ALL",
  assignmentStatus: "ALL",
  patientEmail: "",
  dateFrom: "",
  dateTo: "",
};

const getErrorMessage = (error: unknown): string => {
  const apiError = error as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };

  if (apiError?.response?.status === 403) {
    return apiError.response.data?.message || "Only admins can view appointment lifecycle data.";
  }

  return apiError?.response?.data?.message || apiError?.message || "Unable to load appointments.";
};

export const useAdminAppointments = () => {
  const [items, setItems] = useState<AdminAppointmentSummary[]>([]);
  const [filters, setFilters] = useState<AppointmentLifecycleFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo<AdminAppointmentQuery>(() => {
    return {
      page,
      limit,
      sort: "bookingDate:desc",
      status: filters.status === "ALL" ? undefined : filters.status,
      paymentCategory: filters.paymentCategory === "ALL" ? undefined : filters.paymentCategory,
      depositStatus: filters.depositStatus === "ALL" ? undefined : filters.depositStatus,
      assignmentStatus: filters.assignmentStatus === "ALL" ? undefined : filters.assignmentStatus,
      patientEmail: filters.patientEmail.trim() || undefined,
      dateFrom: normalizeDateInputToEpochMs(filters.dateFrom),
      dateTo: normalizeDateInputToEpochMs(filters.dateTo, true),
    };
  }, [filters, limit, page]);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setError(null);

      try {
        const result = await adminAppointmentLifecycleService.listAppointments(query);
        setItems(result.items);
        setTotal(result.total);
      } catch (loadError: unknown) {
        setItems([]);
        setTotal(0);
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [query]
  );

  useEffect(() => {
    const debounceMs = filters.patientEmail.trim() ? 350 : 0;
    const timeoutId = setTimeout(() => {
      void load("initial");
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, load]);

  const updateFilter = useCallback(<K extends keyof AppointmentLifecycleFilters>(
    key: K,
    value: AppointmentLifecycleFilters[K]
  ) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setPage(1);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items,
    filters,
    page,
    limit,
    total,
    totalPages,
    loading,
    refreshing,
    error,
    setPage,
    setLimit,
    updateFilter,
    resetFilters,
    refresh: () => load("refresh"),
  };
};
