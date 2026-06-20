"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface ProfileTabShellProps {
  // Distinct key per active tab so a swap triggers exit/enter animation.
  tabKey: string;
  children: ReactNode;
}

// Shared shell that gives every profile tab the same fade/slide transition,
// so switching tabs feels consistent across the whole settings area.
export default function ProfileTabShell({ tabKey, children }: ProfileTabShellProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full min-w-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
