"use client";
import { GetPatientProfile } from "@/apis/user/user.api";
import Sidebar from "@/components/layout/side-bar";
import UserContent from "@/components/layout/user-content";
import Navbar from "@/components/navbar";
import { ResponseCode as rc } from "@/enum/response-code.enum";
import { SocketEventsEnum } from "@/enum/socket-events.enum";
import { createPatientProfileSocket } from "@/services/socket/socket-client";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ChatBubble = dynamic(() => import("@/components/chat/ChatBubble"), { ssr: false });

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
    <div className="min-h-screen bg-background">
      {/* Fixed Navbar at top */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <Navbar />
      </div>

      {/* Fixed Sidebar on the left below navbar */}
      <div className="fixed top-20 lg:top-28 left-0 z-30 h-[calc(100vh-5rem)] lg:h-[calc(100vh-7rem)] w-64 border-r border-border bg-[var(--sidebar)]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main content area with offsets for navbar + sidebar */}
      <main className="pt-24 pl-64">
        <div className="p-6">
          <UserContent user={user} activeTab={activeTab} />
        </div>
      </main>

      {/* Floating chat bubble for Patient */}
      <ChatBubble />
    </div>
  );
}
