import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export interface ProfileResponseDto {
  code: string;
  message: string;
  data: {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    gender: string;
    dob: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export const getProfileById = async (profileId: string): Promise<ProfileResponseDto> => {
  const res = await axiosClient.get<ProfileResponseDto>(`/profiles/${profileId}`);
  return res.data;
};

export const getDoctorById = async (id: string) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>(`/doctors/${id}`);
    console.log("[Axios] Get doctor by id:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch doctor by id:", e);
  }
};

