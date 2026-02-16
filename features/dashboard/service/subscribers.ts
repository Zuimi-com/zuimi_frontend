import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetSubscribers = () => {
  return useQuery({
    queryKey: ["subscribers"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/newsletter/broadcasts/`);
      return res.data;
    },
  });
};
