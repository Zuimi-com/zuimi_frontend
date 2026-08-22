import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "/api/admin/backend",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/admin-login";
      }
    }

    return Promise.reject(error);
  },
);
