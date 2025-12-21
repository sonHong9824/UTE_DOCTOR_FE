import { AccountProfileDTO } from "../accountDTO/accountProfile.dto";
import { MedicalRecordDto } from "./medical-record.dto";

export enum AllergyType {
  DRUG = 'DRUG',
  FOOD = 'FOOD',
}

export enum RecordSource {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
}

export enum ConditionStatus {
  ONGOING = 'ONGOING',
  RESOLVED = 'RESOLVED',
}

export interface MedicalProfile {
  patientId: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  createdByRole: string;
  createdByAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AllergyRecord {
  _id: string;
  patientId: string;
  type: AllergyType;
  substance: string;
  reaction?: string;
  severity?: string;
  reportedBy: RecordSource;
  verifiedByDoctor: boolean;
  verifiedByDoctorId?: string;
  createdByRole: string;
  createdByAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistoryRecord {
  _id: string;
  patientId: string;
  conditionName: string;
  diagnosisCode?: string;
  diagnosedAt?: string;
  status: ConditionStatus;
  source: RecordSource;
  verifiedByDoctor?: boolean;
  verifiedByDoctorId?: string;
  createdByRole: string;
  createdByAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalEncounter {
  _id: string;
  appointmentId: string;
  patientId: string;
  createdByDoctorId?: string;
  diagnosis: string;
  note?: string;
  createdByRole: string;
  createdByAccountId?: string;
  prescriptions: Array<{
    medicineId?: string;
    name: string;
    quantity: number;
    note?: string;
  }>;
  vitalSigns: any[];
  dateRecord: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfileDto {
    accountProfileDto: AccountProfileDTO
    medicalRecord: MedicalRecordDto | null // legacy
    medicalProfile?: MedicalProfile | null
    encounters?: MedicalEncounter[]
    allergies?: AllergyRecord[]
    medicalHistory?: MedicalHistoryRecord[]
}