export type MedicalRecordDetailRecord = {
  _id?: string;
  appointmentId?: string;
  apptId?: string;
  patient?: {
    name?: string;
    age?: number;
  };
  diagnosis?: string;
  name?: string;
  note?: string;
  dateRecord?: string;
  prescriptions?: Array<{
    medicineId?: string;
    _id?: string;
    name?: string;
    title?: string;
    quantity?: number;
    qty?: number;
    note?: string;
  }>;
};

export type MedicalRecordDetailPdfContext = {
  selectedRecord?: MedicalRecordDetailRecord | null;
  user?: any;
  medicalRecord?: any;
};

export type MedicalRecordPdfState = {
  pdfUrl: string | null;
  pdfLoading: boolean;
  pdfError: unknown;
};
