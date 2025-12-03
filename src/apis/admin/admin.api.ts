import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export const getDoctorsAdmin = async (params: { 
  name?: string;
  specialtyId?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>("/doctors/admin", {
      params,
    });

    console.log("[Axios] Get doctors admin:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch doctors admin:", e);
  }
};

export const createDoctor = async (form: any) => {
  try {
    const res = await axiosClient.post<DataResponse<any>>("/doctors", form);

    console.log("[Axios] Create doctor:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to create doctor:", error);
    throw error;
  }
};



