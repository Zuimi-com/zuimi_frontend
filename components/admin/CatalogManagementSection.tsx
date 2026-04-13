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

type Feedback = {
  tone: "success" | "error";
  title: string;
  status: number | string;
  payload: unknown;
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

const getErrorFeedback = (error: unknown): Feedback => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as {
      response?: {
        status?: number;
        data?: unknown;
      };
      message?: string;
    };

    return {
      tone: "error",
      title: err.message || "Request failed",
      status: err.response?.status || "failed",
      payload: err.response?.data || null,
    };
  }

  return {
    tone: "error",
    title: "Request failed",
    status: "failed",
    payload: null,
  };
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
  const [feedback, setFeedback] = useState<Feedback | null>(null);

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
      setFeedback({
        tone: "error",
        title: `${primaryLabel} is required`,
        status: "validation",
        payload: null,
      });
      return;
    }

    try {
      const payload = {
        primary: primaryValue,
        secondary: form.secondary.trim(),
        imageFile: form.imageFile,
      };

      const result = editingId
        ? await onUpdate(editingId, payload)
        : await onCreate(payload);

      setFeedback({
        tone: "success",
        title: editingId
          ? `${title} updated successfully`
          : `${title} created successfully`,
        status: result.status,
        payload: result.payload,
      });
      resetForm();
    } catch (error) {
      setFeedback(getErrorFeedback(error));
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const result = await onDeactivate(id);
      setFeedback({
        tone: "success",
        title: `${title} deactivated successfully`,
        status: result.status,
        payload: result.payload,
      });
    } catch (error) {
      setFeedback(getErrorFeedback(error));
    }
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white/95 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <span>{activeCount} active</span>
          <span className="text-blue-300">/</span>
          <span>{rows.length - activeCount} inactive</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 border-b border-gray-100 px-5 py-4 md:grid-cols-12"
      >
        <div className={supportsImage ? "md:col-span-3" : "md:col-span-4"}>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            {primaryLabel}
          </label>
          <input
            value={form.primary}
            onChange={(event) =>
              setForm((current) => ({ ...current, primary: event.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder={`Enter ${primaryLabel.toLowerCase()}`}
          />
        </div>

        <div className={supportsImage ? "md:col-span-4" : "md:col-span-5"}>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
            {secondaryLabel}
          </label>
          <input
            value={form.secondary}
            onChange={(event) =>
              setForm((current) => ({ ...current, secondary: event.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder={`Optional ${secondaryLabel.toLowerCase()}`}
          />
        </div>

        {supportsImage && (
          <div className="md:col-span-3">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Profile Image
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => {
                const selected = event.target.files?.[0] || null;
                setForm((current) => ({ ...current, imageFile: selected }));
              }}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 file:mr-2 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-700"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              JPG, PNG, WEBP up to 5MB.
            </p>
            {localImagePreview && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-2">
                <img
                  src={localImagePreview}
                  alt="Selected profile preview"
                  className="h-12 w-12 rounded-md border border-blue-200 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-blue-900">
                    {form.imageFile?.name}
                  </p>
                  <p className="text-[11px] text-blue-700">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zuimi-blue px-3 py-2 text-sm font-medium text-white hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto px-5 py-4">
        <table className="w-full min-w-155 text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
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
                  className="px-2 py-6 text-center text-sm text-gray-500"
                >
                  Loading {title.toLowerCase()}...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={supportsImage ? 6 : 5}
                  className="px-2 py-6 text-center text-sm text-gray-500"
                >
                  No records yet
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-2 py-3 font-medium text-gray-900">{row.primary}</td>
                  {supportsImage && (
                    <td className="px-2 py-3">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.primary}
                          className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No image</span>
                      )}
                    </td>
                  )}
                  <td className="max-w-55 truncate px-2 py-3 text-gray-600">
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
                  <td className="px-2 py-3 text-gray-600">{extractDate(row.updatedAt)}</td>
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
                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs text-gray-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeactivate(row.id)}
                        disabled={row.status === "inactive" || isBusy}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
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

      {feedback && (
        <div
          className={`mx-5 mb-5 rounded-lg border p-3 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <p className="font-semibold">
            {feedback.title} <span className="font-normal">(status: {feedback.status})</span>
          </p>
          <p className="mt-1 text-xs opacity-90">Latest payload result:</p>
          <pre className="mt-2 max-h-40 overflow-auto rounded bg-black/5 p-2 text-xs text-gray-800">
            {JSON.stringify(feedback.payload, null, 2)}
          </pre>
        </div>
      )}
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
