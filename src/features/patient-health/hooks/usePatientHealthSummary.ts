"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getMyHealthSummary,
  getPatientHealthErrorMessage,
  isMissingHealthSummaryRoute,
  isPatientHealthMockFallbackEnabled,
} from "@/features/patient-health/services/patient-health.service";
import type { PatientHealthLoadState } from "@/features/patient-health/types/patient-health.types";
import { createMockPatientHealthSummary } from "@/features/patient-health/utils/patient-health.mock";

export const usePatientHealthSummary = () => {
  const [state, setState] = useState<PatientHealthLoadState>({ status: "loading" });

  const load = useCallback(async (background = false) => {
    if (background) {
      setState((current) => {
        if (current.status === "success" || current.status === "empty") {
          return { ...current, refreshing: true, refreshError: undefined };
        }
        return { status: "loading" };
      });
    } else {
      setState({ status: "loading" });
    }

    try {
      const data = await getMyHealthSummary();
      const nextState: PatientHealthLoadState = data.latest
        ? { status: "success", dataSource: "API", data, refreshing: false }
        : { status: "empty", dataSource: "API", data, refreshing: false };
      setState(nextState);
    } catch (error: unknown) {
      if (isPatientHealthMockFallbackEnabled() && isMissingHealthSummaryRoute(error)) {
        setState({
          status: "success",
          dataSource: "MOCK",
          data: createMockPatientHealthSummary(),
          refreshing: false,
        });
        return;
      }

      const message = getPatientHealthErrorMessage(error);
      setState((current) => {
        if (
          background &&
          (current.status === "success" || current.status === "empty") &&
          current.dataSource === "API"
        ) {
          return { ...current, refreshing: false, refreshError: message };
        }

        return { status: "error", message };
      });
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return {
    state,
    retry: () => load(false),
    refresh: () => load(true),
  };
};

