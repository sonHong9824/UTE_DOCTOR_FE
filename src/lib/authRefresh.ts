import axios from "axios";
import {
  clearAuthTokens,
  emitAuthLogout,
  emitTokenRefreshed,
  getRefreshToken,
  setAuthTokens,
} from "@/lib/authTokenStore";

type RefreshResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string> | null = null;

export const refreshAccessToken = async () => {
  if (typeof window === "undefined") {
    throw new Error("refreshAccessToken can only run in browser environment");
  }

  if (refreshPromise) {
    return await refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await refreshClient.post<RefreshResponse>("/auth/refresh", { refreshToken });
    const newAccessToken = response.data.data.accessToken;
    const newRefreshToken = response.data.data.refreshToken;

    setAuthTokens(newAccessToken, newRefreshToken);
    emitTokenRefreshed();

    return newAccessToken;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    clearAuthTokens();
    emitAuthLogout();
    throw error;
  } finally {
    refreshPromise = null;
  }
};
