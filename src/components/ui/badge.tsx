// components/ui/badge.tsx
export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-2 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 ${className || ""}`}>
    {children}
  </span>
);
