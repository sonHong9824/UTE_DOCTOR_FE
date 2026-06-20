"use client";

import { createAllergyRecord, createMedicalHistoryRecord, upsertMedicalProfile } from "@/apis/patient/patient.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import AppointmentHistoryCtaCard from "@/features/appointment-history/components/AppointmentHistoryCtaCard";
import { useRecentAppointments } from "@/features/appointment-history/hooks/useRecentAppointments";
import HealthOverviewCards from "@/features/medical-record/components/HealthOverviewCards";
import MedicalCategoryNav, { type MedicalCategory } from "@/features/medical-record/components/MedicalCategoryNav";
import MedicalIndicatorPanels from "@/features/medical-record/components/MedicalIndicatorPanels";
import SectionHeader from "@/features/medical-record/components/SectionHeader";
import { useMedicalRecordDetailPdf } from "@/features/medical-record/hooks/useMedicalRecordDetailPdf";
import { MedicalRecordDto } from "@/types/patientDTO/medical-record.dto";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import { Activity, ClipboardList, Gauge, HeartPulse, Pencil, Pill, Stethoscope, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QRCode from 'react-qr-code';
import { toast } from "sonner";

interface MedicalRecordDetailProps {
  user?: PatientProfileDto;
  medicalRecord?: MedicalRecordDto;
  // UI-only navigation to another profile tab (e.g. the appointment-history tab).
  onNavigateToTab?: (tab: string) => void;
}

export default function MedicalRecordDetail({ user, medicalRecord, onNavigateToTab }: MedicalRecordDetailProps) {
  const router = useRouter();
  
  // Prioritize new collections from user prop, fallback to legacy medicalRecord
  const sourceRecord = user?.medicalRecord || medicalRecord;
  
  const vitalsFromEncounters = (user?.encounters || []).flatMap((e: any) =>
    (e?.vitalSigns || []).map((v: any) => ({ ...v, appointmentId: e.appointmentId, encDate: e.dateRecord || v.dateRecord }))
  );

  const record = {
    medicalHistory: user?.medicalHistory || sourceRecord?.medicalHistory || [],
    drugAllergies: user?.allergies?.filter((a: any) => a.type === 'DRUG') || sourceRecord?.drugAllergies || [],
    foodAllergies: user?.allergies?.filter((a: any) => a.type === 'FOOD') || sourceRecord?.foodAllergies || [],
    height: user?.medicalProfile?.height || sourceRecord?.height || 0,
    weight: user?.medicalProfile?.weight || sourceRecord?.weight || 0,
    bloodType: user?.medicalProfile?.bloodType || sourceRecord?.bloodType || null,
    bloodPressure: (sourceRecord?.bloodPressure || []).concat(
      vitalsFromEncounters
        .filter((v: any) => v.type === 'BP' && v.bloodPressure)
        .map((v: any) => ({
          value: v.bloodPressure,
          dateRecord: v.dateRecord || v.encDate,
          _id: v._id || `${v.appointmentId}-bp`,
        }))
    ),
    heartRate: (sourceRecord?.heartRate || []).concat(
      vitalsFromEncounters
        .filter((v: any) => v.type === 'HR' && v.value !== undefined)
        .map((v: any) => ({
          value: v.value,
          dateRecord: v.dateRecord || v.encDate,
          _id: v._id || `${v.appointmentId}-hr`,
        }))
    ),
    encounters: user?.encounters || [],
  } as any;
  
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const { pdfUrl, pdfLoading, pdfError } = useMedicalRecordDetailPdf({ selectedRecord, user, medicalRecord });
  const pdfErrorText = pdfError instanceof Error ? pdfError.message : pdfError ? String(pdfError) : null;

  // Recent appointments power the read-only preview in the history CTA card.
  const { appointments: recentAppointments, loading: recentLoading } = useRecentAppointments(2);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileOverride, setProfileOverride] = useState<{ height?: number; weight?: number; bloodType?: string } | null>(null);
  const [allergiesOverride, setAllergiesOverride] = useState<any[] | null>(null);
  const [historyOverride, setHistoryOverride] = useState<any[] | null>(null);
  const [profileForm, setProfileForm] = useState<{ height: string; weight: string; bloodType: string }>(() => ({
    height: (user?.medicalProfile?.height || sourceRecord?.height || '').toString(),
    weight: (user?.medicalProfile?.weight || sourceRecord?.weight || '').toString(),
    bloodType: user?.medicalProfile?.bloodType || sourceRecord?.bloodType || '',
  }));
  const [newAllergy, setNewAllergy] = useState({ type: 'DRUG', substance: '', reaction: '', severity: '' });
  const [newHistory, setNewHistory] = useState({ conditionName: '', diagnosisCode: '', diagnosedAt: '', status: 'ONGOING' });

  const openEditModal = () => {
    setProfileForm({
      height: (user?.medicalProfile?.height || sourceRecord?.height || '').toString(),
      weight: (user?.medicalProfile?.weight || sourceRecord?.weight || '').toString(),
      bloodType: user?.medicalProfile?.bloodType || sourceRecord?.bloodType || '',
    });
    setNewAllergy({ type: 'DRUG', substance: '', reaction: '', severity: '' });
    setNewHistory({ conditionName: '', diagnosisCode: '', diagnosedAt: '', status: 'ONGOING' });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const patientId = localStorage.getItem('patientId') || null;
      if (!patientId) {
        toast.error('Không tìm thấy bệnh nhân');
        return;
      }
      const payload = {
        height: profileForm.height ? Number(profileForm.height) : undefined,
        weight: profileForm.weight ? Number(profileForm.weight) : undefined,
        bloodType: profileForm.bloodType || undefined,
        createdByRole: typeof window !== 'undefined' ? localStorage.getItem('role') || undefined : undefined,
        createdByAccountId: typeof window !== 'undefined' ? localStorage.getItem('accountId') || undefined : undefined,
      };
      await upsertMedicalProfile(patientId, payload);
      toast.success('Cập nhật hồ sơ y tế thành công');
      setEditModalOpen(false);
      // simplest: refresh view to reflect changes
      try { router.refresh(); } catch {}
    } catch (err: any) {
      console.error('Save profile failed', err);
      toast.error(String(err?.response?.data?.message ?? err?.message ?? 'Lỗi khi cập nhật hồ sơ'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.substance) {
      toast.error('Vui lòng nhập chất gây dị ứng');
      return;
    }
    try {
      setSaving(true);
      const patientId = localStorage.getItem('patientId') || null;
      if (!patientId) {
        toast.error('Không tìm thấy bệnh nhân');
        return;
      }
      const payload: any = {
        ...newAllergy,
        reportedBy: typeof window !== 'undefined' ? (localStorage.getItem('role') === 'DOCTOR' ? 'DOCTOR' : 'PATIENT') : 'PATIENT',
        createdByRole: typeof window !== 'undefined' ? localStorage.getItem('role') || undefined : undefined,
        createdByAccountId: typeof window !== 'undefined' ? localStorage.getItem('accountId') || undefined : undefined,
      };
      await createAllergyRecord(patientId, payload);
      toast.success('Thêm dị ứng thành công');
      setNewAllergy({ type: 'DRUG', substance: '', reaction: '', severity: '' });
      try { router.refresh(); } catch {}
    } catch (err: any) {
      console.error('Add allergy failed', err);
      toast.error(String(err?.response?.data?.message ?? err?.message ?? 'Lỗi khi thêm dị ứng'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddHistory = async () => {
    if (!newHistory.conditionName) {
      toast.error('Vui lòng nhập tên bệnh');
      return;
    }
    try {
      setSaving(true);
      const patientId = localStorage.getItem('patientId') || null;
      if (!patientId) {
        toast.error('Không tìm thấy bệnh nhân');
        return;
      }
      const payload: any = {
        ...newHistory,
        diagnosedAt: newHistory.diagnosedAt || undefined,
        source: typeof window !== 'undefined' ? (localStorage.getItem('role') === 'DOCTOR' ? 'DOCTOR' : 'PATIENT') : 'PATIENT',
        createdByRole: typeof window !== 'undefined' ? localStorage.getItem('role') || undefined : undefined,
        createdByAccountId: typeof window !== 'undefined' ? localStorage.getItem('accountId') || undefined : undefined,
      };
      await createMedicalHistoryRecord(patientId, payload);
      toast.success('Thêm tiền sử bệnh thành công');
      setNewHistory({ conditionName: '', diagnosisCode: '', diagnosedAt: '', status: 'ONGOING' });
      try { router.refresh(); } catch {}
    } catch (err: any) {
      console.error('Add medical history failed', err);
      toast.error(String(err?.response?.data?.message ?? err?.message ?? 'Lỗi khi thêm tiền sử bệnh'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const patientId = localStorage.getItem('patientId') || null;
      if (!patientId) {
        toast.error('Không tìm thấy bệnh nhân');
        return;
      }

      // Save medical profile
      const profilePayload = {
        height: profileForm.height ? Number(profileForm.height) : undefined,
        weight: profileForm.weight ? Number(profileForm.weight) : undefined,
        bloodType: profileForm.bloodType || undefined,
        createdByRole: typeof window !== 'undefined' ? localStorage.getItem('role') || undefined : undefined,
        createdByAccountId: typeof window !== 'undefined' ? localStorage.getItem('accountId') || undefined : undefined,
      };
      await upsertMedicalProfile(patientId, profilePayload);

      // Add allergy if filled
      if (newAllergy.substance) {
        const allergyPayload: any = {
          ...newAllergy,
          reportedBy: typeof window !== 'undefined' ? (localStorage.getItem('role') === 'DOCTOR' ? 'DOCTOR' : 'PATIENT') : 'PATIENT',
          createdByRole: typeof window !== 'undefined' ? localStorage.getItem('role') || undefined : undefined,
          createdByAccountId: typeof window !== 'undefined' ? localStorage.getItem('accountId') || undefined : undefined,
        };
        await createAllergyRecord(patientId, allergyPayload);
      }

      // Add history if filled
      if (newHistory.conditionName) {
        const historyPayload: any = {
          ...newHistory,
          diagnosedAt: newHistory.diagnosedAt || undefined,
          source: typeof window !== 'undefined' ? (localStorage.getItem('role') === 'DOCTOR' ? 'DOCTOR' : 'PATIENT') : 'PATIENT',
          createdByRole: typeof window !== 'undefined' ? localStorage.getItem('role') || undefined : undefined,
          createdByAccountId: typeof window !== 'undefined' ? localStorage.getItem('accountId') || undefined : undefined,
        };
        await createMedicalHistoryRecord(patientId, historyPayload);
      }

      toast.success('Đã lưu tất cả thay đổi');
      setEditModalOpen(false);
      try { router.refresh(); } catch {}
    } catch (err: any) {
      console.error('Save all failed', err);
      toast.error(String(err?.response?.data?.message ?? err?.message ?? 'Lỗi khi lưu thay đổi'));
    } finally {
      setSaving(false);
    }
  };

  const [activeCategory, setActiveCategory] = useState("medicalHistory");

  const categories: MedicalCategory[] = [
    { value: "medicalHistory", label: "Tiền sử bệnh", count: record.medicalHistory.length, icon: ClipboardList },
    { value: "drugAllergies", label: "Dị ứng thuốc", count: record.drugAllergies.length, icon: Pill },
    { value: "foodAllergies", label: "Dị ứng thức ăn", count: record.foodAllergies.length, icon: Utensils },
    { value: "encounters", label: "Lượt khám", count: record.encounters.length, icon: Stethoscope },
    { value: "bloodPressure", label: "Huyết áp", count: record.bloodPressure.length, icon: Gauge },
    { value: "heartRate", label: "Nhịp tim", count: record.heartRate.length, icon: HeartPulse },
  ];
  return (
    <div className="space-y-6">
      {/* Section 1: Health overview */}
      <section className="space-y-4">
        <SectionHeader
          icon={Activity}
          title="Tổng quan sức khỏe"
          description="Các chỉ số sức khỏe cơ bản của bạn"
          accentClass="from-sky-500 to-blue-600"
          action={
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 rounded-lg"
              onClick={openEditModal}
            >
              <Pencil className="h-4 w-4" />
              Cập nhật hồ sơ
            </Button>
          }
        />
        <HealthOverviewCards
          height={record.height || null}
          weight={record.weight || null}
          bloodType={record.bloodType}
          heartRate={
            record.heartRate?.length
              ? record.heartRate[record.heartRate.length - 1].value
              : null
          }
          bloodPressure={
            record.bloodPressure?.length
              ? record.bloodPressure[record.bloodPressure.length - 1].value
              : null
          }
        />
      </section>

      {/* Section 2: Medical records & indicators */}
      <section className="space-y-4">
        <SectionHeader
          icon={ClipboardList}
          title="Hồ sơ & chỉ số y tế"
          description="Tiền sử bệnh, dị ứng, lượt khám và chỉ số sinh tồn"
          accentClass="from-cyan-500 to-sky-600"
        />
        <MedicalCategoryNav
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
        <MedicalIndicatorPanels
          active={activeCategory}
          record={record}
          onSelectRecord={setSelectedRecord}
        />
      </section>

      {/* Appointment history shortcut */}
      <AppointmentHistoryCtaCard
        recentAppointments={recentAppointments}
        loading={recentLoading}
        onOpen={() => onNavigateToTab?.("appointment-history")}
      />

      {/* Modal for any selected record details (e.g., prescription detail) */}
      <Modal open={!!selectedRecord} onClose={() => {
        console.log('[Modal] Closing modal, clearing selectedRecord');
        setSelectedRecord(null);
      }}>
        {selectedRecord && (() => {
          console.log('[Modal Render] Rendering modal content with pdfUrl:', pdfUrl, 'pdfLoading:', pdfLoading);
          const isHistory = !!(selectedRecord.conditionName || selectedRecord.diagnosisCode || selectedRecord.status || selectedRecord.source);
          const title = selectedRecord.conditionName || selectedRecord.diagnosis || selectedRecord.name || 'Chi tiết';
          const dateStr = (selectedRecord.diagnosedAt || selectedRecord.dateRecord) ? new Date(selectedRecord.diagnosedAt || selectedRecord.dateRecord).toLocaleString('vi-VN') : null;
          return (
            <div className="space-y-3 text-base max-w-xl">
              <div className="text-lg font-semibold">{title}</div>
              {dateStr && <div className="text-sm text-muted-foreground">{dateStr}</div>}

              {isHistory ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Trạng thái</div>
                      <div className="font-medium">{selectedRecord.status || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Mã ICD</div>
                      <div className="font-medium">{selectedRecord.diagnosisCode || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Nguồn</div>
                      <div className="font-medium">{selectedRecord.source || selectedRecord.reportedBy || '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Xác thực bác sĩ</div>
                      <div className="font-medium">{selectedRecord.verifiedByDoctor ? 'Đã xác thực' : 'Chưa xác thực'}</div>
                    </div>
                  </div>
                  {selectedRecord.note && <div className="text-sm">{selectedRecord.note}</div>}
                </div>
              ) : (
                <>
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
                            </div>
                          ) : (
                            <div key={i} className="text-sm text-muted-foreground">(Không có thông tin thuốc)</div>
                          )
                        ))}
                      </div>
                      {typeof window !== 'undefined' && localStorage.getItem('role') === 'PATIENT' && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedRecord(null);
                                onNavigateToTab?.("appointment-history");
                              }}
                            >
                              Xem trong Lịch sử khám
                            </Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={() => {
                                console.log('[PDF Button] Current pdfUrl:', pdfUrl);
                                if (pdfUrl) {
                                  console.log('[PDF Button] Opening URL:', pdfUrl);
                                  window.open(pdfUrl, "_blank");
                                } else if (pdfLoading) {
                                  console.debug('[PDF Button] Still loading...');
                                  toast.info('Đang tạo PDF, vui lòng đợi...');
                                } else {
                                  console.error('[PDF Button] No URL available');
                                  toast.error('Không có URL PDF. Vui lòng thử lại.');
                                }
                              }}
                              disabled={pdfLoading || !pdfUrl}
                              className={!pdfUrl && !pdfLoading ? 'opacity-50' : ''}
                            >
                              {pdfLoading ? 'Đang tạo PDF...' : pdfUrl ? 'Xem đơn thuốc' : 'PDF chưa sẵn sàng'}
                            </Button>
                            {pdfUrl && (
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-white rounded shadow-sm">
                                  <QRCode value={pdfUrl} size={64} />
                                </div>
                                <div className="text-xs text-green-600">✓ PDF sẵn sàng</div>
                              </div>
                            )}
                            {pdfLoading && <div className="text-xs text-blue-600 animate-pulse">⏳ Đang tạo...</div>}
                            {!pdfUrl && !pdfLoading && <div className="text-xs text-red-600">✗ Chưa có PDF</div>}
                          </div>
                          {pdfErrorText && (
                            <div className="text-xs text-red-600">Lỗi tạo PDF: {pdfErrorText}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Edit medical info modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-4"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="text-lg font-semibold">Cập nhật thông tin y tế</div>

          <Card>
            <CardContent className="space-y-3">
              <div className="text-sm font-medium">Hồ sơ y tế</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Chiều cao (cm)</div>
                  <input className="w-full border rounded p-2" value={profileForm.height} onChange={(e) => setProfileForm({ ...profileForm, height: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cân nặng (kg)</div>
                  <input className="w-full border rounded p-2" value={profileForm.weight} onChange={(e) => setProfileForm({ ...profileForm, weight: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Nhóm máu</div>
                  <input className="w-full border rounded p-2" value={profileForm.bloodType} onChange={(e) => setProfileForm({ ...profileForm, bloodType: e.target.value })} placeholder="VD: O, A, B, AB" />
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button size="sm" onClick={handleSaveAll} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <div className="text-sm font-medium">Thêm dị ứng</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Loại</div>
                  <select className="w-full border rounded p-2" value={newAllergy.type} onChange={(e) => setNewAllergy({ ...newAllergy, type: e.target.value as any })}>
                    <option value="DRUG">Thuốc</option>
                    <option value="FOOD">Thức ăn</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Chất gây dị ứng</div>
                  <input className="w-full border rounded p-2" value={newAllergy.substance} onChange={(e) => setNewAllergy({ ...newAllergy, substance: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Phản ứng</div>
                  <input className="w-full border rounded p-2" value={newAllergy.reaction} onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Mức độ</div>
                  <input className="w-full border rounded p-2" value={newAllergy.severity} onChange={(e) => setNewAllergy({ ...newAllergy, severity: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button size="sm" variant="outline" onClick={handleAddAllergy} disabled={saving}>{saving ? 'Đang thêm...' : 'Thêm dị ứng'}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3">
              <div className="text-sm font-medium">Thêm tiền sử bệnh</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Tên bệnh / chẩn đoán</div>
                  <input className="w-full border rounded p-2" value={newHistory.conditionName} onChange={(e) => setNewHistory({ ...newHistory, conditionName: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Mã ICD (tuỳ chọn)</div>
                  <input className="w-full border rounded p-2" value={newHistory.diagnosisCode} onChange={(e) => setNewHistory({ ...newHistory, diagnosisCode: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ngày chẩn đoán</div>
                  <input type="date" className="w-full border rounded p-2" value={newHistory.diagnosedAt} onChange={(e) => setNewHistory({ ...newHistory, diagnosedAt: e.target.value })} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Trạng thái</div>
                  <select className="w-full border rounded p-2" value={newHistory.status} onChange={(e) => setNewHistory({ ...newHistory, status: e.target.value as any })}>
                    <option value="ONGOING">Đang điều trị</option>
                    <option value="RESOLVED">Đã khỏi</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <Button size="sm" variant="outline" onClick={handleAddHistory} disabled={saving}>{saving ? 'Đang thêm...' : 'Thêm tiền sử bệnh'}</Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </Modal>

    </div>
  );
}