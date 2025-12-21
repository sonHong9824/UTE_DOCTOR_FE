import { Card } from "@/components/ui/card";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
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
import { Line } from "react-chartjs-2";
import HealthRankCard from "../cards/health-rank-card";
import VitalStatsCard from "../cards/vital-stat-card";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface MedicalRecordDisplayProps {
  user: PatientProfileDto;
}

export default function MedicalRecordDisplay({ user }: MedicalRecordDisplayProps) {
  // Prioritize new medicalProfile over legacy medicalRecord
  const height = user.medicalProfile?.height || user.medicalRecord?.height || 0;
  const weight = user.medicalProfile?.weight || user.medicalRecord?.weight || 0;
  const bloodType = user.medicalProfile?.bloodType || user.medicalRecord?.bloodType;

  // Legacy fields (will be empty after refactor unless migrated)
  const bloodPressure = user.medicalRecord?.bloodPressure || [];
  const heartRate = user.medicalRecord?.heartRate || [];

  console.log("Received user profile with new collections:", user)

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

  // Chart huyết áp
  const bpChartData = useMemo(() => ({
    labels: bloodPressure.map(r => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Huyết áp tâm thu",
        data: bloodPressure.map(r => (typeof r.value === "object" ? r.value.systolic : null)),
        borderColor: chartColors.systolic,
        backgroundColor: chartColors.systolic,
        tension: 0.3,
      },
      {
        label: "Huyết áp tâm trương",
        data: bloodPressure.map(r => (typeof r.value === "object" ? r.value.diastolic : null)),
        borderColor: chartColors.diastolic,
        backgroundColor: chartColors.diastolic,
        tension: 0.3,
      },
    ],
  }), [bloodPressure, chartColors]);

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
    labels: heartRate.map(r => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Nhịp tim (BPM)",
        data: heartRate.map(r => (typeof r.value === "number" ? r.value : 0)),
        borderColor: chartColors.hr,
        backgroundColor: chartColors.hr,
        tension: 0.3,
      },
    ],
  }), [heartRate, chartColors]);

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

  const bmi =
    weight && height
      ? Number((weight / ((height / 100) ** 2)).toFixed(1))
      : 0;
  function calculateHealthRank(): number {
    if (bmi < 18.5) return 40; // hơi thấp
    if (bmi < 25) return 90;   // lý tưởng
    if (bmi < 30) return 70;   // thừa cân
    return 50;                 // béo phì
  }


  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-10 gap-4 items-stretch">
      <div className="col-span-7">
        <VitalStatsCard
          bloodType={bloodType}
          height={height}
          weight={weight}
          bmi={bmi}
        />
      </div>
      <div className="col-span-3">
        <HealthRankCard rankPercent={calculateHealthRank()}/>
      </div>
    </div>


      <div className="flex flex-row justify-between gap-4">
        <Card className="p-4 shadow-md border w-[49%]" style={{ backgroundColor: chartColors.cardBg, color: chartColors.text }}>
          {bloodPressure.length > 0 ? <Line data={bpChartData} options={bpChartOptions} /> : <p className="italic text-muted text-center" style={{ color: chartColors.muted }}>Chưa có dữ liệu huyết áp</p>}
        </Card>
        <Card className="p-4 shadow-md border w-[49%]" style={{ backgroundColor: chartColors.cardBg, color: chartColors.text }}>
          {heartRate.length > 0 ? <Line data={hrChartData} options={hrChartOptions} /> : <p className="italic text-muted text-center" style={{ color: chartColors.muted }}>Chưa có dữ liệu nhịp tim</p>}
        </Card>
      </div>
    </div>
  );
}
