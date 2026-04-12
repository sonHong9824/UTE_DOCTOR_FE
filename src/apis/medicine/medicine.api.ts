import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export interface Medicine {
  _id: string;
  name: string;
  packaging: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicineListResponse {
  data: Medicine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MedicineQuery {
  page?: number;
  limit?: number;
  keyword?: string;
  sort?: "asc" | "desc";
}

export const getMedicines = async (params: MedicineQuery = {}): Promise<MedicineListResponse> => {
  try {
    const { page = 1, limit = 10, keyword, sort = "asc" } = params;
    const res = await axiosClient.get<MedicineListResponse>("/medicines", {
      params: { page, limit, keyword, sort },
    });

    return res.data;
  } catch (e) {
    console.error("Failed to fetch medicines:", e);
    throw e;
  }
};

export const createMedicine = async (data: {
  name: string;
  packaging: string;
}) => {
  try {
    const res = await axiosClient.post("/medicines", data);
    return res.data;
  } catch (e) {
    console.error("Failed to create medicine:", e);
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

export const deleteMedicine = async (id: string) => {
  try {
    const res = await axiosClient.delete(`/medicines/${id}`);
    return res.data;
  } catch (e) {
    console.error("Failed to delete medicine:", e);
    throw e;
  }
};

export const updateMedicine = async (
  id: string,
  data: { name?: string; packaging?: string }
) => {
  try {
    const res = await axiosClient.put(`/medicines/${id}`, data);
    return res.data;
  } catch (e) {
    console.error("Failed to update medicine:", e);
    throw e;
  }
};












