"use client";

import MedicalAssistantWidget from "@/components/assistant/MedicalAssistantWidget";
import FloatingAssistantLauncher from "@/components/assistant/FloatingAssistantLauncher";
import FloatingAssistantPanel from "@/components/assistant/FloatingAssistantPanel";
import FloatingAssistantTabs from "@/components/assistant/FloatingAssistantTabs";
import {
  type AssistantFeature,
  getAssistantFeaturesForRole,
} from "@/components/assistant/assistantRoleConfig";
import ChatBubble from "@/components/chat/ChatBubble";
import {
  getCurrentAuthIdentity,
  type AuthIdentity,
} from "@/features/auth/utils/auth-identity";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const FEATURE_COPY: Record<
  AssistantFeature,
  { title: string; subtitle: string }
> = {
  chat: {
    title: "Assistant",
    subtitle: "Chat with care team members",
  },
  "medical-ai": {
    title: "Assistant",
    subtitle: "Medical AI, booking guide, and availability",
  },
};

const readIdentity = () => getCurrentAuthIdentity();

export default function FloatingAssistant() {
  const [identity, setIdentity] = useState<AuthIdentity | null>(null);
  const [open, setOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<AssistantFeature>("chat");

  useEffect(() => {
    const refreshIdentity = () => setIdentity(readIdentity());

    refreshIdentity();

    window.addEventListener("user-logged-in", refreshIdentity);
    window.addEventListener("user-logged-out", refreshIdentity);
    window.addEventListener("token-refreshed", refreshIdentity);
    window.addEventListener("storage", refreshIdentity);

    return () => {
      window.removeEventListener("user-logged-in", refreshIdentity);
      window.removeEventListener("user-logged-out", refreshIdentity);
      window.removeEventListener("token-refreshed", refreshIdentity);
      window.removeEventListener("storage", refreshIdentity);
    };
  }, []);

  const features = useMemo(
    () => getAssistantFeaturesForRole(identity?.role),
    [identity?.role],
  );

  useEffect(() => {
    if (features.length === 0) {
      setOpen(false);
      return;
    }

    if (!features.includes(activeFeature)) {
      setActiveFeature(features[0]);
    }
  }, [activeFeature, features]);

  if (!identity || features.length === 0) {
    return null;
  }

  const hasMedicalAi = features.includes("medical-ai");
  const featureCopy = FEATURE_COPY[activeFeature];
  const currentUser = {
    accountId: identity.id,
    email: identity.email,
    role: identity.role,
  };

  const openChat = () => {
    setActiveFeature("chat");
    setOpen(true);
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-[430px] flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <motion.div
        initial={false}
        animate={
          open
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 16, scale: 0.98 }
        }
        transition={{ duration: 0.18, ease: "easeOut" }}
        aria-hidden={!open}
        className={cn("w-full", !open && "invisible pointer-events-none")}
      >
        <FloatingAssistantPanel
          title={featureCopy.title}
          subtitle={featureCopy.subtitle}
          tabs={
            features.length > 1 ? (
              <FloatingAssistantTabs
                features={features}
                activeFeature={activeFeature}
                onChange={setActiveFeature}
              />
            ) : undefined
          }
          onMinimize={() => setOpen(false)}
          onClose={() => setOpen(false)}
        >
          <div className="h-full min-h-0">
            <div
              className={cn(
                "h-full min-h-0",
                activeFeature === "chat" ? "block" : "hidden",
              )}
            >
              <ChatBubble
                active={open && activeFeature === "chat"}
                currentUser={currentUser}
                onOpenRequest={openChat}
              />
            </div>
            {hasMedicalAi ? (
              <div
                className={cn(
                  "h-full min-h-0",
                  activeFeature === "medical-ai" ? "block" : "hidden",
                )}
              >
                <MedicalAssistantWidget
                  active={open && activeFeature === "medical-ai"}
                />
              </div>
            ) : null}
          </div>
        </FloatingAssistantPanel>
      </motion.div>

      <FloatingAssistantLauncher
        open={open}
        label="Assistant"
        hasMedicalAi={hasMedicalAi}
        onClick={() => setOpen((prev) => !prev)}
      />
    </div>
  );
}
