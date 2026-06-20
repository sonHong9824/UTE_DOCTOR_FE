"use client";

import { getAppointments } from "@/apis/appointment/appointment.api";
import { getDoctorById } from "@/apis/doctor/profile.api";
import { getPatientProfile } from "@/apis/patient/patient.api";
import { createReview, getReviewByAppointmentAndPatient } from "@/apis/review/review.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import AppointmentStatus from "@/enum/appointment-status.enum";
import AppointmentsList from "@/features/appointment/components/AppointmentsList";
import {
  getCombinedAppointmentStatusClass,
  getCombinedAppointmentStatusLabel,
} from "@/features/appointment/utils/appointment-status";
import AppointmentSummaryCards from "@/features/appointment-history/components/AppointmentSummaryCards";
import {
  APPOINTMENT_CANCELLED_EVENT,
  APPOINTMENT_DOCTOR_ASSIGNED_EVENT,
} from "@/lib/realtimeEvents";
import { CalendarClock } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Appointment history tab. The appointment state, fetching, realtime refresh,
// detail/rating modals and helpers were relocated verbatim from the medical
// detail screen so behavior is identical — only the surrounding layout is new.

export default function AppointmentHistoryScreen() {
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
  const [initialLoading, setInitialLoading] = useState(true);

  const loadAppointments = async (page: number = 1, limit: number = 100) => {
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

  useEffect(() => {
    let active = true;
    (async () => {
      await loadAppointments();
      if (active) setInitialLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Patient broad booking realtime: assignment completion and assignment-timeout cancellation
  // arrive through the shared notification bell, then this screen refreshes its source-of-truth list.
  const loadAppointmentsRef = useRef(loadAppointments);
  loadAppointmentsRef.current = loadAppointments;
  const currentPageRef = useRef(currentPage);
  currentPageRef.current = currentPage;
  useEffect(() => {
    const handleAppointmentStateChanged = () => {
      void loadAppointmentsRef.current(currentPageRef.current);
    };
    window.addEventListener(APPOINTMENT_DOCTOR_ASSIGNED_EVENT, handleAppointmentStateChanged);
    window.addEventListener(APPOINTMENT_CANCELLED_EVENT, handleAppointmentStateChanged);
    return () => {
      window.removeEventListener(APPOINTMENT_DOCTOR_ASSIGNED_EVENT, handleAppointmentStateChanged);
      window.removeEventListener(APPOINTMENT_CANCELLED_EVENT, handleAppointmentStateChanged);
    };
  }, []);

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

  // Status breakdown for the summary cards, computed from loaded appointments.
  const summary = useMemo(() => {
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;
    for (const appt of appointments) {
      const status = appt?.appointmentStatus;
      if (status === "COMPLETED") completed += 1;
      else if (status === "CANCELLED") cancelled += 1;
      else if (status === "PENDING" || status === "CONFIRMED" || status === "RESCHEDULED")
        upcoming += 1;
    }
    return { upcoming, completed, cancelled };
  }, [appointments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20">
          <CalendarClock className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Lịch sử khám</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý cuộc hẹn, thanh toán và lịch sử khám của bạn
          </p>
        </div>
      </div>

      {/* Summary */}
      <AppointmentSummaryCards
        total={total || appointments.length}
        upcoming={summary.upcoming}
        completed={summary.completed}
        cancelled={summary.cancelled}
        loading={initialLoading}
      />

      {/* List */}
      {initialLoading ? (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-28 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-28 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
        </div>
      ) : (
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
              console.error("Failed to open appointment modal", err);
              setApptData(null);
              toast.error("Không tải được chi tiết cuộc hẹn");
            } finally {
              setApptLoading(false);
            }
          }}
          onRefresh={loadAppointments}
        />
      )}
      {/* Appointment details modal */}
      <Modal open={apptModalOpen} onClose={() => { setApptModalOpen(false); setApptData(null); }} className="bg-white rounded-xl shadow-lg max-w-4xl w-full p-4">
        <div className="space-y-4 text-sm w-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-semibold">Chi tiết cuộc hẹn</div>
              <div className="text-xs text-muted-foreground mt-1">Mã cuộc hẹn: <span className="font-mono ml-2">{apptData?._id ?? '-'}</span></div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(apptData?.appointmentStatus)}`}>
                {getCombinedAppointmentStatusLabel(apptData) ?? apptData?.appointmentStatus ?? 'UNKNOWN'}
              </span>
              <div className="flex items-center gap-2">
                {/* Hide rating button if an existing review is present */}
                  {/* {apptData?.appointmentStatus !== AppointmentStatus.COMPLETED &&
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
                )} */}
                {!existingReview && apptData?.appointmentStatus === AppointmentStatus.COMPLETED && (
                  <Button size="sm" onClick={handleOpenRatingModal} disabled={!apptData}>Đánh giá buổi khám</Button>
                )}
              </div>
            </div>
          </div>

          {apptLoading ? (
            <div className="py-8 text-center">Đang tải...</div>
          ) : apptData ? (
            <>
            {getCombinedAppointmentStatusLabel(apptData) && (
              <div className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${getCombinedAppointmentStatusClass(apptData)}`}>
                {getCombinedAppointmentStatusLabel(apptData)}
              </div>
            )}
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
            </>
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
    </div>
  );
}