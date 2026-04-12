import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";
import { TimeSlotDto } from "@/types/timeslot.dto";

export const getTimeslot = async () => {
  try {
        const res = await axiosClient.get<DataResponse<TimeSlotDto[]>>("/timeslot");
        console.log("[Axios] ✅ Get all timeslots", res);
        return res.data;
    }
    catch (e) {
        console.error("Failed to fetch doctors by specialty", e);
    }
}