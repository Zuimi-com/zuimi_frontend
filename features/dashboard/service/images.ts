import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

export const useGetLetterImages = () => {
  return useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/newsletter/media/`);
      return res.data;
    },
  });
};

export const useUploadLetterImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("media", file);
        formData.append("media_type", "IMAGE");
      });

      console.log(formData);

      const res = await axiosInstance.post("/newsletter/media/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data;
    },

    onSuccess: () => {
      // Refresh images list automatically
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
};
