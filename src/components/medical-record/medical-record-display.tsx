import { Card } from "@/components/ui/card";
import { MedicalRecordDto } from "@/types/userDTO/medical-record.dto";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import VitalStatsCard from "../cards/vital-stat-card";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface MedicalRecordDisplayProps {
  medicalRecord: MedicalRecordDto;
}

export default function MedicalRecordDisplay({ medicalRecord }: MedicalRecordDisplayProps) {
  const record: MedicalRecordDto = {
    height: medicalRecord?.height || 0,
    weight: medicalRecord?.weight || 0,
    bloodType: medicalRecord?.bloodType,
    medicalHistory: medicalRecord?.medicalHistory || [],
    drugAllergies: medicalRecord?.drugAllergies || [],
    foodAllergies: medicalRecord?.foodAllergies || [],
    bloodPressure: medicalRecord?.bloodPressure || [],
    heartRate: medicalRecord?.heartRate || [],
  };

  // Lấy màu từ CSS variables để hỗ trợ dark/light mode
  const rootStyle = getComputedStyle(document.documentElement);
  const chartColors = {
    systolic: rootStyle.getPropertyValue("--chart-5").trim() || "#ef4444",
    diastolic: rootStyle.getPropertyValue("--chart-2").trim() || "#3b82f6",
    hr: rootStyle.getPropertyValue("--chart-1").trim() || "#10b981",
    text: rootStyle.getPropertyValue("--card-foreground").trim() || "#1f2937",
    muted: rootStyle.getPropertyValue("--muted-foreground").trim() || "#6b7280",
    cardBg: rootStyle.getPropertyValue("--card").trim() || "#ffffff",
  };

  // Chart dữ liệu tổng quan hồ sơ y tế
  const barChartData = useMemo(() => ({
    labels: ["Tiền sử bệnh", "Dị ứng thuốc", "Dị ứng thức ăn"],
    datasets: [
      { label: "Tiền sử bệnh", data: [record.medicalHistory.length, 0, 0], backgroundColor: chartColors.systolic },
      { label: "Dị ứng thuốc", data: [0, record.drugAllergies.length, 0], backgroundColor: chartColors.diastolic },
      { label: "Dị ứng thức ăn", data: [0, 0, record.foodAllergies.length], backgroundColor: chartColors.hr },
    ],
  }), [record.medicalHistory.length, record.drugAllergies.length, record.foodAllergies.length, chartColors]);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: { labels: { color: chartColors.text } },
      title: { display: true, text: "Tổng quan hồ sơ y tế", color: chartColors.text },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1, color: chartColors.text } },
      x: { ticks: { color: chartColors.text } },
    },
  }), [chartColors]);

  // Chart huyết áp
  const bpChartData = useMemo(() => ({
    labels: record.bloodPressure.map(r => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Huyết áp tâm thu",
        data: record.bloodPressure.map(r => (typeof r.value === "object" ? r.value.systolic : null)),
        borderColor: chartColors.systolic,
        backgroundColor: chartColors.systolic,
        tension: 0.3,
      },
      {
        label: "Huyết áp tâm trương",
        data: record.bloodPressure.map(r => (typeof r.value === "object" ? r.value.diastolic : null)),
        borderColor: chartColors.diastolic,
        backgroundColor: chartColors.diastolic,
        tension: 0.3,
      },
    ],
  }), [record.bloodPressure, chartColors]);

  const bpChartOptions = useMemo(() => ({
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 200,
        ticks: { stepSize: 10, color: chartColors.text, font: { size: 12 } },
      },
      x: { ticks: { color: chartColors.text, font: { size: 10 } } },
    },
    plugins: {
      legend: { labels: { color: chartColors.text, font: { size: 12 } } },
    },
  }), [chartColors]);

  // Chart nhịp tim
  const hrChartData = useMemo(() => ({
    labels: record.heartRate.map(r => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Nhịp tim (BPM)",
        data: record.heartRate.map(r => (typeof r.value === "number" ? r.value : 0)),
        borderColor: chartColors.hr,
        backgroundColor: chartColors.hr,
        tension: 0.3,
      },
    ],
  }), [record.heartRate, chartColors]);

  const hrChartOptions = useMemo(() => ({
    scales: {
      y: {
        beginAtZero: false,
        suggestedMin: 50,
        suggestedMax: 200,
        ticks: { stepSize: 5, color: chartColors.text },
      },
      x: { ticks: { color: chartColors.text } },
    },
    plugins: { legend: { labels: { color: chartColors.text, font: { size: 12 } } } },
  }), [chartColors]);

  return (
    <div className="flex flex-col space-y-6">
      <VitalStatsCard bloodType={record.bloodType} height={record.height} weight={record.weight} />
      <div className="flex flex-row justify-between gap-4">
        <Card className="p-4 shadow-md border w-[48%]" style={{ backgroundColor: chartColors.cardBg, color: chartColors.text }}>
          {record.bloodPressure.length > 0 ? <Line data={bpChartData} options={bpChartOptions} /> : <p className="italic text-muted text-center" style={{ color: chartColors.muted }}>Chưa có dữ liệu huyết áp</p>}
        </Card>
        <Card className="p-4 shadow-md border w-[48%]" style={{ backgroundColor: chartColors.cardBg, color: chartColors.text }}>
          {record.heartRate.length > 0 ? <Line data={hrChartData} options={hrChartOptions} /> : <p className="italic text-muted text-center" style={{ color: chartColors.muted }}>Chưa có dữ liệu nhịp tim</p>}
        </Card>
      </div>
      <Card className="p-4 shadow-md border" style={{ backgroundColor: chartColors.cardBg, color: chartColors.text }}>
        {record.medicalHistory.length + record.drugAllergies.length + record.foodAllergies.length > 0 ? (
          <Bar data={barChartData} options={barChartOptions} />
        ) : (
          <p className="italic text-muted text-center" style={{ color: chartColors.muted }}>Chưa có dữ liệu hồ sơ y tế</p>
        )}
      </Card>
    </div>
  );
}
