import axiosClient from "@/lib/axiosClient";
import { ShiftResponseDto } from "@/types/shift.dto";


export const getShiftsByDoctorMonth = async (
  doctorId: string,
  month: number,
  year: number,
  status?: string
): Promise<ShiftResponseDto> => {
  const params: Record<string, string | number> = { month, year };
  if (status) params.status = status;

  const res = await axiosClient.get<ShiftResponseDto>(
    `/shift/doctor/${doctorId}/month`,
    { params }
  );

  return res.data;
};

export const deleteShiftById = async (shiftId: string): Promise<{ code: number; message: string }> => {
  const res = await axiosClient.delete(`/shift/${shiftId}`);
  return res.data;
};

export interface RegisterShiftDto {
  doctorId: string;
  date: string; // YYYY-MM-DD
  shift: "morning" | "afternoon" | "extra";
}

export const registerShift = async (
  data: RegisterShiftDto
): Promise<{ code: number; message: string }> => {
  console.log("Sending shift register request:", data);

  const res = await axiosClient.post(`/shift/register`, data);

  console.log("📥 Received response:", res.data);

  return res.data;
};



