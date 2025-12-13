import axiosClient from "@/lib/axiosClient";
import { DataResponse } from "@/types/apiDTO";


export const createNews = async (formData: FormData) => {
  try {
    const res = await axiosClient.post<DataResponse<any>>(
      "/news",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("[Axios] Create news:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to create news:", error);
    throw error;
  }
};

export const getAllNews = async () => {
  try {
    const res = await axiosClient.get<DataResponse<any>>("/news");
    console.log("[Axios] Get all news:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to get all news:", error);
    throw error;
  }
};

export const getNewsById = async (id: string) => {
  try {
    const res = await axiosClient.get<DataResponse<any>>(`/news/${id}`);
    console.log("[Axios] Get news by id:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to get news:", error);
    throw error;
  }
};

export const updateNews = async (id: string, formData: FormData) => {
  try {
    const res = await axiosClient.put<DataResponse<any>>(
      `/news/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    console.log("[Axios] Update news:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to update news:", error);
    throw error;
  }
};

export const deleteNews = async (id: string) => {
  try {
    const res = await axiosClient.delete<DataResponse<any>>(`/news/${id}`);
    console.log("[Axios] Delete news:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to delete news:", error);
    throw error;
  }
};

export const getPublicNews = async () => {
  try {
    const res = await axiosClient.get<DataResponse<any>>("/news/public");
    console.log("[Axios] Get public news:", res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to get public news:", error);
    throw error;
  }
};
