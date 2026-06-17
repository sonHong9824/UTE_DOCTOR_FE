import {
  getAdminAppointmentLifecycle,
  getAdminAppointments,
  getAdminLifecycleNodeDetail,
} from "@/apis/admin/appointments.api";
import {
  AdminAppointmentQuery,
  AdminAppointmentsPageResult,
  LifecycleNodeDetail,
  LifecycleTree,
} from "@/features/admin-appointment-lifecycle/types/admin-appointment-lifecycle.types";

export const adminAppointmentLifecycleService = {
  async listAppointments(query: AdminAppointmentQuery): Promise<AdminAppointmentsPageResult> {
    const res = await getAdminAppointments(query);
    return {
      items: Array.isArray(res?.data?.items) ? res.data.items : [],
      page: Number(res?.data?.page) || query.page || 1,
      limit: Number(res?.data?.limit) || query.limit || 20,
      total: Number(res?.data?.total) || 0,
    };
  },

  async getLifecycle(appointmentId: string): Promise<LifecycleTree> {
    const res = await getAdminAppointmentLifecycle(appointmentId);
    return res.data;
  },

  async getNodeDetail(appointmentId: string, nodeId: string): Promise<LifecycleNodeDetail> {
    const res = await getAdminLifecycleNodeDetail(appointmentId, nodeId);
    return res.data;
  },
};
