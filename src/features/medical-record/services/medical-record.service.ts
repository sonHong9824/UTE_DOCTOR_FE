import { CreatePrescriptionPdfDto, generatePrescriptionPdf } from "@/apis/medicine/medicine.api";
import { getPatientByAccount, getPatientProfile } from "@/apis/patient/patient.api";

export const medicalRecordService = {
  async getPatientProfile(patientId: string) {
    return getPatientProfile(patientId);
  },

  async getPatientByAccount(accountId: string) {
    return getPatientByAccount(accountId);
  },

  async generatePrescriptionPdf(targetId: string, payload: CreatePrescriptionPdfDto) {
    return generatePrescriptionPdf(targetId, payload);
  },
};
