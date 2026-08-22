import axios from "axios";
import { useMutation } from "@tanstack/react-query";

type LoginPayLoad = {
  email: string;
  password: string;
};

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    is_staff: true;
    is_superuser: boolean;
  };
}

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
