interface BadgeProps {
  children: React.ReactNode;
  variant?: "blue" | "green" | "orange" | "red" | "gray" | "secondary";
  className?: string;
}

export const Badge = ({ children, variant = "gray", className }: BadgeProps) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    orange: "bg-orange-100 text-orange-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-200 text-gray-800",
    secondary: "bg-gray-100 text-gray-600", // thêm style cho secondary
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-sm font-semibold ${colors[variant]} ${className || ""}`}
    >
      {children}
    </span>
  );
};
