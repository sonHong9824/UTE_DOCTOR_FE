import axiosClient from "@/lib/axiosClient";
import { ApiResponse } from "@/types/apiDTO";
import { UserProfileDTO } from "@/types/userDTO/userProfile.dto";

export const GetUserProfile = async(form: {email: string}) =>
{   
    try {
        const res = await axiosClient.get<ApiResponse<UserProfileDTO>>("/users/by-email", 
            { params: { email: form.email } });
        return res.data;
    }
    catch (e)
    {
        console.error("Failed to get User Profile: " + e);
    }
}   