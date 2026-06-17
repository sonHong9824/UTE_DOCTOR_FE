import type { VisitApiItem } from "@/apis/receptionist/receptionist.api";
import { VisitStatusEnum } from "@/enum/visit-status.enum";
import type { VisitItem } from "@/features/receptionist-visits/types/visit.types";
import { formatApiDateToLocalDateTime } from "@/utils/time.util";

export const normalizeVisitStatus = (status: string): VisitStatusEnum => {
  switch (status) {
    case VisitStatusEnum.CREATED:
    case VisitStatusEnum.CHECKED_IN:
    case VisitStatusEnum.IN_PROGRESS:
    case VisitStatusEnum.COMPLETED:
      return status as VisitStatusEnum;
    default:
      return VisitStatusEnum.CREATED;
  }
};

export const getVisitStatusLabel = (status: VisitStatusEnum) => {
  switch (status) {
    case VisitStatusEnum.CREATED:
      return "Chờ check-in";
    case VisitStatusEnum.CHECKED_IN:
      return "Đã check-in";
    case VisitStatusEnum.IN_PROGRESS:
      return "Đang khám";
    case VisitStatusEnum.COMPLETED:
      return "Hoàn thành";
    default:
      return status;
  }
};

export const getVisitStatusVariant = (status: VisitStatusEnum) => {
  switch (status) {
    case VisitStatusEnum.CREATED:
      return "gray" as const;
    case VisitStatusEnum.CHECKED_IN:
      return "blue" as const;
    case VisitStatusEnum.IN_PROGRESS:
      return "orange" as const;
    case VisitStatusEnum.COMPLETED:
      return "green" as const;
    default:
      return "secondary" as const;
  }
};

export const formatVisitSchedule = (epochMs: number) => {
  if (!epochMs) {
    return "--";
  }

  return formatApiDateToLocalDateTime(epochMs);
};

export const normalizeVisitItem = (item: VisitApiItem): VisitItem => {
  return {
    id: item.visitId,
    appointmentId: item.appointmentId,
    patientName: item.patientName,
    doctorName: item.doctorName,
    scheduledAt: item.scheduledAt,
    status: normalizeVisitStatus(item.status),
  };
};

export const normalizeVisitItems = (items: VisitApiItem[]) => {
  return [...items]
    .map(normalizeVisitItem)
    .sort((left, right) => left.scheduledAt - right.scheduledAt);
};
