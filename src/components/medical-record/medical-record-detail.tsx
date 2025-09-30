"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalRecordDto } from "@/types/userDTO/medical-record.dto";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";


// Custom TabsTrigger styled
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

  // State cho modal
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  return (
    <>
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
              <div className="grid md:grid-cols-2 gap-4">
                {record[section.key].map((r, idx) => (
                  <Card
                    key={idx}
                    className={`p-5 border-l-4 ${section.color} bg-card rounded-lg shadow-sm`}
                  >
                    <p className="text-lg font-semibold">{r.name || "Chưa có"}</p>
                    <p className="text-sm text-gray-500">
                      {r.dateRecord
                        ? new Date(r.dateRecord).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </p>
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                    >
                      Xem chi tiết
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal hiển thị chi tiết */}
      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        {selectedRecord && (
          <div className="space-y-3 text-lg">
            <p>
              <span className="font-semibold">Tên:</span> {selectedRecord.name || "Chưa có"}
            </p>
            <p>
              <span className="font-semibold">Mô tả:</span> {selectedRecord.description || "Chưa có"}
            </p>
            <p>
              <span className="font-semibold">Ngày ghi nhận:</span>{" "}
              {selectedRecord.dateRecord
                ? new Date(selectedRecord.dateRecord).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
