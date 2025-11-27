"use client";

import { getAppointmentById, getAppointmentByPatientEmail } from "@/apis/appointment/appointment.api";
import { getDoctorById } from "@/apis/doctor/profile.api";
import { CreatePrescriptionPdfDto, generatePrescriptionPdf, PrescriptionItemDto } from "@/apis/medicine/medicine.api";
import { getPatientByAccount, getPatientProfile } from "@/apis/patient/patient.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalRecordDto } from "@/types/patientDTO/medical-record.dto";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from 'react-qr-code';


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
  const router = useRouter();
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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<any>(null);
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptData, setApptData] = useState<any | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState<number>(0);
  const [ratingNote, setRatingNote] = useState<string>('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function loadAppointments() {
      try {
        const email = localStorage.getItem('email');
        const res = await getAppointmentByPatientEmail(email || '');
        setAppointments(res?.data || []);
      } catch (err) {
        console.error(err);
      }
    }

    loadAppointments();
  }, [record.email]);


  // Helpers to extract display names from doctor or patient objects (handle wrapper shapes)
  const extractDoctorName = (obj: any): string | null => {
    if (!obj) return null;
    const core = obj?.data ?? obj;
    return core?.doctorName ?? core?.profileId?.name ?? core?.name ?? null;
  };

  const extractPatientName = (obj: any): string | null => {
    if (!obj) return null;
    const core = obj?.data ?? obj;
    return core?.profileId?.name ?? core?.name ?? null;
  };

  // Map appointment status to badge color classes (light + dark friendly)
  const getStatusBadgeClasses = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    const s = String(status).toLowerCase();
    if (s.includes('completed') || s.includes('done')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
    if (s.includes('pending') || s.includes('waiting')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (s.includes('cancel') || s.includes('canceled') || s.includes('rejected')) return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  // Resolve patientId from common places or via account lookup
  const resolvePatientId = async (selRec?: any) => {
    const candidates: Array<string | undefined | null> = [
      (medicalRecord as any)?.patientId,
      (medicalRecord as any)?.patient?._id,
      (medicalRecord as any)?.profileId?._id,
      selRec?.patientId,
      selRec?.patient?._id,
      selRec?.appointment?.patient?._id,
      selRec?.apptId,
      selRec?._id,
    ];

    for (const c of candidates) {
      if (c) return String(c);
    }

    if (typeof window !== 'undefined') {
      const possibleKeys = ['id', 'accountId', 'userId', 'patientId'];
      for (const k of possibleKeys) {
        const v = localStorage.getItem(k);
        if (v) {
          try {
            const resp = await getPatientByAccount(v);
            if (resp && resp.data && resp.data._id) return resp.data._id;
          } catch (err) {
            console.debug('resolvePatientId: lookup failed for', k, v, err);
          }
        }
      }
    }

    return null;
  };

  // When modal opens (selectedRecord set) and current user is PATIENT, generate PDF automatically
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!selectedRecord) return;
      if (typeof window === 'undefined') return;
      if (localStorage.getItem('role') !== 'PATIENT') return;

      setPdfLoading(true);
      setPdfError(null);
      setPdfUrl(null);

      try {
        const patientId = await resolvePatientId(selectedRecord);
        if (!patientId) {
          setPdfError(new Error('Không tìm thấy patientId'));
          console.debug('generate PDF aborted: no patientId');
          return;
        }
        const prescriptions: PrescriptionItemDto[] = Array.isArray(selectedRecord.prescriptions)
          ? selectedRecord.prescriptions.map((p: any) => ({ medicineId: p.medicineId || p._id || '', name: p.name || p.title || 'Thuốc', quantity: Number(p.quantity || p.qty || 1), note: p.note || undefined }))
          : [];

        // Fetch patient profile as fallback source
        let profileData: any = null;
        try {
          const profResp = await getPatientProfile(patientId);
          profileData = profResp?.data ?? null;
          console.debug('getPatientProfile response:', profResp);
        } catch (err) {
          console.debug('getPatientProfile failed for', patientId, err);
        }

        console.debug('resolved profileData:', profileData);

        if (!profileData && typeof window !== 'undefined') {
          const possibleKeys = ['accountId', 'id', 'userId'];
          for (const k of possibleKeys) {
            const v = localStorage.getItem(k);
            if (!v) continue;
            try {
              const byAcct = await getPatientByAccount(v);
              const prof = byAcct?.data?.profileId ?? null;
              if (prof) {
                profileData = prof;
                console.debug('getPatientByAccount returned profile:', prof, 'for key', k);
                break;
              }
            } catch (err) {
              console.debug('getPatientByAccount failed for', k, v, err);
            }
          }                                                    
        }

        const resolvedPatientName = (
          (selectedRecord as any)?.patient?.name ??
          (medicalRecord as any)?.patient?.name ??
          (medicalRecord as any)?.patientName ??
          (profileData as any)?.profileId?.name ?? (profileData as any)?.name
        ) || undefined;

        const resolvedPatientAge = (() => {
          const candidate = (selectedRecord as any)?.patient?.age ?? (medicalRecord as any)?.patient?.age ?? (medicalRecord as any)?.patientAge ?? (profileData as any)?.profileId?.age ?? (profileData as any)?.profileId?.dob ?? (profileData as any)?.age ?? (profileData as any)?.patientAge ?? (profileData as any)?.dob ?? (profileData as any)?.dateOfBirth ?? (profileData as any)?.birthDate;
          if (candidate === undefined || candidate === null) return undefined;
          if (typeof candidate === 'string' && (candidate.includes('-') || candidate.includes('/'))) {
            const d = new Date(candidate);
            if (!isNaN(d.getTime())) {
              const ageNum = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
              return ageNum;
            }
          }
          const num = Number(candidate);
          return Number.isNaN(num) ? undefined : num;
        })();

        const dto: CreatePrescriptionPdfDto = {
          diagnosis: selectedRecord.diagnosis || selectedRecord.name || '',
          prescriptions,
          note: selectedRecord.note || undefined,
          dateRecord: selectedRecord.dateRecord ? new Date(selectedRecord.dateRecord) : new Date(),
          patientName: resolvedPatientName,
          patientAge: resolvedPatientAge,
          doctorName: localStorage.getItem('name') || undefined,
        };

        const res = await generatePrescriptionPdf(patientId, dto);
        if (!mounted) return;
        const url = res?.data?.url || null;
        setPdfUrl(url);
        console.log('generatePrescriptionPdf response', res);
      } catch (err) {
        console.error('Failed to generate prescription PDF', err);
        setPdfError(err);
      } finally {
        if (mounted) setPdfLoading(false);
      }
    };

    run();
    return () => { mounted = false; };
  }, [selectedRecord]);

  // Handler to submit rating (placeholder: logs payload; replace with API call)
  const handleSubmitRating = async () => {
    if (!apptData) return alert('Không có thông tin cuộc hẹn để đánh giá');
    setRatingSubmitting(true);
    try {
      const payload = {
        appointmentId: apptData._id,
        doctorId: apptData.doctorId?._id ?? apptData.doctorId,
        rating: ratingStars,
        note: ratingNote,
      };

      console.debug('Submitting rating payload:', payload);
      // TODO: call real API here. For now, show confirmation and close modal.
      alert('Cảm ơn đánh giá của bạn');
      setRatingModalOpen(false);
    } catch (err) {
      console.error('Failed to submit rating', err);
      alert('Gửi đánh giá thất bại');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Fetch doctor and patient names when appointment data is available
  useEffect(() => {
    let mounted = true;
    const loadNames = async () => {
      if (!apptData) {
        if (mounted) {
          // If the rating modal is open we may have prefilling in place
          // (openRatingForm sets the names before clearing apptData). In
          // that case, don't clear the prefills when apptData becomes null.
          if (!ratingModalOpen) {
            setDoctorName(null);
            setPatientName(null);
          }
        }
        return;
      }

      try {
        // Resolve doctor (handle both id string and embedded object)
        const rawDoctor = apptData.doctorId ?? apptData.doctor ?? null;
        const doctorId = rawDoctor && typeof rawDoctor === 'object' ? (rawDoctor._id ?? rawDoctor) : rawDoctor;
        if (doctorId) {
          try {
            const dResp = await getDoctorById(String(doctorId));
            // API may return either the raw doctor object or a DataResponse wrapper
            const dObj = dResp?.data ?? dResp ?? null;
            const name = extractDoctorName(dObj) ?? extractDoctorName(apptData?.doctorId) ?? apptData.doctorName ?? null;
            if (mounted) setDoctorName(name);
            console.debug('Resolved doctor name:', name, 'from', dObj);
          } catch (err) {
            console.debug('getDoctorById failed for', doctorId, err);
            if (mounted) setDoctorName(extractDoctorName(apptData?.doctorId) ?? apptData.doctorName ?? null);
          }
        } else {
          if (mounted) setDoctorName(extractDoctorName(apptData?.doctorId) ?? apptData.doctorName ?? null);
        }

        // Resolve patient (handle both id string and embedded object)
        const rawPatient = apptData.patientId ?? apptData.patient ?? null;
        const patientId = rawPatient && typeof rawPatient === 'object' ? (rawPatient._id ?? rawPatient) : rawPatient;
        if (patientId) {
          try {
            const pResp = await getPatientProfile(String(patientId));
            const pObj = pResp?.data ?? pResp ?? null;
            const pname = extractPatientName(pObj) ?? extractPatientName(apptData?.patientId) ?? apptData.patientName ?? null;
            if (mounted) setPatientName(pname);
            console.debug('Resolved patient name:', pname, 'from', pObj);
          } catch (err) {
            console.debug('getPatientProfile failed for', patientId, err);
            if (mounted) setPatientName(extractPatientName(apptData?.patientId) ?? apptData.patientName ?? null);
          }
        } else {
          if (mounted) setPatientName(extractPatientName(apptData?.patientId) ?? apptData.patientName ?? null);
        }
      } catch (err) {
        console.error('Failed to resolve doctor/patient names', err);
      }
    };

    loadNames();
    return () => { mounted = false; };
  }, [apptData, ratingModalOpen]);

  // Open rating modal and ensure appointment modal is closed
  const openRatingForm = () => {
    setRatingStars(0);
    setRatingNote('');
    // Prefill visible names so rating modal can show them after we clear apptData
    const preDoctor = doctorName ?? apptData?.doctorId?.profileId?.name ?? apptData?.doctorId?.name ?? apptData?.doctorName ?? null;
    const prePatient = patientName ?? apptData?.patientId?.profileId?.name ?? apptData?.patientId?.name ?? apptData?.patientName ?? null;
    setDoctorName(preDoctor);
    setPatientName(prePatient);
    // close appointment modal if open and clear loaded appointment
    setApptModalOpen(false);
    setApptData(null);
    setRatingModalOpen(true);
  };

  return (
    <div className="flex flex-col max-h-full overflow-hidden rounded-lg">
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
            <TabsTrigger value="appointments" className="px-3 py-2 rounded">
                Cuộc hẹn 
                <Badge variant="gray" className="ml-2">
                  {appointments.length}
                </Badge>
              </TabsTrigger>

          </TabsList>
        </div>

        {/* Scrollable tab content area */}
       <div className="flex flex-col flex-1 overflow-hidden px-6 pt-4">
          <TabsContent value="medicalHistory">
            <div className="max-h-[80vh] overflow-auto pr-2 pb-6">
              {record.medicalHistory.length === 0 ? (
                <p className="italic text-muted-foreground text-center py-8 text-lg">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-5">
                  {record.medicalHistory.map((r: any) => (
                    <Card key={r._id || r.dateRecord} className="p-3 rounded-md shadow-sm">
                      <CardContent className="!p-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-lg font-semibold leading-tight">{r.diagnosis || r.name || 'Chẩn đoán'}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{r.dateRecord ? new Date(r.dateRecord).toLocaleString('vi-VN') : '-'}</div>
                              </div>
                              <div className="text-xs text-muted-foreground text-right">{Array.isArray(r.prescriptions) ? `${r.prescriptions.length} đơn` : ''}</div>
                            </div>

                            {r.note && (
                              <div className="mt-2 text-sm text-muted-foreground" style={{overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical'}}>
                                {r.note}
                              </div>
                            )}
                          </div>

                          <div className="shrink-0 w-28">
                            <Button size="sm" variant="outline" className="w-full" onClick={() => setSelectedRecord(r)}>Xem chi tiết</Button>
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

          <TabsContent value="appointments">
            <div className="h-full max-h-[50vh] overflow-auto pr-2 space-y-3">
              {appointments.length === 0 ? (
                <p className="italic text-muted-foreground text-center py-8 text-lg">
                  Chưa có dữ liệu
                </p>
              ) : (
                appointments.map((appt: any) => (
                  <Card key={appt._id} className="p-4">
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        
                        {/* Ngày khám */}
                        <div className="flex justify-between">
                          <span className="font-medium">Ngày khám:</span>
                          <span className="text-muted-foreground">
                            {new Date(appt.date).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        {/* Bác sĩ */}
                        <div className="flex justify-between">
                          <span className="font-medium">Bác sĩ:</span>
                          <span>{appt.doctorId ?? "-"}</span>
                        </div>

                        {/* Loại dịch vụ */}
                        <div className="flex justify-between">
                          <span className="font-medium">Dịch vụ:</span>
                          <span>{appt.serviceType}</span>
                        </div>

                        {/* Tình trạng */}
                        <div className="flex justify-between">
                          <span className="font-medium">Trạng thái:</span>
                          <span>{appt.appointmentStatus}</span>
                        </div>

                        {/* Lý do khám */}
                        <div className="flex justify-between">
                          <span className="font-medium">Lý do:</span>
                          <span>{appt.reasonForAppointment ?? "-"}</span>
                        </div>

                        {/* Tiền khám */}
                        <div className="flex justify-between">
                          <span className="font-medium">Phí khám:</span>
                          <span>{appt.consultationFee?.toLocaleString()} đ</span>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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
                {/* If current user is a PATIENT, show appointment details and create prescription actions */}
                {typeof window !== 'undefined' && localStorage.getItem('role') === 'PATIENT' && (
                  <div className="mt-4 flex items-center gap-3">
                    <Button variant="outline" onClick={async () => {
                      const apptId = selectedRecord.appointmentId || selectedRecord.apptId || selectedRecord._id;
                      if (!apptId) {
                        alert('Không tìm thấy thông tin lịch hẹn liên quan.');
                        return;
                      }

                      try {
                        setApptLoading(true);
                        setApptData(null);
                        // show modal early so user sees loading state
                        setApptModalOpen(true);

                        console.debug('Fetching appointment, apptId=', apptId, 'selectedRecord=', selectedRecord);
                        const resp = await getAppointmentById(apptId);
                        console.debug('getAppointmentById raw resp:', resp);

                        // resp may be either a DataResponse wrapper or the appointment object itself
                        const data = resp?.data ?? resp ?? null;
                        if (!data) {
                          console.warn('getAppointmentById returned no appointment data, full resp:', resp);
                        }
                        setApptData(data);
                        console.debug('appointment data (used):', data);
                      } catch (err) {
                        console.error('Failed to load appointment', err);
                        setApptData(null);
                      } finally {
                        setApptLoading(false);
                      }
                    }}>Xem chi tiết appointment</Button>
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => {
                          if (pdfUrl) window.open(pdfUrl, "_blank");
                          else if (pdfLoading) console.debug('PDF is being generated');
                          else alert('Đang chuẩn bị đơn thuốc...');
                        }}
                        disabled={pdfLoading || !pdfUrl}
                      >
                        {pdfLoading ? 'Đang tạo...' : 'Xem đơn thuốc'}
                      </Button>

                      {pdfUrl && (
                        <div className="p-1 bg-white rounded shadow-sm">
                          <QRCode value={pdfUrl} size={64} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>


      {/* Appointment details modal */}
      <Modal open={apptModalOpen} onClose={() => { setApptModalOpen(false); setApptData(null); }} className="bg-white rounded-xl shadow-lg max-w-4xl w-full p-4">
        <div className="space-y-4 text-sm w-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-semibold">Chi tiết cuộc hẹn</div>
              <div className="text-xs text-muted-foreground mt-1">Mã cuộc hẹn: <span className="font-mono ml-2">{apptData?._id ?? '-'}</span></div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(apptData?.appointmentStatus)}`}>{apptData?.appointmentStatus ?? 'UNKNOWN'}</span>
              <div className="flex items-center gap-2">
                {/* <Button size="sm" variant="ghost" onClick={() => { setApptModalOpen(false); setApptData(null); }}>Đóng</Button> */}
                <Button size="sm" onClick={openRatingForm} disabled={!apptData}>Đánh giá buổi hẹn</Button>
              </div>
            </div>
          </div>

          {apptLoading ? (
            <div className="py-8 text-center">Đang tải...</div>
          ) : apptData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left/Main: summary */}
              <div className="md:col-span-2">
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Thời gian</div>
                        <div className="text-lg font-medium">{apptData.date ? new Date(apptData.date).toLocaleString('vi-VN') : '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Ca</div>
                        <div className="text-lg font-medium">{apptData.timeSlot?.label ?? `${apptData.timeSlot?.start ?? '-'} - ${apptData.timeSlot?.end ?? '-'}`}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Loại dịch vụ</div>
                        <div className="font-medium">{apptData.serviceType ?? '-'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Phí khám</div>
                        <div className="font-medium">{apptData.consultationFee ? `${apptData.consultationFee} đ` : '-'}</div>
                      </div>
                    </div>

                    {apptData.reasonForAppointment && (
                      <div className="mt-4">
                        <div className="text-xs text-muted-foreground">Lý do khám</div>
                        <div className="mt-1 text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">{apptData.reasonForAppointment}</div>
                      </div>
                    )}

                    {/* Prescriptions or notes */}
                    {Array.isArray(apptData.prescriptions) && apptData.prescriptions.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs text-muted-foreground">Đơn thuốc</div>
                        <div className="mt-2 space-y-2">
                          {apptData.prescriptions.map((p: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-800 border dark:border-gray-700 rounded p-2">
                              <div>
                                <div className="font-medium">{p.name ?? p.title ?? 'Thuốc'}</div>
                                <div className="text-xs text-muted-foreground">Số lượng: {p.quantity ?? p.qty ?? '-'}</div>
                                {p.note && <div className="text-xs mt-1">Ghi chú: {p.note}</div>}
                              </div>
                              <div className="text-xs text-muted-foreground">ID: {p.medicineId ?? p._id ?? '-'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: doctor & patient summary */}
              <div>
                <Card className="bg-white dark:bg-gray-800">
                  <CardContent>
                    <div className="text-xs text-muted-foreground">Bác sĩ</div>
                    <div className="font-medium">{doctorName ?? extractDoctorName(apptData?.doctorId) ?? apptData.doctorName ?? '-'}</div>
                    {apptData.doctorId?.profileId?.specialty && <div className="text-xs text-muted-foreground">{apptData.doctorId.profileId.specialty}</div>}
                    {apptData.doctorId?.profileId?.phone && <div className="text-xs text-muted-foreground">SĐT: {apptData.doctorId.profileId.phone}</div>}
                    {apptData.doctorId?.profileId?.email && <div className="text-xs text-muted-foreground">Email: {apptData.doctorId.profileId.email}</div>}

                    <div className="border-t my-3" />

                    <div className="text-xs text-muted-foreground">Bệnh nhân</div>
                    <div className="font-medium">{patientName ?? extractPatientName(apptData?.patientId) ?? apptData.patientName ?? '-'}</div>
                    {apptData.patientId?.profileId?.phone && <div className="text-xs text-muted-foreground">SĐT: {apptData.patientId.profileId.phone}</div>}
                    {apptData.patientId?.profileId?.email && <div className="text-xs text-muted-foreground">Email: {apptData.patientId.profileId.email}</div>}
                    <div className="border-t my-3" />
                    {apptData.createdAt && <div className="text-xs text-muted-foreground">Tạo lúc: {new Date(apptData.createdAt).toLocaleString('vi-VN')}</div>}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">Không có dữ liệu cuộc hẹn.</div>
          )}
        </div>
      </Modal>

      {/* Rating modal */}
      <Modal open={ratingModalOpen} onClose={() => setRatingModalOpen(false)}>
        <div className="space-y-3 text-base max-w-lg">
          <div className="text-lg font-semibold">Đánh giá buổi hẹn</div>
          <div className="text-sm text-muted-foreground">Bác sĩ: {doctorName ?? extractDoctorName(apptData?.doctorId) ?? apptData?.doctorName ?? '-'}</div>

          <div>
            <div className="text-sm font-medium mb-2">Chọn mức độ hài lòng</div>
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRatingStars(n)}
                  className={`w-10 h-10 flex items-center justify-center rounded ${ratingStars >= n ? 'text-yellow-400' : 'text-gray-300'}`}
                  aria-label={`${n} sao`}
                >
                  <span className="text-2xl leading-none">{ratingStars >= n ? '★' : '☆'}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Ghi chú</div>
            <textarea
              value={ratingNote}
              onChange={(e) => setRatingNote(e.target.value)}
              className="w-full border rounded p-2 min-h-[100px]"
              placeholder="Viết nhận xét về buổi khám..."
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            {/* <Button size="sm" variant="ghost" onClick={() => setRatingModalOpen(false)} disabled={ratingSubmitting}>Hủy</Button> */}
            <Button size="sm" onClick={handleSubmitRating} disabled={ratingSubmitting || ratingStars === 0}>{ratingSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
