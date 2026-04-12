import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export const getAppointmentsAdmin = async (params: { 
  page?: number;
  limit?: number;
  appointmentStatus?: string;
  doctorId?: string;
  patientId?: string;
  keyword?: string;
}) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>(
      "/appointment/admin",
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          appointmentStatus: params.appointmentStatus || undefined,
          doctorId: params.doctorId || undefined,
          patientId: params.patientId || undefined,
          keyword: params.keyword || undefined,
        },
      }
    );

    console.log("[Axios] Get appointments admin:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch appointments admin:", e);
    throw e;
  }
};


export const updateAppointmentStatus = async (id: string, status: string) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>(`/appointments/${id}/status`, {
      status,
    });
    console.log("[Axios] Update appointment status:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to update appointment status:", e);
    throw e;
  }
};

export const cancelAppointment = async (id: string, reason?: string) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>(`/appointments/${id}/cancel`, {
      reason,
    });
    console.log("[Axios] Cancel appointment:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to cancel appointment:", e);
    throw e;
  }
};

export const confirmAppointment = async (id: string) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>(
      `/appointment/${id}/confirm`
    );

    console.log("[Axios] Confirm appointment:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to confirm appointment:", e);
    throw e;
  }
};
