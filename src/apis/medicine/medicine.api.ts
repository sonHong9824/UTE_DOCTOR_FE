import axiosClient from "@/lib/axiosClient";
import { ApiResponse } from "@/types/apiDTO";

export interface Medicine {
  _id: string;
  name: string;
  packaging: string;
}

export const getMedicines = async (): Promise<ApiResponse<Medicine[]>> => {
  try {
    const res = await axiosClient.get<ApiResponse<Medicine[]>>("/medicines");
    return res.data;
  } catch (e) {
    console.error("Failed to fetch medicines:", e);
    throw e;
  }
};





