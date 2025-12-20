export interface MedicalHistoryRecord {
  _id: string;
  diagnosis: string;
  prescriptions: Prescription[];
  note: string;
  dateRecord: string;
  appointmentId: string;
}

export interface Prescription {
  medicineId?: string;
  name: string;
  quantity: number;
  note: string;
}

export interface Allergy {
  _id: string;
  name: string;
  description: string;
  dateRecord: string;
  diagnosis: string;
  appointmentId: string;
  prescriptions: any[];
}

export interface BloodPressureRecord {
  _id: string;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  dateRecord: string;
}

export interface HeartRateRecord {
  _id: string;
  value: number;
  dateRecord: string;
}

export interface MedicalRecord {
  _id: string;
  height: number;
  weight: number;
  bloodType: string;
  medicalHistory: MedicalHistoryRecord[];
  drugAllergies: Allergy[];
  foodAllergies: Allergy[];
  bloodPressure: BloodPressureRecord[];
  heartRate: HeartRateRecord[];
}

export interface PatientProfile {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface PatientAccount {
  _id: string;
  profileId: string;
  role: string;
  email: string;
  password: string;
  status: string;
  otp: string | null;
  otpCreatedAt: string | null;
  otpExpiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  refreshToken?: string;
}

export interface Patient {
  _id: string;
  profileId: string;
  accountId: string;
  height: number;
  weight: number;
  bloodType: string;
  medicalRecord: MedicalRecord;
  profile?: PatientProfile;
}

export interface TimeSlot {
  _id: string;
  start: string;
  end: string;
  label: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Specialty {
  _id: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAccount {
  _id: string;
  profileId: string;
  role: string;
  email: string;
  password: string;
  status: string;
  otp: string;
  otpCreatedAt: string;
  otpExpiredAt: string;
  createdAt: string;
  updatedAt: string;
  refreshToken?: string;
}

export interface Doctor {
  _id: string;
  profileId: DoctorProfile;
  accountId: DoctorAccount;
  doctorName: string;
  chuyenKhoaId: Specialty;
  degree: string[];
  academic: string;
  bio: string;
  achievements: string[];
  yearsOfExperience: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompletedAppointment {
  _id: string;
  date: string;
  appointmentStatus: string;
  serviceType: string;
  consultationFee: number;
  timeSlot: TimeSlot;
  patientId: string;
  patientEmail: string;
  doctorId: string | Doctor;
  reasonForAppointment: string;
  specialtyId: string | Specialty;
  paymentMethod: string;
  hospitalName: string;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  appointmentMedicalRecord?: MedicalHistoryRecord;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface CompletedAppointmentsResponse {
  items: CompletedAppointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
