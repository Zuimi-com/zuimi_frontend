import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type NewsletterBroadcastStatus = "DRAFT" | "QUEUED" | "SENT" | "FAILED";

export type NewsletterBroadcast = {
  id: string;
  subject: string;
  body: string;
  image_attachments: Array<Record<string, unknown>>;
  video_attachments: Array<Record<string, unknown>>;
  status: NewsletterBroadcastStatus;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  recipient_count: number;
  sent_count: number;
  last_error: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  subscribed_at: string;
};

export type NewsletterSummary = {
  subscriber_count: number;
  draft_count: number;
  queued_count: number;
  sent_count: number;
  latest_sent_at: string | null;
  sender_name: string;
  sender_email: string;
};

export const useGetSubscribers = () =>
  useQuery({
    queryKey: ["newsletter", "subscribers"],
    queryFn: async () => {
      const response = await axiosInstance.get<NewsletterSubscriber[]>(
        "/newsletter/waitlist/",
      );
      return response.data;
    },
  });

export const useGetNewsLetter = useGetSubscribers;

export const useGetBroadcasts = () =>
  useQuery({
    queryKey: ["newsletter", "broadcasts"],
    queryFn: async () => {
      const response = await axiosInstance.get<NewsletterBroadcast[]>(
        "/newsletter/broadcasts/",
      );
      return response.data;
    },
    refetchInterval: 15000,
  });

export const useGetNewsletterSummary = (enabled = true) =>
  useQuery({
    queryKey: ["newsletter", "summary"],
    enabled,
    queryFn: async () => {
      const response = await axiosInstance.get<NewsletterSummary>(
        "/newsletter/admin/summary/",
      );
      return response.data;
    },
    refetchInterval: enabled ? 15000 : false,
  });

export const useSaveNewsletterDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      subject,
      body,
    }: {
      id?: string;
      subject: string;
      body: string;
    }) => {
      if (id) {
        const response = await axiosInstance.patch<NewsletterBroadcast>(
          `/newsletter/broadcasts/${id}/`,
          { subject, body },
        );
        return response.data;
      }

      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("body", body);
      const response = await axiosInstance.post<NewsletterBroadcast>(
        "/newsletter/broadcasts/",
        formData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter"] });
    },
  });
};

export const useSendNewsletter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (broadcastId: string) => {
      const response = await axiosInstance.post<{
        message: string;
        status: "queued" | "sent";
        broadcast_id: string;
        sent_count?: number;
      }>("/newsletter/broadcasts/send/", { broadcast_id: broadcastId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter"] });
    },
  });
};

