import axios from "axios";
import type { AdminUser } from "@/features/dashboard/permissions";
import { useMutation } from "@tanstack/react-query";

type LoginPayLoad = { email: string; password: string } | { challenge_token: string; otp: string };

export type AdminSessionResponse = { user: AdminUser };

export type LoginResponse = AdminSessionResponse | { requires_2fa: true; challenge_token: string };

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
