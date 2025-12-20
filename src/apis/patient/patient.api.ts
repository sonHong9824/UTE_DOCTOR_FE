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

export const getPatientProfile = async (
  patientId: string
): Promise<DataResponse<Patient> | null> => {
  // Try the most specific endpoint first; if backend uses a different
  // route we attempt sensible fallbacks and return null on 404 (not found).
  const candidates = [`/patients/profile/${patientId}`, `/patients/${patientId}`];

  for (const path of candidates) {
    try {
      const res = await axiosClient.get<DataResponse<Patient>>(path);
      return res.data;
    } catch (error: any) {
      // If not found, try next candidate. Otherwise rethrow so caller can handle auth/server errors.
      if (error?.response?.status === 404) {
        console.debug(`getPatientProfile: ${path} returned 404, trying next fallback`);
        continue;
      }
      console.error(`Failed to fetch patient profile (${path}):`, error);
      throw error;
    }
  }

  // Final attempt: try `/patients/me` with id as query param (some backends expose this)
  try {
    const res = await axiosClient.get<DataResponse<Patient>>(`/patients/me`, { params: { id: patientId } });
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      console.debug('getPatientProfile: no patient profile found for id', patientId);
      return null;
    }
    console.error('Failed to fetch patient profile (/patients/me):', error);
    throw error;
  }
};

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

