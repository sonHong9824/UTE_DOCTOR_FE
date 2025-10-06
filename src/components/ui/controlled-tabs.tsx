"use client";

import { cn } from "@/lib/utils";
import { createContext, ReactNode, useContext, useState } from "react";

interface ControlledTabsProps {
  children: ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface TabsContextType {
  active: string;
  setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function ControlledTabs({ children, defaultValue, value, onValueChange }: ControlledTabsProps) {
  const [internalActive, setInternalActive] = useState(defaultValue || "");
  const active = value !== undefined ? value : internalActive;
  
  const setActive = (newValue: string) => {
    if (value === undefined) {
      setInternalActive(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex space-x-2 border-b border-border", className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be inside ControlledTabs");

  const isActive = ctx.active === value;

  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
        isActive
          ? "text-primary border-b-2 border-primary bg-card"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
      onClick={() => ctx.setActive(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be inside ControlledTabs");

  return ctx.active === value ? (
    <div className={cn("p-4 bg-card text-card-foreground", className)}>{children}</div>
  ) : null;
}
