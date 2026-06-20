"use client";

import { getAppointments } from "@/apis/appointment/appointment.api";
import { useEffect, useState } from "react";

// Lightweight read-only hook for the medical-detail CTA preview: fetches just a
// handful of the newest appointments. Reuses the existing getAppointments
// endpoint/signature — no new query params.
export const useRecentAppointments = (limit: number = 2) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getAppointments(1, limit);
        if (!mounted) return;
        setAppointments(res?.data?.data || []);
        setTotal(res?.data?.total || 0);
      } catch (err) {
        console.error("Failed to load recent appointments", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [limit]);

  return { appointments, total, loading };
};
