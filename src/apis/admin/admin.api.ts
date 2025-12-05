import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export const getDoctorsAdmin = async (params: { 
  name?: string;
  specialtyId?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    // map frontend `specialtyId` to backend `chuyenKhoaId` for compatibility
    const mappedParams: any = { ...(params || {}) };
    if (mappedParams.specialtyId && !mappedParams.chuyenKhoaId) {
      mappedParams.chuyenKhoaId = mappedParams.specialtyId;
      delete mappedParams.specialtyId;
    }

    const res = await axiosClient.get<DataResponse<any>>("/doctors/admin", {
      params: mappedParams,
    });

    console.log("[Axios] Get doctors admin:", res.data);
    return res.data;
  } catch (e) {
    // Log detailed axios response if available to help debugging
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e;
      if (err?.response) {
        console.error("Failed to fetch doctors admin - response:", err.response.status, err.response.data);
      } else if (err?.request) {
        console.error("Failed to fetch doctors admin - no response:", err.request);
      } else {
        console.error("Failed to fetch doctors admin - error:", err.message || err);
      }
    } catch (logErr) {
      console.error("Error logging fetch doctors admin error", logErr);
    }
    // Rethrow so callers can inspect the error (status code, message)
    throw e;
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

export const updateDoctor = async (id: string, form: any) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>(`/doctors/${id}`, form);
    console.log('[Axios] Update doctor:', res.data);
    return res.data;
  } catch (error) {
    console.error('Failed to update doctor:', error);
    throw error;
  }
};

export const getActiveDoctors = async (params: {
  page?: number;
  limit?: number;
  chuyenKhoaId?: string;
}) => {
  try {
    const response = await axiosClient.get("/doctors/active", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bác sĩ:", error);
    throw error;
  }
};







