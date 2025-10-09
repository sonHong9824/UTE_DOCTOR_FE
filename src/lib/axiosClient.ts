import axios from "axios";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Khi có response từ server
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        console.error("Unauthorized — maybe expired token?");
        // 👉 TODO: refresh token hoặc redirect login
      } else if (status === 403) {
        console.warn("Forbidden:", data?.message || "No permission");
      } else if (status >= 500) {
        console.error("Server error:", status, data?.message);
      }
    } else if (error.request) {
      // Khi không có phản hồi từ server (mạng lỗi)
      console.error("Network error: No response from server");
    } else {
      // Lỗi khác (config, timeout,...)
      console.error("Axios setup error:", error.message);
    }

    return Promise.reject(error); // luôn reject để nơi gọi có thể xử lý
  }
);

export default axiosClient;
