"use client";

import { appointmentService } from "@/features/appointment/services/appointment.service";
import {
    AppointmentBookingFormValues,
    DoctorOption,
    DoctorPayload,
    SpecialtyOption,
} from "@/features/appointment/types/appointment.types";
import { getTodayLocalDate } from "@/features/appointment/utils/appointment-date";
import { TimeSlotDto } from "@/types/timeslot.dto";
import { assertValidISO, buildZonedISO, getCurrentLocalTimeHHmm, toLocalDateInput, toUTCISOString } from "@/utils/time.util";
import { useEffect, useState } from "react";

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

  const getTimeSlotDisplay = (slot: TimeSlotDto) => `${slot.label} (${slot.start} - ${slot.end})`;



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





  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    setShowErrorModal(false);
    setShowSuccessModal(false);
    setErrorMessage("");
    setSuccessMessage("");

    const selectedSlot = timeSlots.find((slot) => slot.id === formData.timeSlotId);
    if (!selectedSlot) {
      setLoading(false);
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

      if (res?.code === "SUCCESS" || res?.code === "PENDING") {
        setSuccessMessage("Lịch hẹn đã được đặt thành công. Bác sĩ sẽ xác nhận lịch hẹn của bạn.");
        setShowSuccessModal(true);
        return;
      }

      setErrorMessage(res?.message || "Đặt lịch thất bại. Vui lòng thử lại.");
      setShowErrorModal(true);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || error?.message || "Có lỗi xảy ra khi đặt lịch");
      setShowErrorModal(true);
      setResponse({ success: false, error: error?.message || "Có lỗi xảy ra" });
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
    getTimeSlotDisplay,
  };
};
