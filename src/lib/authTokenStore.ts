const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getAccessToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearAuthTokens = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const emitTokenRefreshed = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("token-refreshed"));
};

export const emitAuthLogout = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("auth-logout"));
};
