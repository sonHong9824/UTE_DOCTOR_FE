import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";

export interface ChuyenKhoaDTO {
  _id?: string;
  name: string;
  description?: string;
  status?: boolean;
}

export const getChuyenKhoaList = async (params?: {
  page?: number;
  limit?: number;
  key?: string;
}) => {
  const res = await axiosClient.get<
    DataResponse<{
      items: ChuyenKhoaDTO[];
      total: number;
      page: number;
      limit: number;
    }>
  >("/chuyenkhoa/admin", {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 10,
      key: params?.key || undefined,
    },
  });

  return res.data;
};


export const createChuyenKhoa = async (data: ChuyenKhoaDTO) => {
  const res = await axiosClient.post<DataResponse<ChuyenKhoaDTO>>(
    "/chuyenkhoa",
    data
  );
  return res.data;
};

export const updateChuyenKhoa = async (id: string, data: Partial<ChuyenKhoaDTO>) => {
  const res = await axiosClient.patch<DataResponse<ChuyenKhoaDTO>>(
    `/chuyenkhoa/${id}`,
    data
  );
  return res.data;
};

export const deleteChuyenKhoa = async (id: string) => {
  const res = await axiosClient.delete<DataResponse<any>>(
    `/chuyenkhoa/${id}`
  );
    return res.data;
};
