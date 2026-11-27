import axios from "axios";
import type { AdminUser } from "@/features/dashboard/permissions";
import { useMutation } from "@tanstack/react-query";

type LoginPayLoad = {
  email: string;
  password: string;
};

export type LoginResponse = { user: AdminUser };

export const useAdminLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginPayLoad) => {
      const res = await axios.post<LoginResponse>(
        "/api/admin/session/login",
        data,
      );
      return res.data;
    },
  });
};
