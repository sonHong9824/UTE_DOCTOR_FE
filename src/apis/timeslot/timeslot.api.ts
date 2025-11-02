import axiosClient from "@/lib/axiosClient";
import { ApiResponse } from "@/types/apiDTO";
import { TimeSlotDto } from "@/types/timeslot.dto";

export const gettimeslot = async () => {
  try {
        const res = await axiosClient.get<ApiResponse<TimeSlotDto[]>>("/timeslot");
        console.log("[Axios] ✅ Get all timeslots", res);
        return res.data;
    }
    catch (e) {
        console.error("Failed to fetch doctors by specialty", e);
    }
}