import axiosClient from "@/lib/axiosClient";
import { ApiResponse } from "@/types/apiDTO";

export const bookAppointment = async(form: any) =>
{
    try {
        const res = await axiosClient.post<ApiResponse<any>>("/appointment/book", form);
        return res.data;
    }
    catch (e)
    {
        console.error("Failed to book appointment: " + e);
    }
}

export const getSpecialties = async (email: string) => {
  try {
    const res = await axiosClient.get<ApiResponse<{ _id: string, name: string }[]>>('/chuyenkhoa', {
      params: { email } 
    });
    console.log('[Axios] Get specialty field data', res);
    return res.data;
  } catch (e) {
    console.error("Failed to fetch field data", e);
  }
};

export const getDoctorBySpecialty = async(params: {specialtyId: string, keyword: string}) => {
    try {
        const res = await axiosClient.get<ApiResponse<{id: string, name: string, email: string, specialtyId: string}[]>>("/doctors/specialty", {
        params: params
        });
        console.log('[Axios] Get doctors by specialty', res);
        return res.data;
    }
    catch (e) {
        console.error("Failed to fetch doctors by specialty", e);
    }
    
}
