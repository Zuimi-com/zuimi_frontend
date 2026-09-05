import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Movie = {
  id: string;
  title: string;
  description: string | null;
  price: string;
  duration: number;
  genre: string | null;
  director: string | null;
  cast: string | null;
  rating: string | null;
  language: string | null;
  release_date: string;
  poster_image: string | null;
  movie_title_svg: string | null;
  trailer_url: string | null;
  producer: string;
  copies_sold: number;
};

export type MediaRendition = {
  id: string;
  label: string;
  width: number;
  height: number;
  video_bitrate_kbps: number;
  audio_bitrate_kbps: number;
  playlist_path: string;
  created_at: string;
};

export type MediaManifest = {
  id: string;
  protocol: "hls" | "dash";
  manifest_path: string;
  is_active: boolean;
  created_at: string;
};

export type ProcessingJob = {
  id: string;
  asset: string;
  status: "queued" | "running" | "completed" | "failed";
  attempts: number;
  error_message: string;
  log: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string;
};

export type MovieAsset = {
  id: string;
  movie: string;
  movie_title: string;
  source_filename: string;
  source_checksum: string;
  source_size_bytes: number;
  source_duration_seconds: number | null;
  status: "uploaded" | "processing" | "ready" | "failed";
  is_streamable: boolean;
  failure_reason: string;
  latest_job: ProcessingJob | null;
  renditions: MediaRendition[];
  manifests: MediaManifest[];
  created_at: string;
  updated_at: string;
};

export type CreateMoviePayload = {
  title: string;
  description?: string;
  price: string;
  duration: number;
  genre?: string;
  director?: string;
  cast?: string;
  director_id?: string;
  genre_ids?: string[];
  actor_ids?: string[];
  rating?: string;
  language?: string;
  release_date: string;
  poster_file?: File;
  title_svg_file?: File;
  trailer_file?: File;
  producer: string;
};

const MOVIES_ENDPOINT = "/movies/";
const MOVIE_UPLOAD_ENDPOINT = "/movies/upload/";
const ASSETS_ENDPOINT = "/movies/admin/media/assets/";

export const useGetMovies = () => {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => {
      const res = await axiosInstance.get<Movie[]>(MOVIES_ENDPOINT);
      return res.data;
    },
  });
};

export const useCreateMovie = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMoviePayload) => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("release_date", payload.release_date);
      formData.append("duration", String(payload.duration));
      formData.append("price", payload.price);
      formData.append("producer", payload.producer);

      const optionalTextFields: Array<[string, string | undefined]> = [
        ["description", payload.description],
        ["genre", payload.genre],
        ["director", payload.director],
        ["cast", payload.cast],
        ["director_id", payload.director_id],
        ["rating", payload.rating],
        ["language", payload.language],
      ];
      optionalTextFields.forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      payload.genre_ids?.forEach((id) => formData.append("genre_ids", id));
      payload.actor_ids?.forEach((id) => formData.append("actor_ids", id));

      if (payload.poster_file) formData.append("poster_file", payload.poster_file);
      if (payload.title_svg_file) formData.append("title_svg_file", payload.title_svg_file);
      if (payload.trailer_file) formData.append("trailer_file", payload.trailer_file);

      const res = await axiosInstance.post<Movie>(MOVIE_UPLOAD_ENDPOINT, formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
};

export const useGetMovieAssets = () => {
  return useQuery({
    queryKey: ["movie-assets"],
    queryFn: async () => {
      const res = await axiosInstance.get<MovieAsset[]>(ASSETS_ENDPOINT);
      return res.data;
    },
    refetchInterval: 10000,
  });
};

export const useUploadMovieAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      movieId,
      sourceFile,
      onProgress,
    }: {
      movieId: string;
      sourceFile: File;
      onProgress?: (percent: number) => void;
    }) => {
      const formData = new FormData();
      formData.append("movie", movieId);
      formData.append("source_file", sourceFile);

      const res = await axiosInstance.post<{
        asset: MovieAsset;
        processing_job: ProcessingJob;
      }>(ASSETS_ENDPOINT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          if (!onProgress) return;
          const total = event.total || sourceFile.size;
          if (!total) return;
          onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
        },
      });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-assets"] });
    },
  });
};

export const useProcessMovieAssetJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await axiosInstance.post<ProcessingJob>(
        `/movies/admin/media/jobs/${jobId}/process/`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-assets"] });
    },
  });
};

export const useRetryMovieAssetProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const res = await axiosInstance.post<ProcessingJob>(
        `/movies/admin/media/assets/${assetId}/retry-processing/`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-assets"] });
    },
  });
};

export const usePublishMovieAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const res = await axiosInstance.post<MovieAsset>(
        `/movies/admin/media/assets/${assetId}/publish/`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-assets"] });
    },
  });
};

export const useUnpublishMovieAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      const res = await axiosInstance.post<MovieAsset>(
        `/movies/admin/media/assets/${assetId}/unpublish/`,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-assets"] });
    },
  });
};
