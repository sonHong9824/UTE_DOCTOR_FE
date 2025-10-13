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