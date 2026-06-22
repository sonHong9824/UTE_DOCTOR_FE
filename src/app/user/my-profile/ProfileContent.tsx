"use client";

import Sidebar from "@/components/layout/side-bar";
import UserContent from "@/components/layout/user-content";
import Navbar from "@/components/navbar";
import { usePatientProfile } from "@/features/user-profile/hooks/usePatientProfile";
import { LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";

const ChatBubble = dynamic(() => import("@/components/chat/ChatBubble"), { ssr: false });

export default function ProfileContent() {
  // UI-only content: delegates data/side-effects to view-model hook.
  const { user, loading, activeTab, setActiveTab } = usePatientProfile();

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/70 dark:bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  if (!user)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/70 px-4 text-center dark:bg-background">
        <p className="text-muted-foreground">Không tìm thấy hồ sơ</p>
      </div>
    );

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
          <UserContent user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>

      <ChatBubble />
    </div>
  );
}
