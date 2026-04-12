import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export const createReview = async (reviewData: any) => {
  try {
    const res = await axiosClient.post<DataResponse<any>>("/reviews", reviewData);
    console.log("[Axios] Create review:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to create review:", error);
  }
};

export const getReviewByAppointmentAndPatient = async (
  appointmentId: string,
  patientId: string
) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>(
      "/reviews/by-appointment-patient",
      {
        params: { appointmentId, patientId },
      }
    );
    console.log("[Axios] Get review by appointment & patient:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to get review:", error);
  }
};

export const getAllReviews = async () => {
  try {
    const res = await axiosClient.get<DataResponse<any>>("/reviews");
    console.log("[Axios] Get all reviews:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to get all reviews:", error);
  }
};

export const deleteReview = async (id: string) => {
  try {
    const res = await axiosClient.delete<DataResponse<any>>(`/reviews/${id}`);
    console.log("[Axios] Delete review:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to delete review:", error);
    throw error;
  }
};



