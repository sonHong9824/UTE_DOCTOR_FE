"use client";

import { Button } from "@/components/ui/button";
import { Minus, X } from "lucide-react";
import type { ReactNode } from "react";

interface FloatingAssistantPanelProps {
  title: string;
  subtitle: string;
  tabs?: ReactNode;
  children: ReactNode;
  onMinimize: () => void;
  onClose: () => void;
}

export default function FloatingAssistantPanel({
  title,
  subtitle,
  tabs,
  children,
  onMinimize,
  onClose,
}: FloatingAssistantPanelProps) {
  return (
    <section
      className="pointer-events-auto flex h-[min(72vh,640px)] max-h-[calc(100vh-7rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950"
      aria-label={title}
    >
      <header className="flex-none border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold text-slate-950 dark:text-white">{title}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onMinimize}
              className="h-8 w-8 rounded-full"
              aria-label="Minimize assistant"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {tabs ? <div className="mt-3">{tabs}</div> : null}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
