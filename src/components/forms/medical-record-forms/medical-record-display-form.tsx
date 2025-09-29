import { MedicalRecordDto, VitalSignRecord } from "@/types/userDTO/medical-record.dto";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface MedicalRecordDisplayProps {
  medicalRecord: MedicalRecordDto;
}

export default function MedicalRecordDisplay({ medicalRecord }: MedicalRecordDisplayProps) {
  // đảm bảo luôn có object và array
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
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Tổng quan hồ sơ y tế' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, // => bước nhảy của Y là 1
        },
      },
    },
  };

  const barChartData = {
    labels: ["Tiền sử bệnh", "Dị ứng thuốc", "Dị ứng thức ăn"],
    datasets: [
      {
        label: "Tiền sử bệnh",
        data: [record.medicalHistory.length, 0, 0],
        backgroundColor: "#3b82f6",
      },
      {
        label: "Dị ứng thuốc",
        data: [0, record.drugAllergies.length, 0],
        backgroundColor: "#f97316",
      },
      {
        label: "Dị ứng thức ăn",
        data: [0, 0, record.foodAllergies.length],
        backgroundColor: "#10b981",
      },
    ],
  };


  // Biểu đồ line huyết áp
  const bpChartData = {
    labels: record.bloodPressure.map((r) => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Huyết áp tâm thu (Systolic)",
        data: record.bloodPressure.map((r) => (typeof r.value === "object" ? r.value.systolic : 0)),
        borderColor: "#ef4444",
        backgroundColor: "#ef4444",
        tension: 0.2,
      },
      {
        label: "Huyết áp tâm trương (Diastolic)",
        data: record.bloodPressure.map((r) => (typeof r.value === "object" ? r.value.diastolic : 0)),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.2,
      },
    ],
  };

  // Biểu đồ line nhịp tim
  const hrChartData = {
    labels: record.heartRate.map((r) => new Date(r.dateRecord).toLocaleDateString("vi-VN")),
    datasets: [
      {
        label: "Nhịp tim (BPM)",
        data: record.heartRate.map((r) => (typeof r.value === "number" ? r.value : 0)),
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="flex flex-col space-y-6 w-full">
      {/* Biểu đồ huyết áp */}
      <div className="flex flex-row justify-between pb-1">
            <Card className="p-4 shadow-md border border-gray-200 w-[48%]">
              <h3 className="text-xl font-semibold mb-4">Huyết áp theo thời gian</h3>
              {record.bloodPressure.length > 0 ? (
                <Line data={bpChartData} />
              ) : (
                <p className="italic text-gray-500 text-center">Chưa có dữ liệu huyết áp</p>
              )}
            </Card>

            {/* Biểu đồ nhịp tim */}
            <Card className="p-4 shadow-md border border-gray-200 w-[48%]">
              <h3 className="text-xl font-semibold mb-4">Nhịp tim theo thời gian</h3>
              {record.heartRate.length > 0 ? (
                <Line data={hrChartData} />
              ) : (
                <p className="italic text-gray-500 text-center">Chưa có dữ liệu nhịp tim</p>
              )}
            </Card>
      </div>
      {/* Biểu đồ tổng quan */}
      <Card className="p-4 shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Tổng quan hồ sơ y tế</h3>
        {record.medicalHistory.length + record.drugAllergies.length + record.foodAllergies.length > 0 ? (
          <Bar data={barChartData} options={barChartOptions}/>
        ) : (
          <p className="italic text-gray-500 text-center">Chưa có dữ liệu hồ sơ y tế</p>
        )}
      </Card>
    </div>
  );
}
