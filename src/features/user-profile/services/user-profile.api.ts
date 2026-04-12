// User profile API layer (HTTP-only).
import axiosClient from "@/lib/axiosClient";
import { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import { DataResponse } from "@/types/apiDTO";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";

export const getPatientProfile = async () => {
  const res = await axiosClient.get<DataResponse<PatientProfileDto>>("/patients/me");
  return res.data;
};

export const updateUserProfile = async (userData: Partial<AccountProfileDTO>) => {
  const res = await axiosClient.put<DataResponse<AccountProfileDTO>>("/users/profile", userData);
  return res.data;
};

export const updateUserProfileWithFile = async (userData: Partial<AccountProfileDTO>, file?: File) => {
  const formData = new FormData();
  if (userData.name) formData.append("name", userData.name);
  if (userData.phoneNumber) formData.append("phoneNumber", userData.phoneNumber);
  if (userData.address) formData.append("address", userData.address);
  if (userData.gender) formData.append("gender", userData.gender);
  if (userData.dateOfBirth) formData.append("dateOfBirth", (userData.dateOfBirth as any).toString());
  if (file) formData.append("avatar", file);

  const res = await axiosClient.put<DataResponse<AccountProfileDTO>>("/users/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const changePassword = async (form: { currentPassword: string; newPassword: string }) => {
  const res = await axiosClient.put<DataResponse<null>>("/users/password", form);
  return res.data;
};
