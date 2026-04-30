import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export interface VisitApiItem {
  visitId: string;
  appointmentId: string;
  status: "CREATED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED";
  scheduledAt: number;
  patientName: string;
  doctorName: string;
  appointmentStatus?: string;
}

export type ReceptionistVisitsResponse = DataResponse<VisitApiItem[]>;

export type CheckInVisitResponse = DataResponse<{
  visitId: string;
  status: "CHECKED_IN";
}>;

export const getTodayVisits = async () => {
  const res = await axiosClient.get<ReceptionistVisitsResponse>("/receptionist/visits");
  console.log("API Response for getTodayVisits:", res.data);
  return res.data;
};

export const checkInVisit = async (visitId: string) => {
  const res = await axiosClient.patch<CheckInVisitResponse>(
    `/receptionist/visits/${visitId}/check-in`,
    {}
  );

  return res.data;
};