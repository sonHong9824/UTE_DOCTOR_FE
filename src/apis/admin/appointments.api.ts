import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import {
  AdminAppointmentQuery,
  AdminAppointmentsPageResult,
  LifecycleNodeDetail,
  LifecycleTree,
} from "@/features/admin-appointment-lifecycle/types/admin-appointment-lifecycle.types";

type LegacyAdminAppointmentQuery = {
  page?: number;
  limit?: number;
  appointmentStatus?: string;
  doctorId?: string;
  patientId?: string;
  keyword?: string;
};

export const getAppointmentsAdmin = async (params: LegacyAdminAppointmentQuery) => {
  try {
    const res = await axiosClient.get<DataResponse<unknown>>(
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
    const res = await axiosClient.patch<DataResponse<unknown>>(`/appointments/${id}/status`, {
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
    const res = await axiosClient.patch<DataResponse<unknown>>("/appointment/cancel", {
      appointmentId: id,
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    });
    console.log("[Axios] Cancel appointment:", res.data);
    if (res.data?.code && res.data.code !== "SUCCESS") {
      throw { response: { data: res.data } };
    }
    return res.data;
  } catch (e) {
    console.error("Failed to cancel appointment:", e);
    throw e;
  }
};

export const confirmAppointment = async (id: string) => {
  try {
    const res = await axiosClient.patch<DataResponse<unknown>>(
      `/appointment/${id}/confirm`
    );

    console.log("[Axios] Confirm appointment:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to confirm appointment:", e);
    throw e;
  }
};

export const getAdminAppointments = async (query: AdminAppointmentQuery = {}) => {
  const res = await axiosClient.get<DataResponse<AdminAppointmentsPageResult>>(
    "/admin/appointments",
    {
      params: {
        page: query.page || 1,
        limit: query.limit || 20,
        sort: query.sort || undefined,
        status: query.status || undefined,
        paymentCategory: query.paymentCategory || undefined,
        assignmentStatus: query.assignmentStatus || undefined,
        depositStatus: query.depositStatus || undefined,
        doctorId: query.doctorId || undefined,
        patientEmail: query.patientEmail || undefined,
        dateFrom: query.dateFrom || undefined,
        dateTo: query.dateTo || undefined,
      },
    }
  );

  return res.data;
};

export const getAdminAppointmentLifecycle = async (appointmentId: string) => {
  const res = await axiosClient.get<DataResponse<LifecycleTree>>(
    `/admin/appointments/${appointmentId}/lifecycle`
  );

  return res.data;
};

export const getAdminLifecycleNodeDetail = async (appointmentId: string, nodeId: string) => {
  const res = await axiosClient.get<DataResponse<LifecycleNodeDetail>>(
    `/admin/appointments/${appointmentId}/lifecycle/nodes/${encodeURIComponent(nodeId)}`
  );

  return res.data;
};
