"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { VisitStatusEnum } from "@/enum/visit-status.enum";
import { receptionistVisitService } from "@/features/receptionist-visits/services/receptionist-visit.service";
import { VisitFilter, VisitItem } from "@/features/receptionist-visits/types/visit.types";

const getErrorMessage = (error: any) => {
  return error?.response?.data?.message || error?.message || "Không thể tải danh sách lượt khám.";
};

export const useTodayVisits = () => {
  const [visits, setVisits] = useState<VisitItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingInVisitId, setCheckingInVisitId] = useState<string | null>(null);
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

  const filteredVisits = useMemo(() => {
    if (filter === "waiting") {
      return visits.filter((visit) => visit.status === VisitStatusEnum.CREATED);
    }

    if (filter === "checked-in") {
      return visits.filter((visit) => visit.status === VisitStatusEnum.CHECKED_IN);
    }

    return visits;
  }, [filter, visits]);

  const counts = useMemo(() => {
    return {
      total: visits.length,
      waiting: visits.filter((visit) => visit.status === VisitStatusEnum.CREATED).length,
      checkedIn: visits.filter((visit) => visit.status === VisitStatusEnum.CHECKED_IN).length,
    };
  }, [visits]);

  return {
    visits: filteredVisits,
    loading,
    refreshing,
    checkingInVisitId,
    error,
    filter,
    setFilter,
    refresh,
    checkInVisit,
    counts,
  };
};