import { TimeSlotStatusEnum } from "@/enum/timeslot-status.enum";
import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { TimeSlotDto } from "@/types/timeslot.dto";

export const bookAppointment = async(form: any) =>
{
    try {
        const res = await axiosClient.post<DataResponse<any>>("/appointment/book", form);
        return res.data;
    }
    catch (e)
    {
        console.error("Failed to book appointment: " + e);
    }
}

export const getSpecialties = async (email: string) => {
  try {
    const res = await axiosClient.get<DataResponse<{ _id: string, name: string }[]>>('/chuyenkhoa', {
      params: { email } 
    });
    console.log('[Axios] Get specialty field data', res);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch field data", e);
  }
};

export const getDoctorBySpecialty = async(params: {specialtyId: string, keyword: string}) => {
    try {
        const res = await axiosClient.get<DataResponse<{id: string, name: string, email: string, specialtyId: string}[]>>("/doctors/specialty", {
        params: params
        });
        console.log('[Axios] Get doctors by specialty', res);
        return res.data;
    }
    catch (e) {
        console.error("Failed to fetch doctors by specialty", e);
    }

};

export const getTodayAppointments = async (doctorId: string) => {
  try {
    const res = await axiosClient.get<ApiResponse<any[]>>("/appointment/today", {
      params: { doctorId }
    });
    console.log('[Axios] Get today appointments:', res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch today's appointments:", e);
  }
};

export const completeAppointment = async (data: {
  appointmentId: string;
  diagnosis: string;
  note?: string;
  prescriptions: Array<{
    medicineId: string;
    name: string;
    quantity: number;
  }>;
}) => {
  try {
    const res = await axiosClient.patch<ApiResponse<{
      appointmentId: string;
      patientId: string;
    }>>("/appointment/complete", data);
    console.log('[Axios] Complete appointment:', res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to complete appointment:", e);
    throw e;
  }
};

export const getTimeSlotsByDoctorAndDate = async (params: { doctorId: string; date: string; status?: TimeSlotStatusEnum }) => {
  try {
    const status = params.status ?? TimeSlotStatusEnum.AVAILABLE; // default = 'available'
    const res = await axiosClient.get<DataResponse<TimeSlotDto[]>>(
      `/doctors/doctor/${params.doctorId}/date/${params.date}`,
      {
        params: { status },
      }
    );

    console.log("[Axios] Get timeslots by doctor & date", res);
    return res.data;
  } catch (e) {
    console.error("❌ Failed to fetch timeslots by doctor & date", e);
  }
};
