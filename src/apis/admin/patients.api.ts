import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export const getPatientsAdmin = async (params: { 
  page?: number;
  limit?: number;
  keyword?: string;
}) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>("/patients/admin", {
      params,
    });

    console.log("[Axios] Get patients admin:", res.data);
    return res.data;
  } catch (e) {
    try {
      const err: any = e;
      if (err?.response) {
        console.error("Failed to fetch patients admin - response:", err.response.status, err.response.data);
      } else if (err?.request) {
        console.error("Failed to fetch patients admin - no response:", err.request);
      } else {
        console.error("Failed to fetch patients admin - error:", err.message || err);
      }
    } catch (logErr) {
      console.error("Error logging fetch patients admin error", logErr);
    }
    throw e;
  }
};
