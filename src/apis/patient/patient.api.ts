import axiosClient from "@/lib/axiosClient";
import axios from "axios";
import {DataResponse } from "@/types/apiDTO";

export interface Patient {
  _id: string;
  profileId: any;
  accountId: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  medicalRecord?: any;
}

export const getPatientByAccount = async (
  accountId: string
): Promise<DataResponse<Patient>> => {
  try {
    const res = await axiosClient.get<DataResponse<Patient>>(
      `/patients/by-account/${accountId}`
    );

    return res.data;
  } catch (error) {
    console.error("Failed to fetch patient by account:", error);
    throw error;
  }
};

