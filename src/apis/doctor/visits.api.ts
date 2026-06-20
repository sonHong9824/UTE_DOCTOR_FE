import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { VisitDto, CompleteVisitPayload } from "@/types/visit.dto";
import { resolveBrowserTimezone } from "@/utils/time.util";

export const getTodayVisits = async () => {
  try {
    const res = await axiosClient.get<DataResponse<VisitDto[]>>("/doctor/visits/today", {
      // The backend derives the local calendar day from this zone; timestamps remain epoch values.
      params: { timezone: resolveBrowserTimezone() },
    });
    console.log("[Axios] Get today visits:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch today's visits:", e);
    throw e;
  }
};

export const startVisit = async (visitId: string) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>(`/doctor/visits/${visitId}/start`);
    console.log("[Axios] Start visit:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to start visit:", e);
    throw e;
  }
};

export const completeVisit = async (visitId: string, payload: CompleteVisitPayload) => {
  try {
    const res = await axiosClient.post<DataResponse<any>>(`/doctor/visits/${visitId}/complete`, payload);
    console.log("[Axios] Complete visit:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to complete visit:", e);
    throw e;
  }
};
