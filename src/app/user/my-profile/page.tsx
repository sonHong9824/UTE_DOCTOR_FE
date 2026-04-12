"use client";

import Sidebar from "@/components/layout/side-bar";
import UserContent from "@/components/layout/user-content";
import Navbar from "@/components/navbar";
import { usePatientProfile } from "@/features/user-profile/hooks/usePatientProfile";
import dynamic from "next/dynamic";

const ChatBubble = dynamic(() => import("@/components/chat/ChatBubble"), { ssr: false });

export default function ProfilePage() {
  // UI-only page: delegates data/side-effects to view-model hook.
  const { user, loading, activeTab, setActiveTab, patientId, email } = usePatientProfile();

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (!user) return <p className="text-center mt-8">Không tìm thấy hồ sơ</p>;

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
          <UserContent user={user} activeTab={activeTab} patientId={patientId} email={email} />
        </div>
      </main>

      {/* Floating chat bubble for Patient */}
      <ChatBubble />
    </div>
  );
}
