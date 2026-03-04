import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

type SubscribePayload = {
  last_name: string;
  first_name: string;
  email: string;
};

export const useGetSubscribers = () => {
  return useQuery({
    queryKey: ["subscribers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/newsletter/broadcasts/`);
      return res.data;
    },
  });
};

export const useSubcribeToWaitlist = () => {
  return useMutation({
    mutationFn: async (data: SubscribePayload) => {
      const res = await axiosInstance.post(`/newsletter/subscribe/`, data);
      return res.data;
    },
  });
};
