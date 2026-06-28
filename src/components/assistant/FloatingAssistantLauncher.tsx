"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Sparkles } from "lucide-react";

interface FloatingAssistantLauncherProps {
  open: boolean;
  label: string;
  hasMedicalAi: boolean;
  onClick: () => void;
}

export default function FloatingAssistantLauncher({
  open,
  label,
  hasMedicalAi,
  onClick,
}: FloatingAssistantLauncherProps) {
  const Icon = hasMedicalAi ? Sparkles : MessageCircle;

  return (
    <Button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-label={open ? "Close assistant" : "Open assistant"}
      className={cn(
        "pointer-events-auto h-12 rounded-full px-4 shadow-[0_16px_40px_rgba(15,23,42,0.24)]",
        "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100",
        "border border-white/20"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden text-sm font-semibold sm:inline">{label}</span>
    </Button>
  );
}
