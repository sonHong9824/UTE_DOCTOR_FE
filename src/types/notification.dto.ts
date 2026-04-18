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

export type NotificationMap = {
  COIN_EXPIRY_REMINDER: CoinExpiryDto;
  APPOINTMENT_SUCCESS: AppointmentSuccessDto;
  APPOINTMENT_CANCELLED: AppointmentCancelledDto;
  PAYMENT_SUCCESS: PaymentSuccessDto;
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
