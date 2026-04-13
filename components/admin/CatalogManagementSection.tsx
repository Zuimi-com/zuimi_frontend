"use client";

import { extractDate } from "@/lib/utils";
import {
  CatalogGenre,
  CatalogProfile,
  useCreateActor,
  useCreateDirector,
  useCreateGenre,
  useDeactivateActor,
  useDeactivateDirector,
  useDeactivateGenre,
  useGetActors,
  useGetDirectors,
  useGetGenres,
  useUpdateActor,
  useUpdateDirector,
  useUpdateGenre,
} from "@/features/dashboard/service/movie-catalog";
import { Loader2, Pencil, Plus, Power } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type FormValues = {
  primary: string;
  secondary: string;
  imageFile: File | null;
};

type EntityRow = {
  id: string;
  primary: string;
  secondary: string | null;
  imageUrl?: string | null;
  status: "active" | "inactive";
  updatedAt: string;
};

type MutationResult = {
  payload: unknown;
  status: number;
};

type EntitySectionProps = {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  supportsImage?: boolean;
  rows: EntityRow[];
  isLoading: boolean;
  isBusy: boolean;
  onCreate: (values: FormValues) => Promise<MutationResult>;
  onUpdate: (id: string, values: FormValues) => Promise<MutationResult>;
  onDeactivate: (id: string) => Promise<MutationResult>;
};

export type CatalogSectionMode = "all" | "directors" | "actors" | "genres";

type CatalogManagementSectionProps = {
  mode?: CatalogSectionMode;
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as {
      response?: {
        data?: Record<string, unknown>;
      };
      message?: string;
    };

    const firstServerMessage = err.response?.data
      ? Object.values(err.response.data).flat().join(" ")
      : "";
    return firstServerMessage || err.message || "Request failed";
  }

  return "Request failed";
};

function EntitySection({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  supportsImage = false,
  rows,
  isLoading,
  isBusy,
  onCreate,
  onUpdate,
  onDeactivate,
}: EntitySectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>({
    primary: "",
    secondary: "",
    imageFile: null,
  });
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);

  const activeCount = useMemo(
    () => rows.filter((item) => item.status === "active").length,
    [rows],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm({ primary: "", secondary: "", imageFile: null });
  };

  useEffect(() => {
    if (!form.imageFile) {
      setLocalImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(form.imageFile);
    setLocalImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.imageFile]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const primaryValue = form.primary.trim();
    if (!primaryValue) {
      toast.error(`${primaryLabel} is required`);
      return;
    }

    try {
      const payload = {
        primary: primaryValue,
        secondary: form.secondary.trim(),
        imageFile: form.imageFile,
      };

      if (editingId) {
        await onUpdate(editingId, payload);
        toast.success(`${title.slice(0, -1)} updated`);
      } else {
        await onCreate(payload);
        toast.success(`${title.slice(0, -1)} created`);
      }

      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await onDeactivate(id);
      toast.success(`${title.slice(0, -1)} deactivated`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/60">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-linear-to-r from-slate-50 via-white to-blue-50 px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          <span className="text-emerald-600">{activeCount} active</span>
          <span className="text-slate-300">/</span>
          <span className="text-amber-600">{rows.length - activeCount} inactive</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 border-y border-slate-100 bg-slate-50/70 px-6 py-4 md:grid-cols-12"
      >
        <div className={supportsImage ? "md:col-span-3" : "md:col-span-4"}>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {primaryLabel}
          </label>
          <input
            value={form.primary}
            onChange={(event) =>
              setForm((current) => ({ ...current, primary: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            placeholder={`Enter ${primaryLabel.toLowerCase()}`}
          />
        </div>

        <div className={supportsImage ? "md:col-span-4" : "md:col-span-5"}>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {secondaryLabel}
          </label>
          <input
            value={form.secondary}
            onChange={(event) =>
              setForm((current) => ({ ...current, secondary: event.target.value }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
            placeholder={`Optional ${secondaryLabel.toLowerCase()}`}
          />
        </div>

        {supportsImage && (
          <div className="md:col-span-3">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const selected = event.target.files?.[0] || null;
                setForm((current) => ({ ...current, imageFile: selected }));
              }}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-slate-700"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              JPG, PNG, WEBP up to 5MB.
            </p>
            {localImagePreview && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <img
                  src={localImagePreview}
                  alt="Selected profile preview"
                  className="h-12 w-12 rounded-lg border border-slate-200 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-800">
                    {form.imageFile?.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Preview before upload
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={supportsImage ? "flex items-end gap-2 md:col-span-2" : "flex items-end gap-2 md:col-span-3"}>
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#0f4ea8] to-[#1684ef] px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto px-6 py-4">
        <table className="w-full min-w-155 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-3">Name</th>
              {supportsImage && <th className="px-2 py-3">Image</th>}
              <th className="px-2 py-3">Details</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Updated</th>
              <th className="px-2 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={supportsImage ? 6 : 5}
                  className="px-2 py-8 text-center text-sm text-slate-500"
                >
                  Loading {title.toLowerCase()}...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={supportsImage ? 6 : 5}
                  className="px-2 py-8 text-center text-sm text-slate-500"
                >
                  No records yet
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 transition hover:bg-slate-50/70 last:border-0">
                  <td className="px-2 py-3 font-semibold text-slate-800">{row.primary}</td>
                  {supportsImage && (
                    <td className="px-2 py-3">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.primary}
                          className="h-10 w-10 rounded-xl border border-slate-200 object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-400">No image</span>
                      )}
                    </td>
                  )}
                  <td className="max-w-55 truncate px-2 py-3 text-slate-600">
                    {row.secondary || "-"}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        row.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-slate-600">{extractDate(row.updatedAt)}</td>
                  <td className="px-2 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(row.id);
                          setForm({
                            primary: row.primary,
                            secondary: row.secondary || "",
                            imageFile: null,
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeactivate(row.id)}
                        disabled={row.status === "inactive" || isBusy}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Power className="h-3.5 w-3.5" />
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const mapProfileRows = (rows: CatalogProfile[] | undefined): EntityRow[] => {
  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    primary: row.full_name,
    secondary: row.bio,
    imageUrl: row.profile_image,
    status: row.status,
    updatedAt: row.updated_at,
  }));
};

const mapGenreRows = (rows: CatalogGenre[] | undefined): EntityRow[] => {
  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    primary: row.name,
    secondary: row.description,
    status: row.status,
    updatedAt: row.updated_at,
  }));
};

export default function CatalogManagementSection({
  mode = "all",
}: CatalogManagementSectionProps) {
  const actorsQuery = useGetActors();
  const directorsQuery = useGetDirectors();
  const genresQuery = useGetGenres();

  const createActor = useCreateActor();
  const updateActor = useUpdateActor();
  const deactivateActor = useDeactivateActor();

  const createDirector = useCreateDirector();
  const updateDirector = useUpdateDirector();
  const deactivateDirector = useDeactivateDirector();

  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const deactivateGenre = useDeactivateGenre();

  const directorsRows = useMemo(
    () => mapProfileRows(directorsQuery.data).sort((a, b) => a.primary.localeCompare(b.primary)),
    [directorsQuery.data],
  );

  const actorsRows = useMemo(
    () => mapProfileRows(actorsQuery.data).sort((a, b) => a.primary.localeCompare(b.primary)),
    [actorsQuery.data],
  );

  const genresRows = useMemo(
    () => mapGenreRows(genresQuery.data).sort((a, b) => a.primary.localeCompare(b.primary)),
    [genresQuery.data],
  );

  const showDirectors = mode === "all" || mode === "directors";
  const showActors = mode === "all" || mode === "actors";
  const showGenres = mode === "all" || mode === "genres";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 to-cyan-50 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Movie Catalog Controls</h2>
        <p className="text-sm text-gray-700">
          {mode === "all"
            ? "Manage directors, actors, and genres from one place with create, edit, and soft-deactivate actions."
            : "Use this section to add records, upload profile images, edit metadata, and deactivate entries."}
        </p>
      </div>

      {showDirectors && (
        <EntitySection
          title="Directors"
          description="Add and maintain director profiles used during movie upload."
          primaryLabel="Full Name"
          secondaryLabel="Bio"
          supportsImage
          rows={directorsRows}
          isLoading={directorsQuery.isPending}
          isBusy={
            createDirector.isPending || updateDirector.isPending || deactivateDirector.isPending
          }
          onCreate={(values) =>
            createDirector.mutateAsync({
              full_name: values.primary,
              bio: values.secondary || undefined,
              profile_image_file: values.imageFile || undefined,
            })
          }
          onUpdate={(id, values) =>
            updateDirector.mutateAsync({
              id,
              data: {
                full_name: values.primary,
                bio: values.secondary || undefined,
                profile_image_file: values.imageFile || undefined,
              },
            })
          }
          onDeactivate={(id) => deactivateDirector.mutateAsync(id)}
        />
      )}

      {showActors && (
        <EntitySection
          title="Actors"
          description="Maintain cast profiles available for movie casting."
          primaryLabel="Full Name"
          secondaryLabel="Bio"
          supportsImage
          rows={actorsRows}
          isLoading={actorsQuery.isPending}
          isBusy={createActor.isPending || updateActor.isPending || deactivateActor.isPending}
          onCreate={(values) =>
            createActor.mutateAsync({
              full_name: values.primary,
              bio: values.secondary || undefined,
              profile_image_file: values.imageFile || undefined,
            })
          }
          onUpdate={(id, values) =>
            updateActor.mutateAsync({
              id,
              data: {
                full_name: values.primary,
                bio: values.secondary || undefined,
                profile_image_file: values.imageFile || undefined,
              },
            })
          }
          onDeactivate={(id) => deactivateActor.mutateAsync(id)}
        />
      )}

      {showGenres && (
        <EntitySection
          title="Genres"
          description="Control genres available for movie classification."
          primaryLabel="Name"
          secondaryLabel="Description"
          rows={genresRows}
          isLoading={genresQuery.isPending}
          isBusy={createGenre.isPending || updateGenre.isPending || deactivateGenre.isPending}
          onCreate={(values) =>
            createGenre.mutateAsync({
              name: values.primary,
              description: values.secondary || undefined,
            })
          }
          onUpdate={(id, values) =>
            updateGenre.mutateAsync({
              id,
              data: {
                name: values.primary,
                description: values.secondary || undefined,
              },
            })
          }
          onDeactivate={(id) => deactivateGenre.mutateAsync(id)}
        />
      )}
    </div>
  );
}
