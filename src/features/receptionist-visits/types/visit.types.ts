import type { VisitApiItem } from "@/apis/receptionist/receptionist.api";
import { VisitStatusEnum } from "@/enum/visit-status.enum";

export type VisitStatus = VisitStatusEnum;

export type VisitFilter = "all" | "waiting" | "checked-in";

export interface VisitItem {
  id: string;
  appointmentId: string;
  patientName: string;
  doctorName: string;
  scheduledAt: number;
  status: VisitStatusEnum;
}

export interface VisitCheckInResult {
  visitId: string;
  status: VisitStatusEnum;
}

export interface VisitListState {
  items: VisitItem[];
  loading: boolean;
  refreshing: boolean;
  checkingInVisitId: string | null;
  error: string | null;
  filter: VisitFilter;
}

export type VisitApiResponseItem = VisitApiItem;