"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PatientHealthChartPoint } from "@/features/patient-health/types/patient-health.types";

interface HeartRateTrendChartProps {
  points: PatientHealthChartPoint[];
}

export function HeartRateTrendChart({ points }: HeartRateTrendChartProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-card">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-950 dark:text-white">Xu hướng nhịp tim</h2>
          <p className="mt-1 text-xs text-muted-foreground">Tối đa 5 lần đo gần nhất</p>
        </div>
        <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          bpm
        </span>
      </div>

      {points.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed text-sm text-muted-foreground">
          Chưa có dữ liệu nhịp tim
        </div>
      ) : (
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={points} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="heartRateLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
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
              <Line
                type="monotone"
                dataKey="heartRate"
                name="Nhịp tim"
                stroke="url(#heartRateLine)"
                strokeWidth={3}
                dot={{ r: 4, fill: "#f43f5e" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
