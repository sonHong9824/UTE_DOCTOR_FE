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

export const getAppointmentFieldsData = async (email: string) => {
  try {
    const res = await axiosClient.get<ApiResponse<any>>('/appointment/fields-data', {
      params: { email } 
    });
    console.log('[Axios] Get booking appointment fields data', res);
    return res;
  } catch (e) {
    console.error("Failed to fetch field data", e);
  }
};
