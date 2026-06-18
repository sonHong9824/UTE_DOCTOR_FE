"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PatientHealthChartPoint } from "@/features/patient-health/types/patient-health.types";

interface BloodPressureTrendChartProps {
  points: PatientHealthChartPoint[];
}

export function BloodPressureTrendChart({ points }: BloodPressureTrendChartProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">Xu hướng huyết áp</h2>
          <p className="mt-1 text-xs text-muted-foreground">Tối đa 5 lần đo có đủ hai chỉ số</p>
        </div>
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-200">
          mmHg
        </span>
      </div>

      {points.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
          Chưa có dữ liệu huyết áp
        </div>
      ) : (
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  borderColor: "var(--border)",
                  background: "var(--card)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              <Line
                type="monotone"
                dataKey="systolic"
                name="Tâm thu"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2563eb" }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                name="Tâm trương"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#14b8a6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
