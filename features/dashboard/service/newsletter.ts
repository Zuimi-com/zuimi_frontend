import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

type NewLetterResponse = {
  email: string;
  dateSent: string;
  subscribed_at: string;
  status: string;
  openRate?: string;
};

export const useGetNewsLetter = () => {
  return useQuery({
    queryKey: ["newsletter"],
    queryFn: async () => {
      const res = await axiosInstance.get<NewLetterResponse[]>(
        `/newsletter/waitlist/`,
      );
      return res.data;
    },
  });
};
