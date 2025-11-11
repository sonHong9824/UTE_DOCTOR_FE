// components/ui/tabs.tsx
"use client";

import { cn } from "@/lib/utils"; // hàm merge className (bạn có thể tự viết)
import { createContext, ReactNode, useContext, useState, useEffect } from "react";

interface TabsProps {
  children: ReactNode;
  defaultValue?: string;
  /** Controlled value */
  value?: string;
  /** Controlled change handler */
  onValueChange?: (value: string) => void;
  className?: string;
}

interface TabsContextType {
  active: string;
  setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export function Tabs({ children, defaultValue, value, onValueChange, className }: TabsProps) {
  const [active, setActive] = useState<string>(value ?? defaultValue ?? "");

  // if used as controlled component, update internal state when value changes
  useEffect(() => {
    if (typeof value !== "undefined" && value !== active) setActive(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setActiveAndNotify = (v: string) => {
    setActive(v);
    onValueChange?.(v);
  };

  return (
    <TabsContext.Provider value={{ active, setActive: setActiveAndNotify }}>
      <div className={cn("w-full", className)}>{children}</div>
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
  if (!ctx) throw new Error("TabsTrigger must be inside Tabs");

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
  if (!ctx) throw new Error("TabsContent must be inside Tabs");

  return ctx.active === value ? (
    <div className={cn("p-4 bg-card text-card-foreground", className)}>{children}</div>
  ) : null;
}
