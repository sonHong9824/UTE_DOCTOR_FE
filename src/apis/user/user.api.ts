import axiosClient from "@/lib/axiosClient";
import { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";
import { DataResponse } from "@/types/apiDTO";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";

export const GetPatientProfile = async(form: {email: string}) =>
{   
    try {
        const res = await axiosClient.get<DataResponse<PatientProfileDto>>("/patients/me", 
            { params: { email: form.email } });
        return res.data;
    }
    catch (e)
    {
        console.error("Failed to get User Profile: " + e);
    }
}

export const UpdateUserProfile = async(userData: Partial<AccountProfileDTO>) =>
{
    try {
        const res = await axiosClient.put<DataResponse<AccountProfileDTO>>("/users/profile", userData);
        return res.data;
    }
    catch (e)
    {
        console.error("Failed to update User Profile: " + e);
        throw e;
    }
}   

export const ChangePassword = async(form: { currentPassword: string; newPassword: string }) => {
    try {
        const res = await axiosClient.put<DataResponse<null>>("/users/password", form);
        return res.data;
    } catch (e) {
        console.error("Failed to change password:", e);
        throw e;
    }
}

export const UpdateUserProfileWithFile = async (userData: Partial<AccountProfileDTO>, file?: File) => {
    try {
        const formData = new FormData();
        if (userData.name) formData.append('name', userData.name);
        if (userData.phoneNumber) formData.append('phoneNumber', userData.phoneNumber);
        if (userData.address) formData.append('address', userData.address);
        if (userData.gender) formData.append('gender', userData.gender);
        if (userData.dateOfBirth) formData.append('dateOfBirth', (userData.dateOfBirth as any).toString());
        if (file) formData.append('avatar', file);

        const res = await axiosClient.put<DataResponse<AccountProfileDTO>>('/users/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data;
    }
    catch (e) {
        console.error("Failed to update User Profile with file: " + e);
        throw e;
    }
}