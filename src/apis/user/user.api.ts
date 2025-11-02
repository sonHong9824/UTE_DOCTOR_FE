import axiosClient from "@/lib/axiosClient";
import { ApiResponse } from "@/types/apiDTO";
import { PatientProfileDto } from "@/types/patientDTO/patient-profile.dto";

export const GetPatientProfile = async(form: {email: string}) =>
{   
    try {
        const res = await axiosClient.get<ApiResponse<PatientProfileDto>>("/patients/me", 
            { params: { email: form.email } });
        return res.data;
    }
    catch (e)
    {
        console.error("Failed to get User Profile: " + e);
    }
}   