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
import { getTodayLocalDate, toUtcIsoDate } from "@/features/appointment/utils/appointment-date";
import { TimeHelper } from "@/lib/time";
import { TimeSlotDto } from "@/types/timeslot.dto";
import { useEffect, useMemo, useRef, useState } from "react";

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 6 * 60 * 1000;

const initialForm = (): AppointmentBookingFormValues => ({
  date: getTodayLocalDate(),
  hospitalName: "Bệnh viện Đa khoa",
  specialty: "",
  timeSlotId: "",
  doctor: null,
  serviceType: "KHAM_DICH_VU",
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
  const [coinBalance, setCoinBalance] = useState(0);
  const [loadingCoin, setLoadingCoin] = useState(true);

  const [bookingLifecycleState, setBookingLifecycleState] = useState<BookingLifecycleState>("IDLE");
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const pollingIntervalRef = useRef<number | null>(null);
  const pollingStartedAtRef = useRef<number | null>(null);

  const getTimeSlotDisplay = (slot: TimeSlotDto) => `${slot.label} (${slot.start} - ${slot.end})`;

  const stopStatusPolling = () => {
    if (pollingIntervalRef.current !== null) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingStartedAtRef.current = null;
  };

  const openPaymentWindow = () => {
    if (!paymentUrl) return;
    window.open(paymentUrl, "_blank", "noopener,noreferrer");
  };

  const finalizeAsConfirmed = (appointment: AppointmentDetail) => {
    stopStatusPolling();
    setBookingLifecycleState("CONFIRMED");
    setSuccessMessage("Lịch hẹn đã được xác nhận sau thanh toán.");
    setShowSuccessModal(true);
    setResponse({ success: true, data: appointment });
  };

  const finalizeAsFailed = (message: string, appointment?: AppointmentDetail) => {
    stopStatusPolling();
    setBookingLifecycleState("FAILED");
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

  const fetchTimeSlots = async (doctorId?: string, date?: string, currentTimeSlotId?: string) => {
    try {
      const slots = doctorId
        ? await appointmentService.getTimeSlotsByDoctorAndDate({ doctorId, date: date || formData.date })
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    await fetchTimeSlots(doc.id, formData.date, "");
  };

  const handleDoctorBlur = () => {
    if (!selectedDoctor || selectedDoctor.name !== doctorSearchTerm) {
      setSelectedDoctor(null);
      setFormData((prev) => ({ ...prev, doctor: null }));
    }
  };

  const handleDateChange = async (date: Date | null) => {
    if (!date) return;
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const localDate = TimeHelper.formatLocalDateOnly(normalized, "en-CA");

    setFormData((prev) => ({
      ...prev,
      date: localDate,
      ...(prev.doctor ? { timeSlotId: "" } : {}),
    }));

    await fetchTimeSlots(formData.doctor?.id, localDate, "");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setShowErrorModal(false);
    setShowSuccessModal(false);
    setErrorMessage("");
    setSuccessMessage("");
    setBookingLifecycleState("SUBMITTING");
    setPendingAppointmentId(null);
    setPaymentUrl(null);

    const payload = { ...formData, date: toUtcIsoDate(formData.date) };

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

        if (returnedPaymentUrl) {
          window.open(returnedPaymentUrl, "_blank", "noopener,noreferrer");
        }

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
        const [slots, wallet, specialties] = await Promise.all([
          appointmentService.getAllTimeSlots(),
          appointmentService.getWalletBalance(),
          appointmentService.getSpecialties(),
        ]);

        setTimeSlots(slots);
        setSpecialties(specialties);
        if (slots.length > 0) {
          setFormData((prev) => ({ ...prev, timeSlotId: slots[0].id }));
        }
        setCoinBalance(wallet);
      } catch (error) {
        console.error("Failed to load appointment initial data:", error);
      } finally {
        setLoadingCoin(false);
      }
    };

    void loadInitialData();

    return () => {
      stopStatusPolling();
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

  const canUseCoinPayment = useMemo(
    () => formData.paymentMethod === "COIN",
    [formData.paymentMethod]
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
    coinBalance,
    loadingCoin,
    specialtySearchTerm,
    specialtySuggestions,
    doctorSearchTerm,
    doctorSuggestions,
    isDoctorFocused,
    showSpecialtySuggestions,
    canUseCoinPayment,
    bookingLifecycleState,
    pendingAppointmentId,
    paymentUrl,

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
    openPaymentWindow,
    getTimeSlotDisplay,
  };
};
