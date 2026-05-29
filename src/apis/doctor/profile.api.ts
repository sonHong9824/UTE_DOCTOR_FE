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

// Contract: GET /doctors/:id
export interface DoctorDetailDto {
  _id: string;
  profileId?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dob?: string;
    avatarUrl?: string;
  };
  accountId?: string;
  doctorName?: string;
  chuyenKhoaId?: {
    _id?: string;
    name?: string;
    description?: string;
    status?: boolean;
  };
  degree?: string[];
  academic?: string;
  bio?: string;
  achievements?: string[];
  yearsOfExperience?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const getProfileById = async (profileId: string): Promise<ProfileResponseDto> => {
  const res = await axiosClient.get<ProfileResponseDto>(`/profiles/${profileId}`);
  return res.data;
};

// Contract: GET /doctors/:id — Public, returns full doctor info with populated profile and specialty.
export const getDoctorById = async (id: string): Promise<DataResponse<DoctorDetailDto>> => {
  const res = await axiosClient.get<DataResponse<DoctorDetailDto>>(`/doctors/${id}`);
  return res.data;
};

export const getDoctorByAccountId = async (accountId: string) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>(`/doctors/account/${accountId}`);
    console.log("[Axios] Get doctor by accountId:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch doctor by accountId:", e);
  }
};

export const getDoctorMe = async () => {
  try {
    const res = await axiosClient.get<DataResponse<any>>(`/doctors/me`);
    console.log("[Axios] Get doctor me:", res.data);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch doctor me:", e);
  }
};


