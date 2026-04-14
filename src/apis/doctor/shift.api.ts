import axiosClient from "@/lib/axiosClient";
import { ShiftResponseDto } from "@/types/shift.dto";
import { assertValidISO } from "@/utils/time.util";


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
  startTime: string;
  endTime: string;
  legacyAllowMissingTimezone?: boolean;
  shift: "morning" | "afternoon" | "extra";
}

export const registerShift = async (
  data: RegisterShiftDto
): Promise<{ code: number; message: string }> => {
  assertValidISO(data.startTime);
  assertValidISO(data.endTime);
  const payload = { ...data };

  console.log("Sending shift register request:", payload);

  const res = await axiosClient.post(`/shift/register`, payload);

  console.log("Received response:", res.data);

  return res.data;
};

export const cancelShiftById = async (
  shiftId: string,
  reason: string
): Promise<{ code: number; message: string }> => {
  console.log("Sending cancel shift request:", { shiftId, reason });

  const res = await axiosClient.put(`/shift/cancel/${shiftId}`, { reason });

  console.log("Received cancel response:", res.data);

  return res.data;
};



