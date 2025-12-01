import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";
import { AccountProfileDTO } from "@/types/accountDTO/accountProfile.dto";

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