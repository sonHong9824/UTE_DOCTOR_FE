import axiosClient from "@/lib/axiosClient";
import {DataResponse } from "@/types/apiDTO";

export interface Medicine {
  _id: string;
  name: string;
  packaging: string;
}

export const getMedicines = async (): Promise<DataResponse<Medicine[]>> => {
  try {
    const res = await axiosClient.get<DataResponse<Medicine[]>>("/medicines");
    return res.data;
  } catch (e) {
    console.error("Failed to fetch medicines:", e);
    throw e;
  }
};

export interface PrescriptionItemDto {
  medicineId?: string;
  name: string;
  quantity: number;
  note?: string;
}

export interface CreatePrescriptionPdfDto {
  diagnosis: string;
  prescriptions: PrescriptionItemDto[];
  note?: string;
  dateRecord: Date;
  patientName?: string;
  patientAge?: number;
  doctorName?: string;
}


export const generatePrescriptionPdf = async (
  id: string,
  data: CreatePrescriptionPdfDto
): Promise<DataResponse<{ url: string }>> => {
  try {
    const res = await axiosClient.post<DataResponse<{ url: string }>>(
      `/prescription/${id}/generate-pdf`,
      data
    );
    return res.data;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
};







