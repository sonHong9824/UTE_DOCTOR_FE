import axiosClient from "@/lib/axiosClient";

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
