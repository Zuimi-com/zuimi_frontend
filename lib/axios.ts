import axios from "axios";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import { clearAuthTokens, getAccessToken } from "@/lib/auth-cookies";

export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthTokens();

      if (typeof window !== "undefined") {
        window.location.href = "/admin-login";
      }
    }

    return Promise.reject(error);
  },
);
