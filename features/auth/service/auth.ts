import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

type LoginPayLoad = {
  email: string;
  password: string;
};

export interface LoginResponse {
  access: string;
  refresh: string;
  user_id: string;
  email: string;
  wallet_id: string | null;
}

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginPayLoad) => {
      const res = await axiosInstance.post<LoginResponse>(
        `/login/admin/`,
        data,
      );
      return res.data;
    },
  });
};
