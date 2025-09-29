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
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface MedicalRecordDisplayProps {
  medicalRecord: MedicalRecordDto;
}

export default function MedicalRecordDisplay({ medicalRecord }: MedicalRecordDisplayProps) {
  const record: MedicalRecordDto = {
    height: medicalRecord?.height || 0,
    weight: medicalRecord?.weight || 0,
    bloodType: medicalRecord?.bloodType || null,
    medicalHistory: medicalRecord?.medicalHistory || [],
    drugAllergies: medicalRecord?.drugAllergies || [],
    foodAllergies: medicalRecord?.foodAllergies || [],
    bloodPressure: medicalRecord?.bloodPressure || [],
    heartRate: medicalRecord?.heartRate || [],
  };

  const barChartData = {
    labels: ["Tiền sử bệnh", "Dị ứng thuốc", "Dị ứng thức ăn"],
    datasets: [
      { label: "Tiền sử bệnh", data: [record.medicalHistory.length, 0, 0], backgroundColor: "#3b82f6" },
      { label: "Dị ứng thuốc", data: [0, record.drugAllergies.length, 0], backgroundColor: "#f97316" },
      { label: "Dị ứng thức ăn", data: [0, 0, record.foodAllergies.length], backgroundColor: "#10b981" },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" as const }, title: { display: true, text: "Tổng quan hồ sơ y tế" } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  const bpChartData = {
    labels: record.bloodPressure.map(r => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Huyết áp tâm thu",
        data: record.bloodPressure.map(r => (typeof r.value === "object" ? r.value.systolic : 0)),
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.2,
      },
      {
        label: "Huyết áp tâm trương",
        data: record.bloodPressure.map(r => (typeof r.value === "object" ? r.value.diastolic : 0)),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.2,
      },
    ],
  };

  const hrChartData = {
    labels: record.heartRate.map(r => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Nhịp tim",
        data: record.heartRate.map(r => (typeof r.value === "number" ? r.value : 0)),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="flex flex-col space-y-6">
      <Card className="p-4 shadow-md border border-gray-200">
        {record.medicalHistory.length + record.drugAllergies.length + record.foodAllergies.length > 0 ? (
          <Bar data={barChartData} options={barChartOptions} />
        ) : (
          <p className="italic text-gray-500 text-center">Chưa có dữ liệu hồ sơ y tế</p>
        )}  
      </Card>

        <div className="flex flex-row">
            <Card className="p-4 shadow-md border border-gray-200 w-1/2">
                {record.bloodPressure.length > 0 ? <Line data={bpChartData} /> : <p className="italic text-gray-500 text-center">Chưa có dữ liệu huyết áp</p>}
            </Card>
            <Card className="p-4 shadow-md border border-gray-200 w-1/2">
                {record.heartRate.length > 0 ? <Line data={hrChartData} /> : <p className="italic text-gray-500 text-center">Chưa có dữ liệu nhịp tim</p>}
            </Card>
        </div>
    </div>
  );
}
