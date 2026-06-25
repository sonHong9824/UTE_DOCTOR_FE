export type CoinExpiryDto = {
  appointmentId?: string;
  coinAmount?: number;
  expiresAt?: string | number | null;
  hospitalName?: string;
  message?: string;
  [key: string]: unknown;
};

export type AppointmentSuccessDto = {
  appointmentId?: string;
  patientEmail?: string;
  doctorEmail?: string;
  appointmentDate?: string | number | null;
  scheduledAt?: string | number | null;
  date?: string | number | null;
  timeRange?: string | null;
  timeSlot?: string;
  timeSlotLabel?: string;
  hospitalName?: string | null;
  doctorName?: string | null;
  patientName?: string | null;
  [key: string]: unknown;
};

export type AppointmentCancelledDto = {
  appointmentId?: string;
  patientEmail?: string;
  doctorEmail?: string;
  appointmentDate?: string | number | null;
  scheduledAt?: string | number | null;
  date?: string | number | null;
  timeRange?: string | null;
  timeSlot?: string;
  timeSlotLabel?: string;
  hospitalName?: string | null;
  doctorName?: string | null;
  patientName?: string | null;
  reason?: string;
  refundAmount?: number;
  shouldRefund?: boolean;
  actor?: string;
  reasonCode?: string;
  assignmentTaskId?: string;
  deadlineAt?: string | number | null;
  [key: string]: unknown;
};

export type AppointmentNoShowDto = {
  appointmentId?: string;
  patientEmail?: string;
  doctorEmail?: string;
  appointmentDate?: string | number | null;
  scheduledAt?: string | number | null;
  date?: string | number | null;
  timeRange?: string | null;
  timeSlot?: string;
  timeSlotLabel?: string;
  hospitalName?: string | null;
  doctorName?: string | null;
  patientName?: string | null;
  noShowAt?: string | number | null;
  noShowActor?: string;
  noShowSource?: string;
  noShowReasonCode?: string;
  depositStatus?: string;
  [key: string]: unknown;
};

export type PaymentSuccessDto = {
  orderId?: string;
  appointmentId?: string;
  amount?: number;
  paidAt?: string | number | null;
  status?: "COMPLETED" | string;
  [key: string]: unknown;
};

// Reuses the existing BE reschedule DTO shape; fields kept optional defensively because the
// contract documents it as "reuses existing BE DTO structures" without an explicit field list.
export type AppointmentRescheduledDto = {
  appointmentId?: string;
  patientEmail?: string;
  doctorEmail?: string;
  appointmentDate?: string | number | null;
  scheduledAt?: string | number | null;
  oldScheduledAt?: string | number | null;
  newScheduledAt?: string | number | null;
  date?: string | number | null;
  timeRange?: string | null;
  timeSlot?: string;
  timeSlotLabel?: string;
  hospitalName?: string | null;
  doctorName?: string | null;
  patientName?: string | null;
  [key: string]: unknown;
};

// ── Broad-booking / assignment notification DTOs (delivered as `payload.data`). ──
// `online` reflects whether Redis role-aware presence saw this receptionist online at emit
// time — informational only (e.g. badge styling), never required for correctness.
export type AssignmentTaskCreatedDto = {
  taskId: string;
  appointmentId: string;
  specialty?: string;
  reasonForAppointment?: string;
  deadlineAt: number; // epoch ms
  priority?: string; // e.g. "NORMAL"
  online?: boolean;
};

export type AssignmentTaskReminderDto = {
  taskId: string;
  appointmentId?: string;
  deadlineAt: number; // epoch ms
  reminderCount?: number;
  online?: boolean;
};

export type AssignmentTaskExpiredDto = {
  taskId: string;
  appointmentId?: string;
  deadlineAt: number; // epoch ms
  actor?: string;
  reasonCode?: string;
  online?: boolean;
};

// `APPOINTMENT_DOCTOR_ASSIGNED` (broad booking → receptionist assigns a doctor/slot → patient).
// Per api-contract 4acfae3 (2026-06-22), `doctorName`, `hospitalName`, `startTime`, `endTime`,
// `serviceType`, and `specialty` are new, optional, backward-compatible (any may be null/absent);
// times stay epoch ms — FE still owns formatting. The fallback `message` is now a complete sentence.
export type AppointmentDoctorAssignedDto = {
  appointmentId: string;
  doctorId?: string;
  doctorName?: string | null;
  patientName?: string | null;
  timeSlotId?: string;
  scheduledAt?: number | null; // epoch ms
  appointmentDate?: number | null; // epoch ms
  startTime?: number | null; // epoch ms — slot start
  endTime?: number | null; // epoch ms — slot end
  timeRange?: string | null;
  timeSlotLabel?: string | null;
  hospitalName?: string | null;
  serviceType?: string | null; // e.g. KHAM_BHYT | KHAM_DICH_VU | KHAM_ONLINE
  specialty?: string | null;
  [key: string]: unknown;
};

export type NotificationMap = {
  COIN_EXPIRY_REMINDER: CoinExpiryDto;
  APPOINTMENT_SUCCESS: AppointmentSuccessDto;
  APPOINTMENT_CANCELLED: AppointmentCancelledDto;
  APPOINTMENT_NO_SHOW: AppointmentNoShowDto;
  APPOINTMENT_RESCHEDULED: AppointmentRescheduledDto;
  PAYMENT_SUCCESS: PaymentSuccessDto;
  // Broad-booking / assignment (doctor-less appointment routing):
  ASSIGNMENT_TASK_CREATED: AssignmentTaskCreatedDto; // -> receptionists
  ASSIGNMENT_TASK_REMINDER: AssignmentTaskReminderDto; // -> receptionists (SLA, near deadline)
  ASSIGNMENT_TASK_EXPIRED: AssignmentTaskExpiredDto; // -> receptionists (SLA, past deadline)
  APPOINTMENT_DOCTOR_ASSIGNED: AppointmentDoctorAssignedDto; // -> patient
};

export type NotificationType = keyof NotificationMap;
export type NotificationRecipientRole =
  | "PATIENT"
  | "DOCTOR"
  | "RECEPTIONIST"
  | "ADMIN"
  | (string & {});

export type NotificationPayload = {
  [K in keyof NotificationMap]: {
    type: K;
    recipientRole?: NotificationRecipientRole;
    titleKey?: string;
    messageKey?: string;
    title?: string;
    message?: string;
    data: NotificationMap[K];
    details?: NotificationMap[K];
    createdAt: number;
    recipientEmail: string;
    idempotencyKey: string;
  };
}[keyof NotificationMap];

export type Notification = {
  _id: string;
  title: string;
  message: string;
  type?: NotificationType | string;
  recipientRole?: NotificationRecipientRole;
  titleKey?: string;
  messageKey?: string;
  templateKey?: string;
  data?: NotificationMap[NotificationType];
  details?: NotificationMap[NotificationType] | Record<string, unknown>;
  isRead: boolean;
  receiverEmail?: string[];
  isBroadcast: boolean;
  createdAt: string | number;
  updatedAt?: string | number;
};
