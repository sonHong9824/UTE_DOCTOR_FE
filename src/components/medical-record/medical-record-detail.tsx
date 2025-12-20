"use client";

import { getAppointmentById, getAppointments } from "@/apis/appointment/appointment.api";
import { getDoctorById } from "@/apis/doctor/profile.api";
import { CreatePrescriptionPdfDto, generatePrescriptionPdf, PrescriptionItemDto } from "@/apis/medicine/medicine.api";
import { createAllergyRecord, createMedicalHistoryRecord, getPatientByAccount, getPatientProfile, upsertMedicalProfile } from "@/apis/patient/patient.api";
import { createReview, getReviewByAppointmentAndPatient } from "@/apis/review/review.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentStatus from "@/enum/appointment-status.enum";
import { MedicalRecordDto } from "@/types/patientDTO/medical-record.dto";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import QRCode from 'react-qr-code';
import { toast } from "sonner";
import AppointmentsList from "../appointments/appointments-list";


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
  user?: PatientProfileDto;
  medicalRecord?: MedicalRecordDto;
}

export default function MedicalRecordDetail({ user, medicalRecord }: MedicalRecordDetailProps) {
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
  
  console.log("MedicalRecordDetail received:", { user, medicalRecord, computed: record });

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
  const [ratingContext, setRatingContext] = useState<any | null>(null);
  const [existingReview, setExistingReview] = useState<any | null>(null);
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showPagination, setShowPagination] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
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


  useEffect(() => {
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

  // Helpers for rendering review colors and stars
  const getReviewColorClasses = (rating: number | undefined) => {
    const r = Number(rating ?? 0);
    if (r >= 8) return { bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100', badge: 'bg-emerald-500' };
    if (r >= 5) return { bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100', badge: 'bg-yellow-500' };
    return { bg: 'bg-gradient-to-r from-rose-50 to-rose-100', badge: 'bg-rose-500' };
  };

  const renderStars = (rating: number | undefined) => {
    const r = Number(rating ?? 0);
    const filled = Math.round(Math.min(Math.max(r, 0), 10));
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className={`${i < filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} text-lg`}>{i < filled ? '★' : '☆'}</span>
        ))}
      </div>
    );
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
        const patientId = localStorage.getItem('patientId') || null;
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
          user?.accountProfileDto?.name ??
          user?.name ??
          (selectedRecord as any)?.patient?.name ??
          (medicalRecord as any)?.patient?.name ??
          (medicalRecord as any)?.patientName ??
          (profileData as any)?.profileId?.name ?? (profileData as any)?.name
        ) || undefined;

        const resolvedPatientAge = (() => {
          const candidate = user?.accountProfileDto?.age ?? user?.patientAge ?? (selectedRecord as any)?.patient?.age ?? (medicalRecord as any)?.patient?.age ?? (medicalRecord as any)?.patientAge ?? (profileData as any)?.profileId?.age ?? (profileData as any)?.profileId?.dob ?? (profileData as any)?.age ?? (profileData as any)?.patientAge ?? (profileData as any)?.dob ?? (profileData as any)?.dateOfBirth ?? (profileData as any)?.birthDate;
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

  // Handler to submit rating using API
  const handleSubmitRating = async () => {
    if (!ratingContext) {
      toast.error('Không có thông tin cuộc hẹn để đánh giá');
      return;
    }

    if (!ratingStars || ratingStars <= 0) {
      toast.error('Vui lòng chọn mức đánh giá');
      return;
    }

    setRatingSubmitting(true);
    try {
      // Ensure we have patientId; attempt to resolve as fallback
      let patientId = ratingContext.patientId;
      if (!patientId) {
        const resolved = localStorage.getItem('patientId') || null;
        patientId = resolved ?? undefined;
      }

      const payload = {
        doctorId: ratingContext.doctorId,
        patientId,
        rating: ratingStars,
        comment: ratingNote || undefined,
        appointmentId: ratingContext.appointmentId,
      };

      console.debug('Submitting rating payload:', payload);
      const res = await createReview(payload);
      // createReview may return undefined on network/error
      if (!res) {
        toast.error('Gửi đánh giá thất bại. Vui lòng thử lại');
        return;
      }

      // If API returns a message or code, surface success accordingly
      const message = (res as any)?.message ?? 'Cảm ơn đánh giá của bạn';
      const code = (res as any)?.code ?? undefined;
      if (typeof code === 'string' && code.toUpperCase() === 'SUCCESS') {
        toast.success(String(message));
      } else if (code === 'SUCCESS' || code === 200) {
        toast.success(String(message));
      } else {
        toast.error(String(message));
      }
      // Set the created review into state (API returns the created review under res.data)
      try {
        const created = (res as any)?.data ?? null;
        if (created) setExistingReview(created);
      } catch (e) {
        console.debug('Could not set created review into state', e);
      }
      setRatingModalOpen(false);
      setRatingContext(null);
      // Optionally clear the form
      setRatingStars(0);
      setRatingNote('');
    } catch (err: any) {
      console.error('Failed to submit rating', err);
      const msg = err?.response?.data?.message ?? err?.message ?? 'Gửi đánh giá thất bại';
      toast.error(String(msg));
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

        // Fetch existing review for this appointment + patient (if available)
        try {
          const rawPatientForReview = apptData.patientId ?? apptData.patient ?? null;
          const patientIdForReview = rawPatientForReview && typeof rawPatientForReview === 'object' ? (rawPatientForReview._id ?? rawPatientForReview) : rawPatientForReview;
          const appointmentIdForReview = apptData._id ?? apptData.appointmentId ?? null;
          if (appointmentIdForReview && patientIdForReview) {
            const reviewResp = await getReviewByAppointmentAndPatient(String(appointmentIdForReview), String(patientIdForReview));
            let reviewData: any = null;
            if (reviewResp == null) {
              reviewData = null;
            } else if (Object.prototype.hasOwnProperty.call(reviewResp, 'data')) {
              // explicit wrapper: reviewResp.data may be null -> means no review
              reviewData = (reviewResp as any).data;
            } else {
              // raw object returned
              reviewData = reviewResp;
            }
            if (mounted) setExistingReview(reviewData);
            console.debug('Fetched existing review:', reviewData);
          } else {
            if (mounted) setExistingReview(null);
          }
        } catch (err) {
          console.debug('Failed to fetch existing review', err);
          if (mounted) setExistingReview(null);
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
    // capture needed ids (appointmentId, doctorId, patientId) before clearing apptData
    if (apptData) {
      const resolvedDoctorId = (apptData.doctorId && typeof apptData.doctorId === 'object') ? (apptData.doctorId._id ?? apptData.doctorId) : apptData.doctorId;
      const resolvedPatientId = (apptData.patientId && typeof apptData.patientId === 'object') ? (apptData.patientId._id ?? apptData.patientId) : apptData.patientId;
      setRatingContext({ appointmentId: apptData._id, doctorId: resolvedDoctorId, patientId: resolvedPatientId });
    }
    // close appointment modal if open and clear loaded appointment (we keep ratingContext)
    setApptModalOpen(false);
    setApptData(null);
    setRatingModalOpen(true);
  };

  const handleOpenRatingModal = () => {
    if (apptData?.appointmentStatus === 'COMPLETED') {
      // Prefill visible names for rating modal
      const preDoctor = doctorName ?? apptData?.doctorId?.profileId?.name ?? apptData?.doctorId?.name ?? apptData?.doctorName ?? null;
      const prePatient = patientName ?? apptData?.patientId?.profileId?.name ?? apptData?.patientId?.name ?? apptData?.patientName ?? null;
      setDoctorName(preDoctor);
      setPatientName(prePatient);

      // Capture minimal context required for submitting rating
      const resolvedDoctorId = (apptData?.doctorId && typeof apptData.doctorId === 'object') ? (apptData.doctorId._id ?? apptData.doctorId) : apptData?.doctorId;
      const resolvedPatientId = (apptData?.patientId && typeof apptData.patientId === 'object') ? (apptData.patientId._id ?? apptData.patientId) : apptData?.patientId;
      const resolvedAppointmentId = apptData?._id ?? apptData?.appointmentId;
      setRatingContext({ appointmentId: resolvedAppointmentId, doctorId: resolvedDoctorId, patientId: resolvedPatientId });

      setRatingModalOpen(true);
    } else {
      toast.info("Bạn chỉ có thể đánh giá sau khi buổi khám hoàn tất");
    }
  };

  const loadAppointments = async (page: number = 1, limit: number = 10) => {
    try {
      const res = await getAppointments(page, limit);

      console.log("Appointments API response:", res);

      setAppointments(res?.data.data || []);
      setTotalPages(res?.data.totalPages || 1);
      setTotal(res?.data.total || 0);

      setCurrentPage(res?.data.page || 1);

      const pages = res?.data.totalPages || 1;
      setShowPagination(pages > 1);

    } catch (err) {
      console.error(err);
    }
  };



  async function handleCancelAppointment(apptData: any): Promise<void> {
    if (!apptData || !apptData._id) {
      toast.error("Không tìm thấy thông tin cuộc hẹn để hủy.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn hủy buổi khám này?")) {
      return;
    }
    setApptLoading(true);
    try {
      // You may need to implement or import an API for canceling appointment
      // For example: await cancelAppointmentById(apptData._id);
      // Here is a placeholder for the actual API call:
      // await cancelAppointmentById(apptData._id);

      // Simulate API call with a timeout (remove this in production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Đã hủy buổi khám thành công.");
      setApptModalOpen(false);
      setApptData(null);
      await loadAppointments();
    } catch (err: any) {
      toast.error("Hủy buổi khám thất bại. Vui lòng thử lại.");
      console.error("Cancel appointment error:", err);
    } finally {
      setApptLoading(false);
    }
  }

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
      <div className="flex items-center justify-end px-4 mb-2">
        <Button size="sm" variant="outline" onClick={openEditModal}>Cập nhật hồ sơ</Button>
      </div>

      <Tabs defaultValue="medicalHistory" className="flex-1 flex flex-col">
        {/* Sticky tabs header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b">
          <TabsList className="flex gap-3 px-4 py-3">
            <TabsTrigger value="medicalHistory" className="px-3 py-2 rounded">Tiền sử bệnh <Badge variant="gray" className="ml-2">{record.medicalHistory.length}</Badge></TabsTrigger>
            <TabsTrigger value="drugAllergies" className="px-3 py-2 rounded">Dị ứng thuốc <Badge variant="gray" className="ml-2">{record.drugAllergies.length}</Badge></TabsTrigger>
            <TabsTrigger value="foodAllergies" className="px-3 py-2 rounded">Dị ứng thức ăn <Badge variant="gray" className="ml-2">{record.foodAllergies.length}</Badge></TabsTrigger>
            <TabsTrigger value="encounters" className="px-3 py-2 rounded">Lượt khám <Badge variant="gray" className="ml-2">{record.encounters.length}</Badge></TabsTrigger>
            <TabsTrigger value="bloodPressure" className="px-3 py-2 rounded">Huyết áp <Badge variant="gray" className="ml-2">{record.bloodPressure.length}</Badge></TabsTrigger>
            <TabsTrigger value="heartRate" className="px-3 py-2 rounded">Nhịp tim <Badge variant="gray" className="ml-2">{record.heartRate.length}</Badge></TabsTrigger>
            <TabsTrigger value="appointments" className="px-3 py-2 rounded">
                Cuộc hẹn 
                <Badge variant="gray" className="ml-2">
                  {total}
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
                    <Card key={r._id || r.dateRecord} className="p-3 rounded-md shadow-sm m-4">
                      <CardContent className="!p-0">
                        <div className="flex items-center justify-between gap-3 p-8">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-lg font-semibold leading-tight">{r.conditionName || r.diagnosis || r.name || 'Chẩn đoán'}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{r.diagnosedAt ? new Date(r.diagnosedAt).toLocaleDateString('vi-VN') : (r.dateRecord ? new Date(r.dateRecord).toLocaleDateString('vi-VN') : '-')}</div>
                              </div>
                              <div className="text-xs text-muted-foreground text-right uppercase">{r.status || r.source || ''}</div>
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
                  <Card key={r._id || r.substance || r.name} className="p-4">
                    <CardContent>
                      <div className="text-lg font-semibold">{r.substance || r.name}</div>
                      <div className="text-sm text-muted-foreground">{r.reaction || r.note || 'Chưa có mô tả phản ứng'}</div>
                      {r.severity && <div className="mt-2 text-xs">Mức độ: {r.severity}</div>}
                      {r.reportedBy && <div className="text-xs text-muted-foreground mt-1">Nguồn: {r.reportedBy === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}</div>}
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
                  <Card key={r._id || r.substance || r.name} className="p-4">
                    <CardContent>
                      <div className="text-lg font-semibold">{r.substance || r.name}</div>
                      <div className="text-sm text-muted-foreground">{r.reaction || r.note || 'Chưa có mô tả phản ứng'}</div>
                      {r.severity && <div className="mt-2 text-xs">Mức độ: {r.severity}</div>}
                      {r.reportedBy && <div className="text-xs text-muted-foreground mt-1">Nguồn: {r.reportedBy === 'DOCTOR' ? 'Bác sĩ' : 'Bệnh nhân'}</div>}
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

          <TabsContent value="encounters">
            {record.encounters.length === 0 ? (
              <p className="italic text-muted-foreground text-center py-8 text-lg">Chưa có lượt khám</p>
            ) : (
              <div className="space-y-4">
                {record.encounters.map((e: any) => (
                  <Card key={e._id || e.appointmentId} className="p-4 border shadow-sm">
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-lg font-semibold leading-tight">{e.diagnosis || 'Chẩn đoán'}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{e.dateRecord ? new Date(e.dateRecord).toLocaleString('vi-VN') : '-'}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setSelectedRecord(e)}>Xem chi tiết</Button>
                      </div>

                      {e.note && <div className="text-sm text-muted-foreground">{e.note}</div>}

                      {Array.isArray(e.prescriptions) && e.prescriptions.length > 0 && (
                        <div className="text-sm text-muted-foreground">Đơn thuốc: {e.prescriptions.length} thuốc</div>
                      )}

                      {Array.isArray(e.vitalSigns) && e.vitalSigns.length > 0 && (
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {e.vitalSigns.map((v: any, idx: number) => (
                            <span key={v._id || idx} className="px-2 py-1 rounded bg-muted text-xs">
                              {v.type === 'BP'
                                ? `HA ${v.bloodPressure?.systolic ?? '-'} / ${v.bloodPressure?.diastolic ?? '-'}`
                                : v.type === 'HR'
                                  ? `HR ${v.value ?? '-'}`
                                  : `${v.type} ${v.value ?? '-'}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsList
              appointments={appointments}
              loading={apptLoading}
              showPagination={showPagination} 
              currentPage={currentPage}
              totalPages={totalPages}
               onPageChange={(newPage) => {
                setCurrentPage(newPage);
                loadAppointments(newPage);
              }}
              onOpenDetail={(appt) => {
                setApptLoading(true);
                setApptModalOpen(true);
                try {
                  setApptData(appt);
                } catch (err) {
                  console.error('Failed to open appointment modal', err);
                  setApptData(null);
                  toast.error('Không tải được chi tiết cuộc hẹn');
                } finally {
                  setApptLoading(false);
                }
              }}
              onRefresh={loadAppointments}
            />
          </TabsContent>

        </div>
      </Tabs>

      {/* Modal for any selected record details (e.g., prescription detail) */}
      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)}>
        {selectedRecord && (() => {
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
                              setApptModalOpen(true);
                              const resp = await getAppointmentById(apptId);
                              const data = resp?.data ?? resp ?? null;
                              setApptData(data);
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
                </>
              )}
            </div>
          );
        })()}
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
                {/* Hide rating button if an existing review is present */}
                  {apptData?.appointmentStatus !== AppointmentStatus.COMPLETED &&
                    apptData?.appointmentStatus !== AppointmentStatus.CANCELLED && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-red-500 text-white hover:bg-red-600"
                    onClick={() => handleCancelAppointment(apptData)}
                    disabled={ratingSubmitting}
                  >
                    Hủy buổi khám
                  </Button>
                )}
                {!existingReview && apptData?.appointmentStatus === AppointmentStatus.COMPLETED && (
                  <Button size="sm" onClick={handleOpenRatingModal} disabled={!apptData}>Đánh giá buổi khám</Button>
                )}
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
                      <div className="text-lg font-medium">
                        {apptData.timeSlot
                          ? `${apptData.timeSlot.label} (${apptData.timeSlot.start} - ${apptData.timeSlot.end})`
                          : '-'}
                      </div>
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

                    {/* Existing review display: shown below doctor/patient info but keep rating button in header */}
                    {existingReview && (
                      (() => {
                        const rc = getReviewColorClasses(existingReview.rating);
                        return (
                          <div className={`mt-4 p-4 rounded-lg shadow-lg ${rc.bg} border dark:border-gray-700`}>
                            <div className="flex items-start gap-4">
                              {/* <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white ${rc.badge} shadow-inner text-lg font-bold`}>{existingReview.rating ?? '-'}</div> */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-medium">Đã đánh giá</div>
                                    <div className="mt-1 flex items-center gap-3">
                                      <div className="text-xl font-semibold">{existingReview.rating ?? '-'}/10</div>
                                      <div className="flex items-center">{renderStars(existingReview.rating)}</div>
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">{existingReview.createdAt ? new Date(existingReview.createdAt).toLocaleString('vi-VN') : ''}</div>
                                </div>
                                {existingReview.comment && (
                                  <blockquote className="mt-3 text-sm text-gray-800 dark:text-gray-200 italic border-l-4 border-primary/20 pl-3">{existingReview.comment}</blockquote>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()
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
          <div className="text-lg font-semibold">Đánh giá buổi khám</div>
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
            {/* Nút Hủy buổi khám */}
            <Button
              size="sm"
              onClick={handleSubmitRating}
              disabled={ratingSubmitting || ratingStars === 0 || !ratingContext}
            >
              {ratingSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </div>
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
