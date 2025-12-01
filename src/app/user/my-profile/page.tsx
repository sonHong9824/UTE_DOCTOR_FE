"use client";
import { GetPatientProfile } from "@/apis/user/user.api";
import Sidebar from "@/components/layout/side-bar";
import UserContent from "@/components/layout/user-content";
import Navbar from "@/components/navbar";
import { ResponseCode as rc } from "@/enum/response-code.enum";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { createPatientProfileSocket, socketClient } from "@/services/socket/socket-client";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<PatientProfileDto | null>(null);
  const [activeTab, setActiveTab] = useState<string>("general-health");

  useEffect(() => {
    const email = localStorage.getItem("email") || "";
    if (!email) return;

  
    const fetchUserProfile = async () => {
      try {
        const response = await GetPatientProfile({ email });
        // if (response?.code === rc.SUCCESS) setUser(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const patientProfileSocket = createPatientProfileSocket(); // Use the existing socketClient for patient profile
    
    patientProfileSocket.once(SocketEventsEnum.ROOM_JOINED, (data) => {
      console.log("✅ Room joined confirmed, now calling API");
      fetchUserProfile(); // Bây giờ mới call API
    });

    // Listen patient profile
    patientProfileSocket.on(SocketEventsEnum.PATIENT_PROFILE, (data: any) => {
        console.log("Patient profile received:", data);
        if (data.code === rc.SUCCESS) setUser(data.data);
    });

    patientProfileSocket.emitSafe(SocketEventsEnum.JOIN_ROOM, { email }); // Join room first
    console.log("Emitted join room for email:", email);
  //   return () => {
  //   socketClient.disconnect();
  // };
  }, []);

  if (!user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex mt-8">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <UserContent user={user} activeTab={activeTab} />
      </div>
    </div>
  );
}
