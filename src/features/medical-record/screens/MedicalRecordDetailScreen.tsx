"use client";

import MedicalRecordDetailView from "@/features/medical-record/components/MedicalRecordDetailView";
import { MedicalRecordDto } from "@/types/patientDTO/medical-record.dto";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";

interface MedicalRecordDetailScreenProps {
  user?: PatientProfileDto;
  medicalRecord?: MedicalRecordDto;
  // UI-only navigation to another profile tab (forwarded to the in-tab CTA card).
  onNavigateToTab?: (tab: string) => void;
}

export default function MedicalRecordDetailScreen({
  user,
  medicalRecord,
  onNavigateToTab,
}: MedicalRecordDetailScreenProps) {
  return (
    <MedicalRecordDetailView
      user={user}
      medicalRecord={medicalRecord}
      onNavigateToTab={onNavigateToTab}
    />
  );
}
