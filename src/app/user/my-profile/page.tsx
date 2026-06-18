"use client";

import Sidebar from "@/components/layout/side-bar";
import UserContent from "@/components/layout/user-content";
import Navbar from "@/components/navbar";
import { usePatientProfile } from "@/features/user-profile/hooks/usePatientProfile";
import dynamic from "next/dynamic";

const ChatBubble = dynamic(() => import("@/components/chat/ChatBubble"), { ssr: false });

export default function ProfilePage() {
  // UI-only page: delegates data/side-effects to view-model hook.
  const { user, loading, activeTab, setActiveTab } = usePatientProfile();

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (!user) return <p className="text-center mt-8">Không tìm thấy hồ sơ</p>;

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-background">
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <Navbar />
      </div>

      <div className="fixed bottom-0 left-0 top-28 z-30 hidden w-64 lg:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={user.accountProfileDto}
        />
      </div>

      <div className="pt-20 lg:hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} compact />
      </div>

      <main className="min-w-0 pt-4 lg:pl-64 lg:pt-28">
        <div className="w-full min-w-0 px-3 pb-8 sm:px-5 lg:px-6">
          <UserContent user={user} activeTab={activeTab} />
        </div>
      </main>

      <ChatBubble />
    </div>
  );
}
