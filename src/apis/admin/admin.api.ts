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

export const updateAccountStatus = async (
  accountId: string,
  status: string
) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>(
      `/users/${accountId}/status`,
      { status }
    );

    console.log("[Axios] Update account status:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to update account status:", error);
    throw error;
  }
};




