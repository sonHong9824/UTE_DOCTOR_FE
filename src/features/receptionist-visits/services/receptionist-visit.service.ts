import {
  checkInVisit,
  createVisitVitalSign,
  getTodayVisits,
  type CreatePatientVitalSignRequestDto,
} from "@/apis/receptionist/receptionist.api";
import { markAppointmentNoShow } from "@/apis/appointment/appointment.api";
import { VisitStatusEnum } from "@/enum/visit-status.enum";
import { VisitCheckInResult, VisitItem } from "@/features/receptionist-visits/types/visit.types";
import type { VitalSignRecord } from "@/features/receptionist-visits/types/vital-sign.types";
import { normalizeVisitItems } from "@/features/receptionist-visits/utils/visit.utils";

export const receptionistVisitService = {
  async getTodayVisits(): Promise<VisitItem[]> {
    const res = await getTodayVisits();
    return normalizeVisitItems(res?.data ?? []);
  },

  async checkInVisit(visitId: string): Promise<VisitCheckInResult> {
    const res = await checkInVisit(visitId);
    const data = res?.data;

    return {
      visitId: data?.visitId || visitId,
      status: (data?.status as VisitStatusEnum) || VisitStatusEnum.CHECKED_IN,
    };
  },

  async markNoShow(appointmentId: string) {
    const res = await markAppointmentNoShow(appointmentId);
    return res.data;
  },

  async recordVitalSign(
    visitId: string,
    payload: CreatePatientVitalSignRequestDto
  ): Promise<VitalSignRecord> {
    const res = await createVisitVitalSign(visitId, payload);
    const vitalSign = res?.data?.vitalSign;

    if (!vitalSign) {
      throw new Error("Phản hồi ghi nhận chỉ số không hợp lệ.");
    }

    return vitalSign;
  },
};
