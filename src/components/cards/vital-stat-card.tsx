import { Card } from "@/components/ui/card";
import { BloodType } from "@/enum/blood-type.enum";
import { FaCalculator, FaRulerVertical, FaTint, FaWeight } from "react-icons/fa";

interface VitalStatsCardProps {
  bloodType: BloodType | null;
  height: number | null;
  weight: number | null;
}

export default function VitalStatsCard({ bloodType, height, weight }: VitalStatsCardProps) {
  const bmi =
    weight && height ? (weight / ((height / 100) ** 2)).toFixed(1) : "-";

  const stats = [
    {
      label: "Nhóm máu",
      value: bloodType ?? "-",
      icon: <FaTint style={{ color: "var(--chart-1)" }} className="w-6 h-6" />,
    },
    {
      label: "Chiều cao (cm)",
      value: height ?? "-",
      icon: <FaRulerVertical style={{ color: "var(--chart-2)" }} className="w-6 h-6" />,
    },
    {
      label: "Cân nặng (kg)",
      value: weight ?? "-",
      icon: <FaWeight style={{ color: "var(--chart-3)" }} className="w-6 h-6" />,
    },
    {
      label: "BMI",
      value: bmi,
      icon: <FaCalculator style={{ color: "var(--chart-4)" }} className="w-6 h-6" />,
    },
  ];

  return (
    <Card
      className="p-4 rounded-xl shadow-lg w-full"
      style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)" }}
    >
      <h3 className="text-lg font-semibold mb-4 text-center">
        Thông số cơ bản
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center space-x-3 p-3 rounded-lg shadow-sm hover:shadow-md transition"
            style={{ backgroundColor: "var(--card)" }}
          >
            {stat.icon}
            <div>
              <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {stat.label}
              </p>
              <p className="font-semibold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
