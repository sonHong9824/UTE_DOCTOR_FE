"use client";

import MedicalRecordDetailView from "@/features/medical-record/components/MedicalRecordDetailView";
import { MedicalRecordDto } from "@/types/patientDTO/medical-record.dto";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";

interface MedicalRecordDetailScreenProps {
  user?: PatientProfileDto;
  medicalRecord?: MedicalRecordDto;
}

export default function MedicalRecordDetailScreen({ user, medicalRecord }: MedicalRecordDetailScreenProps) {
  return <MedicalRecordDetailView user={user} medicalRecord={medicalRecord} />;
}
