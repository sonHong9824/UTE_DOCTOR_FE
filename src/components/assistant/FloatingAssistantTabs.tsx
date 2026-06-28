"use client";

import type { AssistantFeature } from "@/components/assistant/assistantRoleConfig";
import { cn } from "@/lib/utils";
import { MessageCircle, Sparkles } from "lucide-react";

const FEATURE_LABELS: Record<AssistantFeature, string> = {
  chat: "Chat",
  "medical-ai": "Medical AI",
};

const FEATURE_ICONS = {
  chat: MessageCircle,
  "medical-ai": Sparkles,
};

interface FloatingAssistantTabsProps {
  features: AssistantFeature[];
  activeFeature: AssistantFeature;
  onChange: (feature: AssistantFeature) => void;
}

export default function FloatingAssistantTabs({
  features,
  activeFeature,
  onChange,
}: FloatingAssistantTabsProps) {
  if (features.length < 2) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
      {features.map((feature) => {
        const Icon = FEATURE_ICONS[feature];
        const selected = activeFeature === feature;

        return (
          <button
            key={feature}
            type="button"
            onClick={() => onChange(feature)}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition",
              selected
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {FEATURE_LABELS[feature]}
          </button>
        );
      })}
    </div>
  );
}
