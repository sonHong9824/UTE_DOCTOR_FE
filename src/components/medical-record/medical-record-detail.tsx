"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalRecordDto } from "@/types/patientDTO/medical-record.dto";
import { useState } from "react";


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
  const record = {
    medicalHistory: medicalRecord?.medicalHistory || [],
    drugAllergies: medicalRecord?.drugAllergies || [],
    foodAllergies: medicalRecord?.foodAllergies || [],
    height: medicalRecord?.height || medicalRecord?.height || 0,
    weight: medicalRecord?.weight || medicalRecord?.weight || 0,
    bloodType: medicalRecord?.bloodType || null,
    bloodPressure: medicalRecord?.bloodPressure || [],
    heartRate: medicalRecord?.heartRate || [],
  } as any;

  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  return (
    <div className="flex flex-col max-h-[80vh] overflow-hidden rounded-lg">
      {/* Top summary: vitals */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 p-4 bg-transparent">
        <Card className="p-4">
          <CardContent>
            <div className="text-sm text-muted-foreground">Chiều cao</div>
            <div className="text-lg font-semibold">{record.height ? `${record.height} cm` : '-'}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent>
            <div className="text-sm text-muted-foreground">Cân nặng</div>
            <div className="text-lg font-semibold">{record.weight ? `${record.weight} kg` : '-'}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent>
            <div className="text-sm text-muted-foreground">Nhóm máu</div>
            <div className="text-lg font-semibold">{record.bloodType ?? '-'}</div>
          </CardContent>
        </Card>
        <Card className="p-4">
          <CardContent>
            <div className="text-sm text-muted-foreground">BPM / BP</div>
            <div className="text-lg font-semibold">
              {record.heartRate?.length ? `${record.heartRate[record.heartRate.length - 1].value} bpm` : '-'}
              {' • '}
              {record.bloodPressure?.length ? `${record.bloodPressure[record.bloodPressure.length - 1].value?.systolic ?? '-'} / ${record.bloodPressure[record.bloodPressure.length - 1].value?.diastolic ?? '-'}` : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="medicalHistory" className="flex-1 flex flex-col">
        {/* Sticky tabs header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b">
          <TabsList className="flex gap-3 px-4 py-3">
            <TabsTrigger value="medicalHistory" className="px-3 py-2 rounded">Tiền sử bệnh <Badge variant="gray" className="ml-2">{record.medicalHistory.length}</Badge></TabsTrigger>
            <TabsTrigger value="drugAllergies" className="px-3 py-2 rounded">Dị ứng thuốc <Badge variant="gray" className="ml-2">{record.drugAllergies.length}</Badge></TabsTrigger>
            <TabsTrigger value="foodAllergies" className="px-3 py-2 rounded">Dị ứng thức ăn <Badge variant="gray" className="ml-2">{record.foodAllergies.length}</Badge></TabsTrigger>
            <TabsTrigger value="bloodPressure" className="px-3 py-2 rounded">Huyết áp <Badge variant="gray" className="ml-2">{record.bloodPressure.length}</Badge></TabsTrigger>
            <TabsTrigger value="heartRate" className="px-3 py-2 rounded">Nhịp tim <Badge variant="gray" className="ml-2">{record.heartRate.length}</Badge></TabsTrigger>
          </TabsList>
        </div>

        {/* Scrollable tab content area */}
        <div className="overflow-auto px-6 py-4 flex-1">
          <TabsContent value="medicalHistory">
            <div className="max-h-[50vh] overflow-auto pr-2 pb-40">
              {record.medicalHistory.length === 0 ? (
                <p className="italic text-muted-foreground text-center py-8 text-lg">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-5">
                  {record.medicalHistory.map((r: any) => (
                    <Card key={r._id || r.dateRecord} className="p-6 rounded-lg shadow-sm">
                      <CardContent className="!p-0">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 pr-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-xl font-semibold leading-tight">{r.diagnosis || r.name || 'Chẩn đoán'}</div>
                                <div className="text-sm text-muted-foreground mt-1">{r.dateRecord ? new Date(r.dateRecord).toLocaleString('vi-VN') : '-'}</div>
                              </div>
                            </div>

                            {r.note && (
                              <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm text-gray-800 dark:text-gray-200">
                                {r.note}
                              </div>
                            )}

                          </div>

                          <div className="w-full md:w-48 flex-shrink-0 flex flex-col items-end gap-3">
                            <div className="w-full">
                              <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedRecord(r)}>Xem chi tiết</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="drugAllergies">
            {record.drugAllergies.length === 0 ? (
              <p className="italic text-muted-foreground text-center py-8 text-lg">Chưa có dữ liệu</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {record.drugAllergies.map((r: any) => (
                  <Card key={r._id || r.name} className="p-4">
                    <CardContent>
                      <div className="text-lg font-semibold">{r.name}</div>
                      <div className="text-sm text-muted-foreground">{r.dateRecord ? new Date(r.dateRecord).toLocaleDateString('vi-VN') : '-'}</div>
                      {r.description && <div className="mt-2 text-sm">{r.description}</div>}
                      {r.diagnosis && <div className="mt-2 text-xs text-muted-foreground">Ghi chú: {r.diagnosis}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="foodAllergies">
            {record.foodAllergies.length === 0 ? (
              <p className="italic text-muted-foreground text-center py-8 text-lg">Chưa có dữ liệu</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {record.foodAllergies.map((r: any) => (
                  <Card key={r._id || r.name} className="p-4">
                    <CardContent>
                      <div className="text-lg font-semibold">{r.name}</div>
                      <div className="text-sm text-muted-foreground">{r.dateRecord ? new Date(r.dateRecord).toLocaleDateString('vi-VN') : '-'}</div>
                      {r.description && <div className="mt-2 text-sm">{r.description}</div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bloodPressure">
            {record.bloodPressure.length === 0 ? (
              <p className="italic text-muted-foreground text-center py-8 text-lg">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {record.bloodPressure.map((r: any) => (
                  <Card key={r._id || r.dateRecord} className="p-4">
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{r.value?.systolic ?? '-'} / {r.value?.diastolic ?? '-'}</div>
                        <div className="text-sm text-muted-foreground">{r.dateRecord ? new Date(r.dateRecord).toLocaleString('vi-VN') : '-'}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="heartRate">
            {record.heartRate.length === 0 ? (
              <p className="italic text-muted-foreground text-center py-8 text-lg">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {record.heartRate.map((r: any) => (
                  <Card key={r._id || r.dateRecord} className="p-4">
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{r.value ?? '-' } bpm</div>
                        <div className="text-sm text-muted-foreground">{r.dateRecord ? new Date(r.dateRecord).toLocaleString('vi-VN') : '-'}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Modal for any selected record details (e.g., prescription detail) */}
      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        {selectedRecord && (
          <div className="space-y-3 text-base max-w-xl">
            <div className="text-lg font-semibold">{selectedRecord.diagnosis ?? selectedRecord.name ?? 'Chi tiết'}</div>
            {selectedRecord.dateRecord && <div className="text-sm text-muted-foreground">{new Date(selectedRecord.dateRecord).toLocaleString('vi-VN')}</div>}
            {selectedRecord.note && <div className="text-sm">{selectedRecord.note}</div>}
            {Array.isArray(selectedRecord.prescriptions) && selectedRecord.prescriptions.length > 0 && (
              <div className="mt-3">
                <div className="font-medium">Đơn thuốc</div>
                <div className="space-y-2 mt-2">
                  {selectedRecord.prescriptions.map((p: any, i: number) => (
                    p ? (
                      <div key={i} className="flex items-center justify-between border rounded p-2">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">Số lượng: {p.quantity}</div>
                        </div>
                        {/* <div className="text-xs text-muted-foreground">ID: {p.medicineId ?? '-'}</div> */}
                      </div>
                    ) : (
                      <div key={i} className="text-sm text-muted-foreground">(Không có thông tin thuốc)</div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
