import { checkInVisit, getTodayVisits } from "@/apis/receptionist/receptionist.api";
import { VisitStatusEnum } from "@/enum/visit-status.enum";
import { VisitCheckInResult, VisitItem } from "@/features/receptionist-visits/types/visit.types";
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
};