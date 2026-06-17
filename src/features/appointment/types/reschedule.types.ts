export type RescheduleFormValues = {
  appointmentDate: string;
  timeSlotId: string;
  reason?: string;
};

export type RescheduleTimeSlotOption = {
  id: string;
  start?: string;
  end?: string;
  label?: string;
};

export type RescheduleAppointmentDetail = {
  _id?: string;
  id?: string;
  // booking snapshot: { id, name, email }
  doctor?: { id?: string; name?: string; email?: string };
  // populated ref or bare ObjectId string
  doctorId?: string | { _id?: string; id?: string; profileId?: { name?: string }; name?: string };
  doctorName?: string;
  appointmentStatus?: string;
  visitStatus?: string;
  scheduledAt?: string | number;
  appointmentDate?: string | number;
  date?: string | number;
  startTime?: string | number;
  endTime?: string | number;
  timeSlot?: {
    _id?: string;
    id?: string;
    start?: string;
    end?: string;
    label?: string;
  };
};
