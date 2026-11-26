import axios from "axios";
import { useMutation } from "@tanstack/react-query";

type LoginPayLoad = { email: string; password: string } | { challenge_token: string; otp: string };

export interface AdminSessionResponse {
  user: {
    id: string;
    email: string;
    is_staff: true;
    is_superuser: boolean;
    capabilities?: {
      manage_operators?: boolean;
    };
  };
}

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
