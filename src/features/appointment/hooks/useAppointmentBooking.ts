"use client";

import { AppointmentStatus } from "@/enum/appointment-status.enum";
import { appointmentService } from "@/features/appointment/services/appointment.service";
import {
  AppointmentBookingFormValues,
  AppointmentDetail,
  BookingLifecycleState,
  DoctorOption,
  DoctorPayload,
  SpecialtyOption,
} from "@/features/appointment/types/appointment.types";
import { getTodayLocalDate } from "@/features/appointment/utils/appointment-date";
import { TimeSlotDto } from "@/types/timeslot.dto";
import { assertValidISO, buildZonedISO, getCurrentLocalTimeHHmm, toLocalDateInput, toUTCISOString } from "@/utils/time.util";
import { useEffect, useMemo, useRef, useState } from "react";

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 6 * 60 * 1000;

const initialForm = (): AppointmentBookingFormValues => ({
  appointmentDate: getTodayLocalDate(),
  hospitalName: "Bệnh viện Đa khoa",
  specialty: "",
  timeSlotId: "",
  doctor: null,
  serviceType: "KHAM_DICH_VU",
  visitType: "OFFLINE",
  paymentCategory: "DICH_VU",
  depositAmount: 100000,
  paymentMethod: "ONLINE",
  amount: 100000,
  reasonForAppointment: "",
  useCoin: false,
  coinsToUse: 0
});

export const useAppointmentBooking = () => {
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
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [bookingLifecycleState, setBookingLifecycleState] = useState<BookingLifecycleState>("IDLE");
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isPaymentWindowOpen, setIsPaymentWindowOpen] = useState(false);

  const pollingIntervalRef = useRef<number | null>(null);
  const pollingStartedAtRef = useRef<number | null>(null);
  const paymentWindowRef = useRef<Window | null>(null);
  const paymentWindowWatchRef = useRef<number | null>(null);

  const getTimeSlotDisplay = (slot: TimeSlotDto) => `${slot.label} (${slot.start} - ${slot.end})`;

  const stopStatusPolling = () => {
    if (pollingIntervalRef.current !== null) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingStartedAtRef.current = null;
  };

  const stopPaymentWindowWatch = () => {
    if (paymentWindowWatchRef.current !== null) {
      window.clearInterval(paymentWindowWatchRef.current);
      paymentWindowWatchRef.current = null;
    }
  };

  const clearPaymentWindowState = () => {
    stopPaymentWindowWatch();
    paymentWindowRef.current = null;
    setIsPaymentWindowOpen(false);
  };

  const openPaymentWindow = () => {
    if (!paymentUrl) return;

    const popup = window.open(paymentUrl, "_blank");
    if (!popup) {
      setErrorMessage("Không thể mở cổng thanh toán. Vui lòng cho phép popup và thử lại.");
      setShowErrorModal(true);
      return;
    }

    paymentWindowRef.current = popup;
    setIsPaymentWindowOpen(true);
    stopPaymentWindowWatch();
    paymentWindowWatchRef.current = window.setInterval(() => {
      if (paymentWindowRef.current?.closed) {
        clearPaymentWindowState();
      }
    }, 500);
  };

  const finalizeAsConfirmed = (appointment: AppointmentDetail) => {
    stopStatusPolling();
    clearPaymentWindowState();
    setBookingLifecycleState("CONFIRMED");
    setPendingAppointmentId(null);
    setPaymentUrl(null);
    setSuccessMessage("Lịch hẹn đã được xác nhận sau thanh toán.");
    setShowSuccessModal(true);
    setResponse({ success: true, data: appointment });
  };

  const finalizeAsFailed = (message: string, appointment?: AppointmentDetail) => {
    stopStatusPolling();
    clearPaymentWindowState();
    setBookingLifecycleState("FAILED");
    setPendingAppointmentId(null);
    setPaymentUrl(null);
    setErrorMessage(message);
    setShowErrorModal(true);
    setResponse({ success: false, data: appointment, error: message });
  };

  const pollAppointmentStatus = async (appointmentId: string) => {
    try {
      const appointment = await appointmentService.getAppointmentById(appointmentId);
      const status = appointment?.appointmentStatus;

      if (status === AppointmentStatus.CONFIRMED) {
        finalizeAsConfirmed(appointment);
        return;
      }

      if (status === AppointmentStatus.FAILED) {
        finalizeAsFailed("Thanh toán thất bại hoặc lịch hẹn đã hết hạn.", appointment);
        return;
      }

      if (status === AppointmentStatus.CANCELLED) {
        finalizeAsFailed("Lịch hẹn đã bị hủy.", appointment);
        return;
      }

      if (pollingStartedAtRef.current && Date.now() - pollingStartedAtRef.current > POLL_TIMEOUT_MS) {
        finalizeAsFailed("Đã quá thời gian chờ thanh toán. Vui lòng kiểm tra lại lịch hẹn.", appointment);
      }
    } catch (error) {
      console.error("Failed to poll appointment status", error);
    }
  };

  const startStatusPolling = (appointmentId: string) => {
    stopStatusPolling();
    pollingStartedAtRef.current = Date.now();

    void pollAppointmentStatus(appointmentId);
    pollingIntervalRef.current = window.setInterval(() => {
      void pollAppointmentStatus(appointmentId);
    }, POLL_INTERVAL_MS);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePaymentResultMessage = (event: MessageEvent) => {
      const data = event.data;

      if (!data || typeof data !== "object" || data.type !== "PAYMENT_RESULT") {
        return;
      }

      const resultOrderId = typeof data.orderId === "string" ? data.orderId : "";
      const resultStatus = typeof data.status === "string" ? data.status : "";

      if (!resultOrderId || resultOrderId !== pendingAppointmentId) {
        return;
      }

      if (resultStatus === "COMPLETED") {
        // Payment callback is authoritative for success. Stop polling immediately
        // to avoid timeout fallback after long device sleep/resume.
        stopStatusPolling();
        clearPaymentWindowState();
        setBookingLifecycleState("CONFIRMED");
        setPendingAppointmentId(null);
        setPaymentUrl(null);
        setSuccessMessage("Thanh toán thành công. Lịch hẹn của bạn đã được xác nhận.");
        setShowSuccessModal(true);
        void pollAppointmentStatus(resultOrderId);
        return;
      }

      if (resultStatus === "FAILED") {
        finalizeAsFailed("Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức khác.");
      }
    };

    window.addEventListener("message", handlePaymentResultMessage);

    return () => {
      window.removeEventListener("message", handlePaymentResultMessage);
    };
  }, [pendingAppointmentId]);

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

  const handleChange = (name: keyof AppointmentBookingFormValues, value: any) => {
    setFormData((prev) => {
      if (name === "paymentCategory") {
        if (value === "BHYT") {
          return {
            ...prev,
            paymentCategory: "BHYT",
            depositAmount: 0,
          };
        }

        return {
          ...prev,
          paymentCategory: "DICH_VU",
          depositAmount: prev.depositAmount && prev.depositAmount > 0 ? prev.depositAmount : 100000,
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

  const hasPendingPayment = useMemo(
    () => bookingLifecycleState === "PENDING_PAYMENT" && Boolean(pendingAppointmentId),
    [bookingLifecycleState, pendingAppointmentId]
  );

  const handleCancelPendingPayment = () => {
    stopStatusPolling();
    clearPaymentWindowState();
    setPendingAppointmentId(null);
    setPaymentUrl(null);
    setBookingLifecycleState("IDLE");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    if (hasPendingPayment) {
      setErrorMessage("Bạn đang có lịch hẹn chờ thanh toán. Vui lòng hoàn tất hoặc hủy phiên chờ trước khi đặt lịch mới.");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    setResponse(null);
    setShowErrorModal(false);
    setShowSuccessModal(false);
    setErrorMessage("");
    setSuccessMessage("");
    setBookingLifecycleState("SUBMITTING");
    clearPaymentWindowState();

    const selectedSlot = timeSlots.find((slot) => slot.id === formData.timeSlotId);
    if (!selectedSlot) {
      setLoading(false);
      setBookingLifecycleState("FAILED");
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
      normalizedPaymentCategory === "BHYT" ? "OFFLINE" : "ONLINE";

    const payload = {
      ...formData,
      appointmentDate: appointmentDateTimeUtc,
      bookingDate: bookingDateTimeUtc,
      paymentCategory: normalizedPaymentCategory,
      depositAmount: normalizedDeposit,
      paymentMethod: normalizedPaymentMethod,
      useCoin: false,
      coinsToUse: 0,
    };

    try {
      const res = await appointmentService.book(payload);
      setResponse(res);

      const appointmentId = res?.data?.appointmentId ?? null;
      const returnedPaymentUrl = res?.data?.paymentUrl ?? null;

      if (res?.code === "PENDING" && appointmentId) {
        setBookingLifecycleState("PENDING_PAYMENT");
        setPendingAppointmentId(appointmentId);
        setPaymentUrl(returnedPaymentUrl);
        setSuccessMessage("Đặt lịch thành công ở trạng thái chờ thanh toán. Vui lòng hoàn tất thanh toán để xác nhận.");
        setShowSuccessModal(true);

        startStatusPolling(appointmentId);
        return;
      }

      if (res?.code === "SUCCESS") {
        setBookingLifecycleState("CONFIRMED");
        setSuccessMessage("Lịch hẹn đã được xác nhận thành công.");
        setShowSuccessModal(true);
        return;
      }

      setBookingLifecycleState("FAILED");
      setErrorMessage(res?.message || "Đặt lịch thất bại. Vui lòng thử lại.");
      setShowErrorModal(true);
    } catch (error: any) {
      setBookingLifecycleState("FAILED");
      setErrorMessage(error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi đặt lịch");
      setShowErrorModal(true);
      setResponse({ success: false, error: error?.message || "Có lỗi xảy ra" });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryStatusCheck = async () => {
    if (!pendingAppointmentId) return;
    await pollAppointmentStatus(pendingAppointmentId);
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
      stopStatusPolling();
      if (paymentWindowRef.current && !paymentWindowRef.current.closed) {
        paymentWindowRef.current.close();
      }
      clearPaymentWindowState();
    };
  }, []);

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

  const isPaymentInteractionLocked = useMemo(
    () => bookingLifecycleState === "PENDING_PAYMENT" && isPaymentWindowOpen,
    [bookingLifecycleState, isPaymentWindowOpen]
  );

  return {
    formData,
    loading,
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
    hasPendingPayment,
    bookingLifecycleState,
    pendingAppointmentId,
    paymentUrl,
    isPaymentInteractionLocked,

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
    handleRetryStatusCheck,
    handleCancelPendingPayment,
    openPaymentWindow,
    getTimeSlotDisplay,
  };
};
