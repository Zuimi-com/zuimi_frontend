import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ApiMutationResult<T> = {
  payload: T;
  status: number;
};

export type CatalogProfile = {
  id: string;
  full_name: string;
  bio: string | null;
  profile_image: string | null;
  is_active: boolean;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

export type CatalogGenre = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

type UpsertProfilePayload = {
  full_name: string;
  bio?: string;
  profile_image_file?: File;
};

type UpsertGenrePayload = {
  name: string;
  description?: string;
};

const ACTORS_ENDPOINT = "/movies/actors/";
const DIRECTORS_ENDPOINT = "/movies/directors/";
const GENRES_ENDPOINT = "/movies/genres/";

const buildProfileFormData = (data: UpsertProfilePayload) => {
  const formData = new FormData();
  formData.append("full_name", data.full_name.trim());

  if (data.bio?.trim()) {
    formData.append("bio", data.bio.trim());
  }

  if (data.profile_image_file) {
    formData.append("profile_image_file", data.profile_image_file);
  }

  return formData;
};

export const useGetActors = () => {
  return useQuery({
    queryKey: ["movie-catalog", "actors"],
    queryFn: async () => {
      const res = await axiosInstance.get<CatalogProfile[]>(
        `${ACTORS_ENDPOINT}?include_inactive=true`,
      );
      return res.data;
    },
  });
};

export const useCreateActor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpsertProfilePayload) => {
      const res = await axiosInstance.post<CatalogProfile>(
        ACTORS_ENDPOINT,
        buildProfileFormData(data),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "actors"] });
    },
  });
};

export const useUpdateActor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpsertProfilePayload }) => {
      const res = await axiosInstance.patch<CatalogProfile>(
        `${ACTORS_ENDPOINT}${id}/`,
        buildProfileFormData(data),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "actors"] });
    },
  });
};

export const useDeactivateActor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`${ACTORS_ENDPOINT}${id}/`);

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<{ id: string; message: string; status: "inactive" }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "actors"] });
    },
  });
};

export const useActivateActor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch<CatalogProfile>(
        `${ACTORS_ENDPOINT}${id}/`,
        { is_active: true }
      );

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "actors"] });
    },
  });
};

export const useGetDirectors = () => {
  return useQuery({
    queryKey: ["movie-catalog", "directors"],
    queryFn: async () => {
      const res = await axiosInstance.get<CatalogProfile[]>(
        `${DIRECTORS_ENDPOINT}?include_inactive=true`,
      );
      return res.data;
    },
  });
};

export const useCreateDirector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpsertProfilePayload) => {
      const res = await axiosInstance.post<CatalogProfile>(
        DIRECTORS_ENDPOINT,
        buildProfileFormData(data),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "directors"] });
    },
  });
};

export const useUpdateDirector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpsertProfilePayload }) => {
      const res = await axiosInstance.patch<CatalogProfile>(
        `${DIRECTORS_ENDPOINT}${id}/`,
        buildProfileFormData(data),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "directors"] });
    },
  });
};

export const useDeactivateDirector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`${DIRECTORS_ENDPOINT}${id}/`);

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<{ id: string; message: string; status: "inactive" }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "directors"] });
    },
  });
};

export const useActivateDirector = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch<CatalogProfile>(
        `${DIRECTORS_ENDPOINT}${id}/`,
        { is_active: true }
      );

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogProfile>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "directors"] });
    },
  });
};

export const useGetGenres = () => {
  return useQuery({
    queryKey: ["movie-catalog", "genres"],
    queryFn: async () => {
      const res = await axiosInstance.get<CatalogGenre[]>(
        `${GENRES_ENDPOINT}?include_inactive=true`,
      );
      return res.data;
    },
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpsertGenrePayload) => {
      const res = await axiosInstance.post<CatalogGenre>(GENRES_ENDPOINT, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      });

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogGenre>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "genres"] });
    },
  });
};

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpsertGenrePayload }) => {
      const res = await axiosInstance.patch<CatalogGenre>(`${GENRES_ENDPOINT}${id}/`, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      });

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogGenre>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "genres"] });
    },
  });
};

export const useDeactivateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.delete(`${GENRES_ENDPOINT}${id}/`);

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<{ id: string; message: string; status: "inactive" }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "genres"] });
    },
  });
};

export const useActivateGenre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axiosInstance.patch<CatalogGenre>(`${GENRES_ENDPOINT}${id}/`, {
        is_active: true,
      });

      return {
        payload: res.data,
        status: res.status,
      } as ApiMutationResult<CatalogGenre>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-catalog", "genres"] });
    },
  });
};
