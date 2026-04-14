"use client";

import { ResponseCode as rc } from "@/enum/response-code.enum";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { getPatientProfile } from "@/features/user-profile/services/user-profile.api";
import { getStoredEmail, getStoredPatientId } from "@/features/user-profile/utils/user-storage";
import { createPatientProfileSocket } from "@/services/socket/socket-client";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// View-model hook: fetches and subscribes to patient profile updates.
export const usePatientProfile = () => {
  const [user, setUser] = useState<PatientProfileDto | null>(null);
  const [activeTab, setActiveTab] = useState<string>("general-health");
  const [loading, setLoading] = useState(true);

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
    setActiveTab,
    patientId: getStoredPatientId(),
    email: getStoredEmail(),
  };
};
