import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export type NewsletterMedia = {
  id: string;
  media_type: "IMAGE" | "VIDEO";
  media_data?: {
    url?: string;
  };
  uploaded_at: string;
};

export const useGetLetterImages = () =>
  useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const response = await axiosInstance.get<NewsletterMedia[]>("/newsletter/media/");
      return response.data;
    },
  });

export const useUploadLetterImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const results: {
        uploaded: NewsletterMedia[];
        failed: Array<{ name: string; message: string }>;
      } = { uploaded: [], failed: [] };

      for (const file of files) {
        const formData = new FormData();
        formData.append("media", file);
        try {
          const response = await axiosInstance.post<NewsletterMedia>(
            "/newsletter/media/",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
          results.uploaded.push(response.data);
        } catch {
          results.failed.push({
            name: file.name,
            message: "Upload failed. Check the file and try again.",
          });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      if (results.uploaded.length) {
        queryClient.invalidateQueries({ queryKey: ["images"] });
      }
    },
  });
};

