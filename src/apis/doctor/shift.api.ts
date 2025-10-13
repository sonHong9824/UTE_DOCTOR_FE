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

