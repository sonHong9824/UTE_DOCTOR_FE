"use client";

import { Card } from "@/components/ui/card";
import { RadialBar, RadialBarChart } from "recharts";

interface HealthRankCardProps {
  rankPercent: number; // vd: 82 nghĩa là bạn khỏe hơn 82% thế giới
}

export default function HealthRankCard({ rankPercent }: HealthRankCardProps) {
  const data = [
    {
      name: "Sức khỏe",
      value: rankPercent,
      fill: "var(--chart-1)", // dùng màu trong theme
    },
  ];

  return (
    <Card
      className="p-4 rounded-xl shadow-lg flex flex-col items-center justify-center h-full"
      style={{ backgroundColor: "var(--card)", color: "var(--card-foreground)" }}
    >
      <h3 className="text-lg font-semibold">Xếp hạng sức khỏe 🌍</h3>
      <RadialBarChart
        width={220}
        height={220}
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={20}
        data={data}
      >
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
        />
      </RadialBarChart>

      <p className="text-sm text-muted-foreground text-center mt-[-1rem]">
        Bạn đang ở{" "}
        <span className="font-semibold text-primary">Top {rankPercent}%</span>{" "}
        khỏe nhất thế giới
      </p>
    </Card>
  );
}
