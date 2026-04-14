import { CreatePrescriptionPdfDto, PrescriptionItemDto } from "@/apis/medicine/medicine.api";
import { MedicalRecordDetailRecord } from "@/features/medical-record/types/medical-record.types";
import { buildZonedISO, getCurrentLocalTimeHHmm, normalizeApiDateToLocalISO, toLocalDateInput } from "@/utils/time.util";

const MONGO_OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const toValidMongoId = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return MONGO_OBJECT_ID_REGEX.test(trimmed) ? trimmed : undefined;
};

export const normalizePrescriptionItems = (selectedRecord?: MedicalRecordDetailRecord | null): PrescriptionItemDto[] => {
  if (!selectedRecord || !Array.isArray(selectedRecord.prescriptions)) {
    return [];
  }

  return selectedRecord.prescriptions.map((p) => ({
    medicineId: toValidMongoId(p.medicineId || p._id),
    name: p.name || p.title || "Thuốc",
    quantity: Number(p.quantity || p.qty || 1),
    note: p.note || undefined,
  }));
};

export const resolvePdfRequestId = (selectedRecord?: MedicalRecordDetailRecord | null): string | null => {
  if (!selectedRecord) return null;
  return selectedRecord.appointmentId || selectedRecord.apptId || selectedRecord._id || null;
};

export const buildPrescriptionPdfDto = (params: {
  selectedRecord?: MedicalRecordDetailRecord | null;
  patientName?: string;
  patientAge?: number;
  doctorName?: string;
}): CreatePrescriptionPdfDto => {
  const fallbackNow = buildZonedISO(toLocalDateInput(new Date()), getCurrentLocalTimeHHmm());
  const normalizedDateRecord = params.selectedRecord?.dateRecord
    ? normalizeApiDateToLocalISO(params.selectedRecord.dateRecord)
    : fallbackNow;

  return {
    diagnosis: params.selectedRecord?.diagnosis || params.selectedRecord?.name || "",
    prescriptions: normalizePrescriptionItems(params.selectedRecord),
    note: params.selectedRecord?.note || undefined,
    dateRecord: normalizedDateRecord || fallbackNow,
    patientName: params.patientName,
    patientAge: params.patientAge,
    doctorName: params.doctorName,
  };
};

export const resolvePdfUrlFromResponse = (res: any): string | null => {
  return res?.data?.url || res?.url || res?.data?.pdfUrl || res?.pdfUrl || null;
};

export const buildPdfUrlFromPath = (pdfPath: string): string => {
  const baseUrl = window.location.origin.replace(":3000", ":3001");
  return `${baseUrl}/${pdfPath.replace(/\\/g, "/")}`;
};
