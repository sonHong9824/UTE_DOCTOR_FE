import axiosClient from "@/lib/axiosClient";
import type {
  AdminCreateDoctorPayload,
  AdminCreateDoctorResultDto,
  AdminCreateReceptionistPayload,
  AdminCreateReceptionistResultDto,
  AdminReceptionistListQuery,
  AdminReceptionistListResponseDto,
} from "@/types/admin-staff.dto";
import { DataResponse } from "@/types/apiDTO";

export const getDoctorsAdmin = async (params: { 
  name?: string;
  specialtyId?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    // map frontend `specialtyId` to backend `chuyenKhoaId` for compatibility
    const mappedParams: any = { ...(params || {}) };
    if (mappedParams.specialtyId && !mappedParams.chuyenKhoaId) {
      mappedParams.chuyenKhoaId = mappedParams.specialtyId;
      delete mappedParams.specialtyId;
    }

    const res = await axiosClient.get<DataResponse<any>>("/doctors/admin", {
      params: mappedParams,
    });

    console.log("[Axios] Get doctors admin:", res.data);
    return res.data;
  } catch (e) {
    // Log detailed axios response if available to help debugging
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err: any = e;
      if (err?.response) {
        console.error("Failed to fetch doctors admin - response:", err.response.status, err.response.data);
      } else if (err?.request) {
        console.error("Failed to fetch doctors admin - no response:", err.request);
      } else {
        console.error("Failed to fetch doctors admin - error:", err.message || err);
      }
    } catch (logErr) {
      console.error("Error logging fetch doctors admin error", logErr);
    }
    // Rethrow so callers can inspect the error (status code, message)
    throw e;
  }
};

const toStaffProvisioningFormData = (
  payload: AdminCreateDoctorPayload | AdminCreateReceptionistPayload
) => {
  const formData = new FormData();
  formData.append("profile", JSON.stringify(payload.profile));

  if ("doctorName" in payload) {
    formData.append("doctorName", payload.doctorName);
    if (payload.specialty) formData.append("specialty", payload.specialty);
    if (payload.bio) formData.append("bio", payload.bio);
    if (payload.degree) formData.append("degree", JSON.stringify(payload.degree));
    if (payload.academic) formData.append("academic", payload.academic);
    if (payload.achievements) formData.append("achievements", payload.achievements);
    if (payload.yearsOfExperience !== undefined) {
      formData.append("yearsOfExperience", String(payload.yearsOfExperience));
    }
  } else if (payload.hospitalName) {
    formData.append("hospitalName", payload.hospitalName);
  }

  if (payload.avatar) formData.append("avatar", payload.avatar);
  return formData;
};

export const createDoctor = async (
  payload: AdminCreateDoctorPayload
): Promise<DataResponse<AdminCreateDoctorResultDto>> => {
  const body = payload.avatar ? toStaffProvisioningFormData(payload) : payload;
  const res = await axiosClient.post<DataResponse<AdminCreateDoctorResultDto>>(
    "/admin/doctors",
    body,
    payload.avatar
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );
  return res.data;
};

export const createReceptionist = async (
  payload: AdminCreateReceptionistPayload
): Promise<DataResponse<AdminCreateReceptionistResultDto>> => {
  const body = payload.avatar ? toStaffProvisioningFormData(payload) : payload;
  const res = await axiosClient.post<DataResponse<AdminCreateReceptionistResultDto>>(
    "/admin/receptionists",
    body,
    payload.avatar
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined
  );
  return res.data;
};

export const getReceptionists = async (
  params: AdminReceptionistListQuery = {}
): Promise<DataResponse<AdminReceptionistListResponseDto>> => {
  const res = await axiosClient.get<
    DataResponse<AdminReceptionistListResponseDto>
  >("/admin/receptionists", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      search: params.search?.trim() || undefined,
    },
  });
  return res.data;
};

export const updateAccountStatus = async (
  accountId: string,
  status: string
) => {
  try {
    const res = await axiosClient.patch<DataResponse<any>>(
      `/users/${accountId}/status`,
      { status }
    );

    console.log("[Axios] Update account status:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to update account status:", error);
    throw error;
  }
};

export const updateDoctor = async (id: string, form: any) => {
  try {
    const formData = new FormData();

    // Append doctor fields
    if (form.doctorName) formData.append('doctorName', form.doctorName);
    if (form.specialty) formData.append('specialty', form.specialty);
    if (form.bio) formData.append('bio', form.bio);
    if (form.academic) formData.append('academic', form.academic);
    if (form.achievements) formData.append('achievements', form.achievements);

    // degree must be array → convert to JSON string
    if (form.degree) {
      formData.append('degree', JSON.stringify(form.degree));
    }

    // yearsOfExperience must be number → convert to string
    if (form.yearsOfExperience !== undefined) {
      formData.append('yearsOfExperience', String(form.yearsOfExperience));
    }

    // profile is nested object → convert to JSON string
    if (form.profile) {
      formData.append('profile', JSON.stringify(form.profile));
    }

    // Avatar file
    if (form.avatar) {
      formData.append('avatar', form.avatar);
    }

    const res = await axiosClient.patch<DataResponse<any>>(
      `/doctors/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('[Axios] Update doctor:', res.data);
    return res.data;
  } catch (error) {
    console.error('Failed to update doctor:', error);
    throw error;
  }
};


export const getActiveDoctors = async (params: {
  page?: number;
  limit?: number;
  chuyenKhoaId?: string;
}) => {
  try {
    const response = await axiosClient.get("/doctors/active", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bác sĩ:", error);
    throw error;
  }
};

export const getDoctorById = async (id: string) => {
  try {
    const response = await axiosClient.get(`/doctors/${id}`);
    console.log("[Axios] Get doctor by id:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bác sĩ:", error);
    throw error;
  }
};







