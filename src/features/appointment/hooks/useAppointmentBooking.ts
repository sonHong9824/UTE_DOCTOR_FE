"use client";

import { BroadBookingPayload } from "@/apis/appointment/appointment.api";
import { appointmentService } from "@/features/appointment/services/appointment.service";
import {
  AppointmentBookingFormValues,
  BookingLifecycleState,
  BookingStrategy,
  DoctorOption,
  DoctorPayload,
  SpecialtyOption,
} from "@/features/appointment/types/appointment.types";
import { getTodayLocalDate } from "@/features/appointment/utils/appointment-date";
import { TimeSlotDto } from "@/types/timeslot.dto";
import { assertValidISO, buildZonedISO, getCurrentLocalTimeHHmm, toLocalDateInput, toUTCISOString } from "@/utils/time.util";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const APPOINTMENT_DEPOSIT_AMOUNT = 100000;
const DEPOSIT_PAYMENT_POLL_INTERVAL_MS = 3000;
const DEPOSIT_POPUP_CHECK_INTERVAL_MS = 1000;
const DEPOSIT_PAYMENT_TIMEOUT_MS = 16 * 60 * 1000;
const PENDING_DEPOSIT_STORAGE_KEY = "appointment.pendingDeposit";

const getBookingErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "response" in error) {
    const response = error as { response?: { data?: { message?: string } } };
    return response.response?.data?.message || "Có lỗi xảy ra khi đặt lịch";
  }

  return "Có lỗi xảy ra khi đặt lịch";
};

const initialForm = (): AppointmentBookingFormValues => ({
  appointmentDate: getTodayLocalDate(),
  hospitalName: "Bệnh viện Đa khoa",
  specialty: "",
  timeSlotId: "",
  doctor: null,
  serviceType: "KHAM_DICH_VU",
  visitType: "OFFLINE",
  paymentCategory: "DICH_VU",
  depositAmount: APPOINTMENT_DEPOSIT_AMOUNT,
  paymentMethod: "VNPAY",
  reasonForAppointment: "",
});

export const useAppointmentBooking = (initialStrategy: BookingStrategy = "NORMAL") => {
  const router = useRouter();
  const [bookingStrategy, setBookingStrategy] = useState<BookingStrategy>(initialStrategy);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
  const [doctorSuggestions, setDoctorSuggestions] = useState<DoctorOption[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorPayload | null>(null);

  const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
  const [specialtySearchTerm, setSpecialtySearchTerm] = useState("");
  const [specialtySuggestions, setSpecialtySuggestions] = useState<SpecialtyOption[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyOption | null>(null);
  const [showSpecialtySuggestions, setShowSpecialtySuggestions] = useState(false);
  const [isDoctorFocused, setIsDoctorFocused] = useState(false);

  const [formData, setFormData] = useState<AppointmentBookingFormValues>(initialForm);
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingLifecycleState, setBookingLifecycleState] = useState<BookingLifecycleState>("IDLE");
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);
  const [isPopupClosedEarly, setIsPopupClosedEarly] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState("Waiting for deposit payment...");

  const popupRef = useRef<Window | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paymentHandledRef = useRef(false);
  const didRestorePendingDepositRef = useRef(false);
  const popupClosedEarlyRef = useRef(false);
  // Tracks whether the in-flight deposit belongs to a broad booking. A broad booking's
  // appointment stays PENDING (awaiting receptionist assignment) even after the deposit is
  // paid, so the deposit poller must resolve to AWAITING_ASSIGNMENT, not CONFIRMED.
  const pendingIsBroadRef = useRef(false);

  const getTimeSlotDisplay = (slot: TimeSlotDto) => `${slot.label} (${slot.start} - ${slot.end})`;

  const isWaitingForPayment = bookingLifecycleState === "PENDING_PAYMENT";

  const clearPendingDeposit = useCallback(() => {
    window.localStorage.removeItem(PENDING_DEPOSIT_STORAGE_KEY);
  }, []);

  const rememberPendingDeposit = useCallback((appointmentId: string, paymentUrl: string, paymentId?: string | null, isBroad = false) => {
    window.localStorage.setItem(PENDING_DEPOSIT_STORAGE_KEY, JSON.stringify({
      appointmentId,
      paymentUrl,
      paymentId: paymentId || null,
      broad: isBroad,
      expiresAt: Date.now() + DEPOSIT_PAYMENT_TIMEOUT_MS,
    }));
  }, []);

  const clearPaymentWatchers = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    if (popupCheckIntervalRef.current) {
      clearInterval(popupCheckIntervalRef.current);
      popupCheckIntervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const closePaymentPopup = useCallback(() => {
    try {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    } catch {
      // Cross-origin payment windows may prevent inspection in some browsers.
    } finally {
      popupRef.current = null;
    }
  }, []);

  const handleDepositSuccess = useCallback(() => {
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;
    clearPaymentWatchers();
    closePaymentPopup();
    clearPendingDeposit();
    setLoading(false);
    setBookingLifecycleState("CONFIRMED");
    setSuccessMessage("Payment confirmed. Your appointment has been booked.");
    setShowSuccessModal(true);
    router.refresh();
  }, [clearPaymentWatchers, clearPendingDeposit, closePaymentPopup, router]);

  // Broad DICH_VU: deposit paid, but the appointment is NOT confirmed yet — a receptionist
  // still has to assign a doctor/slot. Show the waiting-assignment state (never a confirmed
  // doctor/time), distinct from the normal CONFIRMED path above.
  const handleBroadDepositPaid = useCallback(() => {
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;
    clearPaymentWatchers();
    closePaymentPopup();
    clearPendingDeposit();
    setLoading(false);
    setBookingLifecycleState("AWAITING_ASSIGNMENT");
    setSuccessMessage("Đã thanh toán phí giữ chỗ. Đang chờ lễ tân phân công bác sĩ.");
    setShowSuccessModal(true);
    router.refresh();
  }, [clearPaymentWatchers, clearPendingDeposit, closePaymentPopup, router]);

  const refreshSlotsAfterPaymentEnd = useCallback(() => {
    const refresh = async () => {
      try {
        const slots = formData.doctor?.id
          ? await appointmentService.getTimeSlotsByDoctorAndDate({
              doctorId: formData.doctor.id,
              date: formData.appointmentDate,
            })
          : await appointmentService.getAllTimeSlots();

        setTimeSlots(slots);
      } catch (error) {
        console.error("Error refreshing timeslots after payment:", error);
      }
    };

    void refresh();
  }, [formData.appointmentDate, formData.doctor?.id]);

  const handleDepositFailure = useCallback((message?: string) => {
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;
    clearPaymentWatchers();
    closePaymentPopup();
    clearPendingDeposit();
    setLoading(false);
    setBookingLifecycleState("FAILED");
    setErrorMessage(message || "Payment failed or expired. Please try again.");
    setShowErrorModal(true);
    refreshSlotsAfterPaymentEnd();
  }, [clearPaymentWatchers, clearPendingDeposit, closePaymentPopup, refreshSlotsAfterPaymentEnd]);

  const handleNoShowTerminal = useCallback(() => {
    if (paymentHandledRef.current) return;
    paymentHandledRef.current = true;
    clearPaymentWatchers();
    closePaymentPopup();
    clearPendingDeposit();
    setLoading(false);
    setBookingLifecycleState("NO_SHOW");
    setErrorMessage("Lịch khám này đã được ghi nhận là không đến khám.");
    setShowErrorModal(true);
  }, [clearPaymentWatchers, clearPendingDeposit, closePaymentPopup]);

  const handleDepositPollingError = useCallback((error: unknown) => {
    const status = typeof error === "object" && error && "response" in error
      ? (error as { response?: { status?: number } }).response?.status
      : undefined;

    if (status === 404) {
      handleDepositFailure("Appointment not found. Please choose another slot.");
      return;
    }

    if (status === 403) {
      handleDepositFailure("You do not have permission to check this appointment.");
      return;
    }

    if (status === 401) {
      handleDepositFailure("Your session has expired. Please sign in again.");
      return;
    }

    setPaymentStatusMessage("Unable to check payment status. Retrying...");
  }, [handleDepositFailure]);

  const checkDepositStatus = useCallback(async (appointmentId: string) => {
    const appointment = await appointmentService.getDepositStatus(appointmentId);
    const { appointmentStatus, depositStatus, isConfirmed, isTerminal } = appointment;

    if (depositStatus === "PAID") {
      // Broad booking resolves on deposit PAID alone (it never auto-confirms — a
      // receptionist must assign a doctor); normal booking waits for confirmation too.
      if (pendingIsBroadRef.current) {
        handleBroadDepositPaid();
        return "PAID";
      }
      if (isConfirmed) {
        handleDepositSuccess();
        return "PAID";
      }
    }

    if (appointmentStatus === "NO_SHOW") {
      handleNoShowTerminal();
      return "NO_SHOW";
    }

    if (isTerminal || depositStatus === "FAILED" || appointmentStatus === "FAILED" || appointmentStatus === "CANCELLED") {
      handleDepositFailure();
      return "FAILED";
    }

    setPaymentStatusMessage(popupClosedEarlyRef.current ? "Checking payment status..." : "Waiting for deposit payment...");
    return "PENDING";
  }, [handleBroadDepositPaid, handleDepositFailure, handleDepositSuccess, handleNoShowTerminal]);

  const startDepositPolling = useCallback((appointmentId: string, timeoutMs = DEPOSIT_PAYMENT_TIMEOUT_MS) => {
    clearPaymentWatchers();
    setPaymentStatusMessage("Waiting for deposit payment...");

    pollIntervalRef.current = setInterval(() => {
      void checkDepositStatus(appointmentId).catch(handleDepositPollingError);
    }, DEPOSIT_PAYMENT_POLL_INTERVAL_MS);

    popupCheckIntervalRef.current = setInterval(() => {
      if (!popupRef.current || !popupRef.current.closed) return;

      clearInterval(popupCheckIntervalRef.current!);
      popupCheckIntervalRef.current = null;
      popupClosedEarlyRef.current = true;
      setIsPopupClosedEarly(true);
      setPaymentStatusMessage("Checking payment status...");
    }, DEPOSIT_POPUP_CHECK_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (paymentHandledRef.current) return;
      clearPaymentWatchers();
      closePaymentPopup();
      clearPendingDeposit();
      setLoading(false);
      setBookingLifecycleState("PAYMENT_TIMEOUT");
      setErrorMessage("Payment remains pending for too long. Please try again.");
      setShowErrorModal(true);
      refreshSlotsAfterPaymentEnd();
    }, timeoutMs);

    void checkDepositStatus(appointmentId).catch(handleDepositPollingError);
  }, [
    checkDepositStatus,
    clearPaymentWatchers,
    clearPendingDeposit,
    closePaymentPopup,
    handleDepositPollingError,
    refreshSlotsAfterPaymentEnd,
  ]);

  const openDepositPaymentWindow = useCallback((paymentUrl: string) => {
    let popup = popupRef.current && !popupRef.current.closed ? popupRef.current : null;

    if (popup) {
      try {
        popup.location.href = paymentUrl;
      } catch {
        popup = null;
      }
    }

    if (!popup) {
      popup = window.open(paymentUrl, "appointmentDepositPayment", "width=900,height=700");
      popupRef.current = popup;
    }

    setIsPopupBlocked(!popup);

    if (!popup) {
      setErrorMessage("Trình duyệt đã chặn cửa sổ thanh toán. Vui lòng cho phép popup hoặc bấm nút mở thanh toán.");
      setShowErrorModal(true);
      return false;
    }

    try {
      popup.focus();
    } catch {
      // Focus is best effort only.
    }

    return true;
  }, []);

  const prepareDepositPaymentWindow = useCallback(() => {
    const popup = window.open("", "appointmentDepositPayment", "width=900,height=700");
    popupRef.current = popup;
    setIsPopupBlocked(!popup);

    if (!popup) return;

    try {
      popup.document.write("<p style=\"font-family: sans-serif; padding: 24px;\">Dang tao lien ket thanh toan...</p>");
      popup.document.close();
      popup.focus();
    } catch {
      // The actual payment URL will still be assigned after booking succeeds.
    }
  }, []);

  const handleOpenPaymentWindow = useCallback(() => {
    if (!pendingPaymentUrl || !pendingAppointmentId) return;

    setLoading(true);
    setBookingLifecycleState("PENDING_PAYMENT");
    setShowErrorModal(false);
    setErrorMessage("");
    popupClosedEarlyRef.current = false;
    setIsPopupClosedEarly(false);
    paymentHandledRef.current = false;
    openDepositPaymentWindow(pendingPaymentUrl);
    startDepositPolling(pendingAppointmentId);
  }, [openDepositPaymentWindow, pendingAppointmentId, pendingPaymentUrl, startDepositPolling]);

  const handleRefreshDepositStatus = useCallback(() => {
    if (!pendingAppointmentId) return;
    setPaymentStatusMessage("Checking payment status...");
    void checkDepositStatus(pendingAppointmentId).catch(handleDepositPollingError);
  }, [checkDepositStatus, handleDepositPollingError, pendingAppointmentId]);

  const handleCancelPaymentWaiting = useCallback(() => {
    clearPaymentWatchers();
    closePaymentPopup();
    setLoading(false);
    setBookingLifecycleState("PAYMENT_RETRY");
    setErrorMessage("Thanh toán phí giữ chỗ chưa được xác nhận. Bạn có thể mở lại cửa sổ thanh toán hoặc đặt lịch lại.");
    setShowErrorModal(true);
    refreshSlotsAfterPaymentEnd();
  }, [clearPaymentWatchers, closePaymentPopup, refreshSlotsAfterPaymentEnd]);



  const fetchTimeSlots = async (doctorId?: string, date?: string, currentTimeSlotId?: string) => {
    try {
      const selectedDate = date || formData.appointmentDate;

      const slots = doctorId
        ? await appointmentService.getTimeSlotsByDoctorAndDate({ doctorId, date: selectedDate })
        : await appointmentService.getAllTimeSlots();

      setTimeSlots(slots);

      const exists = slots.some((s) => s.id === (currentTimeSlotId || formData.timeSlotId));
      if (!exists) {
        setFormData((prev) => ({ ...prev, timeSlotId: slots.length ? slots[0].id : "" }));
      }
    } catch (error) {
      console.error("Error fetching timeslots:", error);
      setTimeSlots([]);
      setFormData((prev) => ({ ...prev, timeSlotId: "" }));
    }
  };

  const handleChange = (
    name: keyof AppointmentBookingFormValues,
    value: AppointmentBookingFormValues[keyof AppointmentBookingFormValues]
  ) => {
    setFormData((prev) => {
      if (name === "paymentCategory") {
        if (value === "BHYT") {
          return {
            ...prev,
            paymentCategory: "BHYT",
            serviceType: "KHAM_BHYT",
            depositAmount: 0,
            paymentMethod: "OFFLINE",
          };
        }

        return {
          ...prev,
          paymentCategory: "DICH_VU",
          serviceType: "KHAM_DICH_VU",
          depositAmount: prev.depositAmount && prev.depositAmount > 0 ? prev.depositAmount : APPOINTMENT_DEPOSIT_AMOUNT,
          paymentMethod: "VNPAY",
        };
      }

      if (name === "depositAmount") {
        return {
          ...prev,
          depositAmount: Math.max(0, Number(value) || 0),
        };
      }

      return { ...prev, [name]: value };
    });
  };

  const handleSpecialtySearch = (value: string) => {
    setSpecialtySearchTerm(value || "");
    if (!value) {
      setSpecialtySuggestions([]);
      setSelectedSpecialty(null);
      setFormData((prev) => ({ ...prev, specialty: null, doctor: null, timeSlotId: "" }));
    }
  };

  const handleSelectSpecialty = (spec: SpecialtyOption) => {
    setSelectedSpecialty(spec);
    setFormData((prev) => ({ ...prev, specialty: spec._id, doctor: null, timeSlotId: "" }));
    setSpecialtySearchTerm(spec.name);
    setSpecialtySuggestions([]);
    setDoctorSearchTerm("");
    setDoctorSuggestions([]);
    setSelectedDoctor(null);
    setShowSpecialtySuggestions(false);
  };

  const handleSpecialtyBlur = () => {
    if (!selectedSpecialty || selectedSpecialty.name !== specialtySearchTerm) {
      setSelectedSpecialty(null);
      setFormData((prev) => ({ ...prev, specialty: null }));
    }
  };

  const handleDoctorSearch = (value: string) => {
    setDoctorSearchTerm(value);
    if (!value) {
      setDoctorSuggestions([]);
    }
  };

  const handleDoctorSelect = async (doc: DoctorOption) => {
    setSelectedDoctor(doc);
    setDoctorSearchTerm(doc.name);
    setFormData((prev) => ({
      ...prev,
      doctor: {
        id: doc.id,
        name: doc.name,
        email: doc.email,
      },
      timeSlotId: "",
    }));

    await fetchTimeSlots(doc.id, formData.appointmentDate, "");
  };

  const handleDoctorBlur = () => {
    if (!selectedDoctor || selectedDoctor.name !== doctorSearchTerm) {
      setSelectedDoctor(null);
      setFormData((prev) => ({ ...prev, doctor: null }));
    }
  };

  const handleDateChange = async (date: Date | null) => {
    if (!date) return;
    const localDate = toLocalDateInput(date);

    setFormData((prev) => ({
      ...prev,
      appointmentDate: localDate,
      ...(prev.doctor ? { timeSlotId: "" } : {}),
    }));

    await fetchTimeSlots(formData.doctor?.id, localDate, "");
  };





  const handleSubmit = async () => {
    clearPaymentWatchers();
    closePaymentPopup();
    paymentHandledRef.current = false;
    setLoading(true);
    setBookingLifecycleState("SUBMITTING");
    setPendingAppointmentId(null);
    setPendingPaymentUrl(null);
    setPendingPaymentId(null);
    setIsPopupBlocked(false);
    popupClosedEarlyRef.current = false;
    setIsPopupClosedEarly(false);
    setResponse(null);
    setShowErrorModal(false);
    setShowSuccessModal(false);
    setErrorMessage("");
    setSuccessMessage("");
    clearPendingDeposit();
    pendingIsBroadRef.current = bookingStrategy === "BROAD";

    // ── Broad booking: no doctor/slot/date. Backend creates a PENDING appointment with
    // assignmentStatus=AWAITING_ASSIGNMENT; DICH_VU assignment work opens after deposit success. ──
    if (bookingStrategy === "BROAD") {
      const normalizedPaymentCategory: AppointmentBookingFormValues["paymentCategory"] =
        formData.paymentCategory === "BHYT" ? "BHYT" : "DICH_VU";
      const normalizedDeposit = normalizedPaymentCategory === "BHYT"
        ? 0
        : Math.max(0, Number(formData.depositAmount) || 0);
      const normalizedPaymentMethod: AppointmentBookingFormValues["paymentMethod"] =
        normalizedPaymentCategory === "BHYT" ? "OFFLINE" : "VNPAY";

      // Backend validates broad booking specialty as an ObjectId.
      const broadSpecialtyId = selectedSpecialty?._id?.trim() || undefined;
      const broadReason = formData.reasonForAppointment?.trim() || undefined;
      if (!broadSpecialtyId && !broadReason) {
        setLoading(false);
        setBookingLifecycleState("IDLE");
        setErrorMessage("Vui lòng chọn chuyên khoa hoặc nhập lý do khám để lễ tân phân công bác sĩ.");
        setShowErrorModal(true);
        return;
      }
      if (normalizedPaymentCategory === "DICH_VU" && normalizedDeposit <= 0) {
        setLoading(false);
        setBookingLifecycleState("IDLE");
        setErrorMessage("Phí giữ chỗ phải lớn hơn 0 cho lịch khám dịch vụ.");
        setShowErrorModal(true);
        return;
      }

      const broadPayload: BroadBookingPayload = {
        broadBooking: true,
        specialty: broadSpecialtyId,
        reasonForAppointment: broadReason,
        paymentCategory: normalizedPaymentCategory,
        paymentMethod: normalizedPaymentMethod,
        serviceType: normalizedPaymentCategory === "BHYT" ? "KHAM_BHYT" : "KHAM_DICH_VU",
        ...(normalizedPaymentCategory === "DICH_VU" ? { depositAmount: normalizedDeposit } : {}),
      };

      if (normalizedPaymentCategory === "DICH_VU") {
        prepareDepositPaymentWindow();
      }

      try {
        const res = await appointmentService.bookBroad(broadPayload);
        setResponse(res);

        const paymentUrl = res?.data?.paymentUrl;
        if (paymentUrl) {
          // DICH_VU broad: reuse the existing deposit popup + polling. The poller resolves
          // to AWAITING_ASSIGNMENT (not CONFIRMED) because pendingIsBroadRef is set.
          const appointmentId = res.data?.appointmentId;
          if (!appointmentId) {
            closePaymentPopup();
            setLoading(false);
            setBookingLifecycleState("FAILED");
            setErrorMessage("Đặt khám cần thanh toán phí giữ chỗ nhưng backend không trả về mã lịch hẹn.");
            setShowErrorModal(true);
            return;
          }
          setPendingAppointmentId(appointmentId);
          setPendingPaymentUrl(paymentUrl);
          setPendingPaymentId(res.data?.depositPaymentId || null);
          rememberPendingDeposit(appointmentId, paymentUrl, res.data?.depositPaymentId, true);
          setBookingLifecycleState("PENDING_PAYMENT");
          const popupOpened = openDepositPaymentWindow(paymentUrl);
          startDepositPolling(appointmentId);
          if (!popupOpened) {
            setLoading(false);
            setBookingLifecycleState("PAYMENT_RETRY");
          }
          return;
        }

        // BHYT broad (no deposit) — or any broad response without a payment URL.
        if (res?.code === "PENDING" || res?.code === "SUCCESS") {
          closePaymentPopup();
          setLoading(false);
          setBookingLifecycleState("AWAITING_ASSIGNMENT");
          setSuccessMessage("Đã tạo yêu cầu đặt khám. Đang chờ lễ tân phân công bác sĩ.");
          setShowSuccessModal(true);
          return;
        }

        closePaymentPopup();
        setErrorMessage(res?.message || "Đặt khám thất bại. Vui lòng thử lại.");
        setShowErrorModal(true);
      } catch (error: unknown) {
        closePaymentPopup();
        const message = getBookingErrorMessage(error);
        setErrorMessage(message);
        setShowErrorModal(true);
        setResponse({ success: false, error: message });
      } finally {
        setLoading(false);
      }
      return;
    }

    const selectedSlot = timeSlots.find((slot) => slot.id === formData.timeSlotId);
    if (!selectedSlot) {
      setLoading(false);
      setBookingLifecycleState("IDLE");
      setErrorMessage("Vui lòng chọn khung giờ hợp lệ trước khi đặt lịch.");
      setShowErrorModal(true);
      return;
    }

    const appointmentDateTime = buildZonedISO(formData.appointmentDate, selectedSlot.start);
    const bookingDate = toLocalDateInput(new Date());
    const bookingTime = getCurrentLocalTimeHHmm();
    const bookingDateTime = buildZonedISO(bookingDate, bookingTime);
    assertValidISO(appointmentDateTime);
    assertValidISO(bookingDateTime);

    const appointmentDateTimeUtc = toUTCISOString(appointmentDateTime);
    const bookingDateTimeUtc = toUTCISOString(bookingDateTime);

    const normalizedPaymentCategory: AppointmentBookingFormValues["paymentCategory"] =
      formData.paymentCategory === "BHYT" ? "BHYT" : "DICH_VU";
    const normalizedDeposit = normalizedPaymentCategory === "BHYT"
      ? 0
      : Math.max(0, Number(formData.depositAmount) || 0);
    const normalizedPaymentMethod: AppointmentBookingFormValues["paymentMethod"] =
      normalizedPaymentCategory === "BHYT" ? "OFFLINE" : "VNPAY";

    if (normalizedPaymentCategory === "DICH_VU" && normalizedDeposit <= 0) {
      setLoading(false);
      setBookingLifecycleState("IDLE");
      setErrorMessage("Phí giữ chỗ phải lớn hơn 0 cho lịch khám dịch vụ.");
      setShowErrorModal(true);
      return;
    }

    const payload = {
      hospitalName: formData.hospitalName,
      specialty: formData.specialty,
      timeSlotId: formData.timeSlotId,
      doctor: formData.doctor,
      serviceType: normalizedPaymentCategory === "BHYT" ? "KHAM_BHYT" : formData.serviceType,
      visitType: formData.visitType,
      reasonForAppointment: formData.reasonForAppointment,
      appointmentDate: appointmentDateTimeUtc,
      bookingDate: bookingDateTimeUtc,
      paymentCategory: normalizedPaymentCategory,
      paymentMethod: normalizedPaymentMethod,
      ...(normalizedPaymentCategory === "DICH_VU" ? { depositAmount: normalizedDeposit } : { depositAmount: 0 }),
    };

    if (normalizedPaymentCategory === "DICH_VU") {
      prepareDepositPaymentWindow();
    }

    try {
      const res = await appointmentService.book(payload);
      setResponse(res);

      if (res?.code === "SUCCESS") {
        setLoading(false);
        setBookingLifecycleState("CONFIRMED");
        setSuccessMessage(
          normalizedPaymentCategory === "BHYT"
            ? "Lịch khám BHYT đã được xác nhận. Không yêu cầu đặt cọc."
            : "Lịch hẹn đã được xác nhận."
        );
        setShowSuccessModal(true);
        return;
      }

      if (res?.code === "PENDING") {
        const paymentUrl = res.data?.paymentUrl;
        if (paymentUrl) {
          setSuccessMessage("Lịch hẹn đang chờ thanh toán phí giữ chỗ. Đang chuyển bạn đến VNPay...");
          setShowSuccessModal(true);
          const appointmentId = res.data?.appointmentId;
          if (!appointmentId) {
            setLoading(false);
            setBookingLifecycleState("FAILED");
            setErrorMessage("Lịch khám dịch vụ cần thanh toán phí giữ chỗ nhưng backend không trả về mã lịch hẹn.");
            setShowErrorModal(true);
            return;
          }

          setShowSuccessModal(false);
          setPendingAppointmentId(appointmentId);
          setPendingPaymentUrl(paymentUrl);
          setPendingPaymentId(res.data?.depositPaymentId || null);
          rememberPendingDeposit(appointmentId, paymentUrl, res.data?.depositPaymentId);
          setBookingLifecycleState("PENDING_PAYMENT");
          const popupOpened = openDepositPaymentWindow(paymentUrl);
          startDepositPolling(appointmentId);

          if (!popupOpened) {
            setLoading(false);
            setBookingLifecycleState("PAYMENT_RETRY");
          }
          return;
        }

        setErrorMessage("Lịch khám dịch vụ cần thanh toán phí giữ chỗ nhưng backend không trả về liên kết thanh toán.");
        setShowErrorModal(true);
        return;
      }

      setErrorMessage(res?.message || "Đặt lịch thất bại. Vui lòng thử lại.");
      setShowErrorModal(true);
    } catch (error: unknown) {
      closePaymentPopup();
      const message = getBookingErrorMessage(error);
      setErrorMessage(message);
      setShowErrorModal(true);
      setResponse({ success: false, error: message });
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [slots, specialties] = await Promise.all([
          appointmentService.getAllTimeSlots(),
          appointmentService.getSpecialties(),
        ]);

        setTimeSlots(slots);
        setSpecialties(specialties);
        if (slots.length > 0) {
          setFormData((prev) => ({ ...prev, timeSlotId: slots[0].id }));
        }
      } catch (error) {
        console.error("Failed to load appointment initial data:", error);
      }
    };

    void loadInitialData();

    return () => {
      // cleanup
    };
  }, []);

  useEffect(() => {
    return () => {
      clearPaymentWatchers();
      closePaymentPopup();
    };
  }, [clearPaymentWatchers, closePaymentPopup]);

  useEffect(() => {
    if (didRestorePendingDepositRef.current) return;
    didRestorePendingDepositRef.current = true;

    const rawPendingDeposit = window.localStorage.getItem(PENDING_DEPOSIT_STORAGE_KEY);
    if (!rawPendingDeposit) return;

    try {
      const pendingDeposit = JSON.parse(rawPendingDeposit) as {
        appointmentId?: string;
        paymentUrl?: string;
        paymentId?: string | null;
        broad?: boolean;
        expiresAt?: number;
      };

      if (!pendingDeposit.appointmentId || !pendingDeposit.paymentUrl || !pendingDeposit.expiresAt || pendingDeposit.expiresAt <= Date.now()) {
        clearPendingDeposit();
        return;
      }

      pendingIsBroadRef.current = Boolean(pendingDeposit.broad);
      setPendingAppointmentId(pendingDeposit.appointmentId);
      setPendingPaymentUrl(pendingDeposit.paymentUrl);
      setPendingPaymentId(pendingDeposit.paymentId || null);
      setBookingLifecycleState("PENDING_PAYMENT");
      popupClosedEarlyRef.current = true;
      setIsPopupClosedEarly(true);
      setPaymentStatusMessage("Checking payment status...");
      startDepositPolling(pendingDeposit.appointmentId, pendingDeposit.expiresAt - Date.now());
    } catch {
      clearPendingDeposit();
    }
  }, [clearPendingDeposit, startDepositPolling]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!specialtySearchTerm) {
        setSpecialtySuggestions([]);
        return;
      }

      const filtered = specialties.filter((spec) =>
        spec.name.toLowerCase().includes(specialtySearchTerm.toLowerCase())
      );
      setSpecialtySuggestions(filtered);
    }, 300);

    return () => clearTimeout(timeout);
  }, [specialties, specialtySearchTerm]);

  useEffect(() => {
    if (!doctorSearchTerm && !selectedSpecialty) {
      setDoctorSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const doctors = await appointmentService.getDoctorsBySpecialty({
          specialtyId: selectedSpecialty?._id || "",
          keyword: doctorSearchTerm || "",
        });

        setDoctorSuggestions(doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [doctorSearchTerm, selectedSpecialty]);



  return {
    formData,
    bookingStrategy,
    setBookingStrategy,
    loading,
    bookingLifecycleState,
    isWaitingForPayment,
    pendingAppointmentId,
    pendingPaymentUrl,
    pendingPaymentId,
    isPopupBlocked,
    isPopupClosedEarly,
    paymentStatusMessage,
    response,
    showSuccessModal,
    successMessage,
    showErrorModal,
    errorMessage,
    timeSlots,
    specialtySearchTerm,
    specialtySuggestions,
    doctorSearchTerm,
    doctorSuggestions,
    isDoctorFocused,
    showSpecialtySuggestions,

    setShowSuccessModal,
    setShowErrorModal,
    setIsDoctorFocused,
    setShowSpecialtySuggestions,

    handleChange,
    handleDateChange,
    handleSpecialtySearch,
    handleSelectSpecialty,
    handleSpecialtyBlur,
    handleDoctorSearch,
    handleDoctorSelect,
    handleDoctorBlur,
    handleSubmit,
    handleOpenPaymentWindow,
    handleRefreshDepositStatus,
    handleCancelPaymentWaiting,
    getTimeSlotDisplay,
  };
};
