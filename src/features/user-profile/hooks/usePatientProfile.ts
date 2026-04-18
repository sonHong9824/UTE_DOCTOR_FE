"use client";

import { ResponseCode as rc } from "@/enum/response-code.enum";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { getPatientProfile } from "@/features/user-profile/services/user-profile.api";
import { getStoredEmail, getStoredPatientId } from "@/features/user-profile/utils/user-storage";
import { createPatientProfileSocket } from "@/services/socket/socket-client";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const USER_PROFILE_TABS = [
  "general-health",
  "personal-info",
  "password",
  "medical-detail",
  "appointments",
  "notifications",
  "wallet",
] as const;

// View-model hook: fetches and subscribes to patient profile updates.
export const usePatientProfile = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<PatientProfileDto | null>(null);
  const [activeTab, setActiveTab] = useState<string>("general-health");
  const [loading, setLoading] = useState(true);

  const queryTab = searchParams.get("tab");
  const initialTab = useMemo(() => {
    if (queryTab && USER_PROFILE_TABS.includes(queryTab as (typeof USER_PROFILE_TABS)[number])) {
      return queryTab;
    }

    return "general-health";
  }, [queryTab]);

  useEffect(() => {
    if (activeTab !== initialTab) {
      setActiveTab(initialTab);
    }
  }, [activeTab, initialTab]);

  const handleSetActiveTab = useCallback(
    (tab: string) => {
      if (!USER_PROFILE_TABS.includes(tab as (typeof USER_PROFILE_TABS)[number])) {
        return;
      }

      setActiveTab(tab);
      router.replace(`${pathname}?tab=${tab}`, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    const email = getStoredEmail();
    if (!email) {
      setLoading(false);
      return;
    }

    const patientProfileSocket = createPatientProfileSocket();

    const fetchUserProfile = async () => {
      try {
        const response = await getPatientProfile();
        if (response?.code === rc.SUCCESS) {
          setUser(response.data);
        }
      } catch (err) {
        toast.error("Can not fetch patient profile");
      } finally {
        setLoading(false);
      }
    };

    patientProfileSocket.once(SocketEventsEnum.ROOM_JOINED, () => {
      fetchUserProfile();
    });

    patientProfileSocket.on(SocketEventsEnum.PATIENT_PROFILE, (data: any) => {
      if (data?.code === rc.SUCCESS) {
        setUser(data.data);
      }
    });

    patientProfileSocket.emitSafe(SocketEventsEnum.JOIN_ROOM, { email });

    return () => {
      patientProfileSocket.disconnect();
    };
  }, []);

  return {
    user,
    loading,
    activeTab,
    setActiveTab: handleSetActiveTab,
    patientId: getStoredPatientId(),
    email: getStoredEmail(),
  };
};
