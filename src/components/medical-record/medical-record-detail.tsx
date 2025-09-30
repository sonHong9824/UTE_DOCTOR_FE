"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalRecordDto } from "@/types/userDTO/medical-record.dto";

// Custom TabsTrigger styled theo theme
function ThemedTabsTrigger({ children, value }: { children: React.ReactNode; value: string }) {
  return (
    <TabsTrigger
      value={value}
      className="px-6 py-3 text-lg font-semibold text-muted-foreground
                 data-[state=active]:text-primary 
                 data-[state=active]:border-b-2 
                 data-[state=active]:border-primary
                 transition-colors"
    >
      {children}
    </TabsTrigger>
  );
}

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
    heartRate: [],
  };

  const sections = [
    { key: "medicalHistory", label: "Tiền sử bệnh", color: "border-blue-400" },
    { key: "drugAllergies", label: "Dị ứng thuốc", color: "border-orange-400" },
    { key: "foodAllergies", label: "Dị ứng thức ăn", color: "border-green-400" },
  ] as const;

  return (
      <Tabs defaultValue="medicalHistory">
        {/* Tab headers */}
        <div className="mb-6 border-b border-border">
          <TabsList className="flex gap-3">
            {sections.map((section) => (
              <ThemedTabsTrigger key={section.key} value={section.key}>
                {section.label}
                <Badge variant="gray" className="text-base px-3 py-1">
                  {record[section.key].length}
                </Badge>
              </ThemedTabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab content */}
        {sections.map((section) => (
          <TabsContent key={section.key} value={section.key}>
            {record[section.key].length === 0 ? (
              <p className="italic text-muted-foreground text-center py-8 text-lg">
                Chưa có dữ liệu
              </p>
            ) : (
              <div className="space-y-5">
                {record[section.key].map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-5 border-l-4 ${section.color} bg-card rounded-lg shadow-sm hover:shadow-md transition`}
                  >
                    <p className="text-lg">
                      <span className="font-semibold">Tên:</span> {r.name || "Chưa có"}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">Mô tả:</span> {r.description || "Chưa có"}
                    </p>
                    <p className="text-lg">
                      <span className="font-semibold">Ngày ghi nhận:</span>{" "}
                      {r.dateRecord
                        ? new Date(r.dateRecord).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
  );
}
