import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MedicalRecordDto } from "@/types/userDTO/medical-record.dto";

interface MedicalRecordDetailProps {
  medicalRecord: MedicalRecordDto;
}

export default function MedicalRecordDetail({ medicalRecord }: MedicalRecordDetailProps) {
  const record: MedicalRecordDto = {
      medicalHistory: medicalRecord?.medicalHistory || [],
      drugAllergies: medicalRecord?.drugAllergies || [],
      foodAllergies: medicalRecord?.foodAllergies || [],
      height: 0,
      weight: 0,
      bloodType: null,
      bloodPressure: [],
      heartRate: []
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-[95%] mx-auto">
  {(["medicalHistory", "drugAllergies", "foodAllergies"] as const).map(section => (
    <div
      key={section}
      className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-200"
    >
      <h4 className="text-lg font-semibold mb-3 flex items-center justify-between">
        {section === "medicalHistory" ? "Tiền sử bệnh" : section === "drugAllergies" ? "Dị ứng thuốc" : "Dị ứng thức ăn"}
        <Badge className="ml-2">{record[section].length}</Badge>
      </h4>

      {record[section].length === 0 ? (
        <p className="italic text-gray-500">Chưa có dữ liệu</p>
      ) : (
        <div className="space-y-4">
          {record[section].map((r, index) => (
            <div key={index} className="p-4 border-l-4 border-blue-400 bg-gray-50 rounded-lg">
              <p><span className="font-semibold">Tên:</span> {r.name || "Chưa có"}</p>
              <p><span className="font-semibold">Mô tả:</span> {r.description || "Chưa có"}</p>
              <p><span className="font-semibold">Ngày ghi nhận:</span> {r.dateRecord ? new Date(r.dateRecord).toLocaleDateString("vi-VN") : "Chưa có"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  ))}
</div>

  );
}
