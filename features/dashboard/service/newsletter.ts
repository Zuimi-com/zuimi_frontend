import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
      const res = await axios.get<NewLetterResponse[]>(
        `https://zuimi.onrender.com/api/newsletter/waitlist/`,
      );
      return res.data;
    },
  });
};
