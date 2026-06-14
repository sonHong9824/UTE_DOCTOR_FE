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
  date?: string;
  timeSlot?: string;
  timeSlotLabel?: string;
  hospitalName?: string;
  [key: string]: unknown;
};

export type AppointmentCancelledDto = {
  appointmentId: string;
  patientEmail: string;
  doctorEmail?: string;
  date: string;
  timeSlot: string;
  timeSlotLabel?: string;
  hospitalName?: string;
  reason?: string;
  refundAmount?: number;
  shouldRefund?: boolean;
};

export type PaymentSuccessDto = {
  orderId: string;
  status: "COMPLETED";
};

// Reuses the existing BE reschedule DTO shape; fields kept optional defensively because the
// contract documents it as "reuses existing BE DTO structures" without an explicit field list.
export type AppointmentRescheduledDto = {
  appointmentId?: string;
  patientEmail?: string;
  doctorEmail?: string;
  date?: string;
  timeSlot?: string;
  timeSlotLabel?: string;
  hospitalName?: string;
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
  online?: boolean;
};

export type AppointmentDoctorAssignedDto = {
  appointmentId: string;
  doctorId: string;
  timeSlotId: string;
  scheduledAt: number; // epoch ms
};

export type NotificationMap = {
  COIN_EXPIRY_REMINDER: CoinExpiryDto;
  APPOINTMENT_SUCCESS: AppointmentSuccessDto;
  APPOINTMENT_CANCELLED: AppointmentCancelledDto;
  APPOINTMENT_RESCHEDULED: AppointmentRescheduledDto;
  PAYMENT_SUCCESS: PaymentSuccessDto;
  // Broad-booking / assignment (doctor-less appointment routing):
  ASSIGNMENT_TASK_CREATED: AssignmentTaskCreatedDto; // -> receptionists
  ASSIGNMENT_TASK_REMINDER: AssignmentTaskReminderDto; // -> receptionists (SLA, near deadline)
  ASSIGNMENT_TASK_EXPIRED: AssignmentTaskExpiredDto; // -> receptionists (SLA, past deadline)
  APPOINTMENT_DOCTOR_ASSIGNED: AppointmentDoctorAssignedDto; // -> patient
};

export type NotificationType = keyof NotificationMap;

export type NotificationPayload = {
  [K in keyof NotificationMap]: {
    type: K;
    data: NotificationMap[K];
    createdAt: number;
    recipientEmail: string;
    idempotencyKey: string;
  };
}[keyof NotificationMap];

export type Notification = {
  _id: string;
  title: string;
  message: string;
  type?: NotificationType;
  data?: NotificationMap[NotificationType];
  isRead: boolean;
  receiverEmail?: string[];
  isBroadcast: boolean;
  createdAt: string;
};
