import { BloodType } from "@/enum/blood-type.enum";


export interface VitalSignRecord {
  value: number | { systolic: number; diastolic: number }; 
  dateRecord: Date;
}

export interface MedicalRecordDescriptionDto {
    name: string;
    description: string;
    dateRecord: Date;
}

export interface MedicalRecordDto {
    height: number | 0;
    weight: number | 0;
    bloodType: BloodType | null;
    medicalHistory: MedicalRecordDescriptionDto[] | [];
    drugAllergies: MedicalRecordDescriptionDto[] | [];
    foodAllergies: MedicalRecordDescriptionDto[] | [];

    bloodPressure: VitalSignRecord[] | []; // {systolic, diastolic, dateRecord}
    heartRate: VitalSignRecord[] | [];     // {value, dateRecord}
}