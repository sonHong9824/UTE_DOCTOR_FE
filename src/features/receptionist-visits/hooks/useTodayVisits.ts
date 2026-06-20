"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { VisitStatusEnum } from "@/enum/visit-status.enum";
import { receptionistVisitService } from "@/features/receptionist-visits/services/receptionist-visit.service";
import { VisitFilter, VisitItem } from "@/features/receptionist-visits/types/visit.types";
import { getMarkNoShowErrorMessage } from "@/features/appointment/utils/mark-no-show-error";

const getErrorMessage = (error: any) => {
  return error?.response?.data?.message || error?.message || "Không thể tải danh sách lượt khám.";
};

export const useTodayVisits = () => {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingInVisitId, setCheckingInVisitId] = useState<string | null>(null);
  const [markingNoShowAppointmentId, setMarkingNoShowAppointmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<VisitFilter>("all");

  const loadVisits = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const items = await receptionistVisitService.getTodayVisits();
      setVisits(items);
      setError(null);
    } catch (error: any) {
      const message = getErrorMessage(error);
      setError(message);
      if (!showRefreshing) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadVisits(false);
  }, [loadVisits]);

  const refresh = useCallback(() => {
    void loadVisits(true);
  }, [loadVisits]);

  const checkInVisit = useCallback(async (visitId: string) => {
    if (checkingInVisitId) {
      return;
    }
    
    console.log("Checking in visit:", visitId);

    const snapshot = visits;
    setCheckingInVisitId(visitId);
    setVisits((current) =>
      current.map((visit) =>
        visit.id === visitId ? { ...visit, status: VisitStatusEnum.CHECKED_IN } : visit
      )
    );

    try {
      const result = await receptionistVisitService.checkInVisit(visitId);

      if (result.status !== VisitStatusEnum.CHECKED_IN) {
        throw new Error("Check-in không thành công.");
      }

      toast.success("Check-in lượt khám thành công.");
    } catch (error: any) {
      setVisits(snapshot);
      toast.error(getErrorMessage(error));
    } finally {
      setCheckingInVisitId(null);
    }
  }, [checkingInVisitId, visits]);

  const markNoShow = useCallback(async (appointmentId: string) => {
    if (markingNoShowAppointmentId) return;

    setMarkingNoShowAppointmentId(appointmentId);
    try {
      const result = await receptionistVisitService.markNoShow(appointmentId);
      setVisits((current) =>
        current.map((visit) =>
          visit.appointmentId === appointmentId
            ? {
                ...visit,
                status: VisitStatusEnum.NO_SHOW,
                appointmentStatus: "NO_SHOW",
              }
            : visit
        )
      );
      toast.success(
        result?.alreadyNoShow
          ? "Lịch khám đã được ghi nhận không đến khám trước đó."
          : "Đã đánh dấu bệnh nhân không đến khám."
      );
      void loadVisits(true);
    } catch (error: unknown) {
      toast.error(getMarkNoShowErrorMessage(error));
    } finally {
      setMarkingNoShowAppointmentId(null);
    }
  }, [loadVisits, markingNoShowAppointmentId]);

  const filteredVisits = useMemo(() => {
    if (filter === "waiting") {
      return visits.filter((visit) => visit.status === VisitStatusEnum.CREATED);
    }

    if (filter === "checked-in") {
      return visits.filter((visit) => visit.status === VisitStatusEnum.CHECKED_IN);
    }

    if (filter === "no-show") {
      return visits.filter((visit) => visit.status === VisitStatusEnum.NO_SHOW);
    }

    return visits;
  }, [filter, visits]);

  const counts = useMemo(() => {
    return {
      total: visits.length,
      waiting: visits.filter((visit) => visit.status === VisitStatusEnum.CREATED).length,
      checkedIn: visits.filter((visit) => visit.status === VisitStatusEnum.CHECKED_IN).length,
      noShow: visits.filter((visit) => visit.status === VisitStatusEnum.NO_SHOW).length,
    };
  }, [visits]);

  return {
    visits: filteredVisits,
    loading,
    refreshing,
    checkingInVisitId,
    markingNoShowAppointmentId,
    error,
    filter,
    setFilter,
    refresh,
    checkInVisit,
    markNoShow,
    counts,
  };
};
