import {
  createReceptionist,
  getReceptionists,
} from "@/apis/admin/admin.api";
import type {
  AdminCreateReceptionistPayload,
  AdminReceptionistListQuery,
} from "@/types/admin-staff.dto";

export const adminReceptionistService = {
  create(payload: AdminCreateReceptionistPayload) {
    return createReceptionist(payload);
  },
  list(query: AdminReceptionistListQuery) {
    return getReceptionists(query);
  },
};
