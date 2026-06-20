export type VisitStatus =
  | "CREATED"
  | "CHECKED_IN"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface VisitDto {
  visitId: string;
  appointmentId?: string;
  status: VisitStatus;
  scheduledAt: number; // epoch ms
  patientName?: string;
  doctorName?: string;
  appointmentStatus?: string;
}

export interface CompleteVisitPayload {
  diagnosis?: string;
  note?: string;
  prescriptions: Array<{
    medicineId?: string | null;
    name?: string | null;
    quantity: number;
    note?: string;
  }>;
}
