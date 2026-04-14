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
  useActivateActor,
  useActivateDirector,
  useActivateGenre,
  useGetActors,
  useGetDirectors,
  useGetGenres,
  useUpdateActor,
  useUpdateDirector,
  useUpdateGenre,
} from "@/features/dashboard/service/movie-catalog";
import { AlertCircle, Camera, Check, Crown, Film, Loader2, Music, Pencil, Plus, Power, Trash2, X, RotateCcw } from "lucide-react";
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
  onActivate: (id: string) => Promise<MutationResult>;
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

function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText,
  cancelText,
  isDangerous,
  isLoading,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  isDangerous: boolean;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isDangerous ? "bg-red-100" : "bg-blue-100"
            }`}
          >
            {isDangerous ? (
              <AlertCircle className="h-6 w-6 text-red-600" />
            ) : (
              <Check className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  onActivate,
}: EntitySectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>({
    primary: "",
    secondary: "",
    imageFile: null,
  });
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);
  const [activateConfirm, setActivateConfirm] = useState<string | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const activeCount = useMemo(
    () => rows.filter((item) => item.status === "active").length,
    [rows],
  );

  const inactiveCount = rows.length - activeCount;

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
        toast.success(`${title.slice(0, -1)} updated successfully`);
      } else {
        await onCreate(payload);
        toast.success(`${title.slice(0, -1)} added successfully`);
      }

      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeactivateClick = async () => {
    if (!deactivateConfirm) return;

    setDeactivateLoading(true);
    try {
      await onDeactivate(deactivateConfirm);
      toast.success(`${title.slice(0, -1)} deactivated successfully`);
      setDeactivateConfirm(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleActivateClick = async () => {
    if (!activateConfirm) return;

    setActivateLoading(true);
    try {
      await onActivate(activateConfirm);
      toast.success(`${title.slice(0, -1)} reactivated successfully`);
      setActivateConfirm(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActivateLoading(false);
    }
  };

  const getEntityIcon = () => {
    if (title === "Directors") return <Crown className="h-5 w-5" />;
    if (title === "Actors") return <Film className="h-5 w-5" />;
    if (title === "Genres") return <Music className="h-5 w-5" />;
    return <Plus className="h-5 w-5" />;
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/60">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-50 via-white to-blue-50 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
              {getEntityIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-900">{activeCount}</span>
                <span className="text-slate-600">active</span>
              </div>
              {inactiveCount > 0 && (
                <>
                  <div className="h-3 border-l border-slate-300" />
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-900">{inactiveCount}</span>
                    <span className="text-slate-600">inactive</span>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {isExpanded ? "Hide" : "Show"} details
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Form Section */}
          <form
            onSubmit={handleSubmit}
            className="border-y border-slate-100 bg-slate-50/70 px-6 py-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                {editingId ? "Edit entry" : "Add new entry"}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-12">
              <div className={supportsImage ? "md:col-span-3" : "md:col-span-4"}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {primaryLabel}
                </label>
                <input
                  value={form.primary}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      primary: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={`e.g., ${
                    title === "Directors"
                      ? "Christopher Nolan"
                      : title === "Actors"
                        ? "Leonardo DiCaprio"
                        : "Action"
                  }`}
                />
              </div>

              <div className={supportsImage ? "md:col-span-4" : "md:col-span-5"}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {secondaryLabel}
                </label>
                <input
                  value={form.secondary}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      secondary: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={`Optional ${secondaryLabel.toLowerCase()}`}
                />
              </div>

              {supportsImage && (
                <div className="md:col-span-3">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Profile Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const selected = event.target.files?.[0] || null;
                        setForm((current) => ({
                          ...current,
                          imageFile: selected,
                        }));
                      }}
                      className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-blue-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-700"
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    JPG, PNG, or WEBP • Max 5MB
                  </p>

                  {localImagePreview && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <img
                        src={localImagePreview}
                        alt="Selected preview"
                        className="h-14 w-14 rounded-md border border-emerald-200 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-800">
                          {form.imageFile?.name}
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          ✓ Ready to upload
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                className={`flex items-end gap-2 ${
                  supportsImage ? "md:col-span-2" : "md:col-span-3"
                }`}
              >
                <button
                  type="submit"
                  disabled={isBusy || !form.primary.trim()}
                  className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#0f4ea8] to-[#1684ef] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Data Section */}
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center">
                <div className="mb-3 flex justify-center">
                  {title === "Directors" ? (
                    <Crown className="h-8 w-8 text-slate-400" />
                  ) : title === "Actors" ? (
                    <Film className="h-8 w-8 text-slate-400" />
                  ) : (
                    <Music className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <p className="mb-1 text-sm font-medium text-slate-600">
                  No {title.toLowerCase()} yet
                </p>
                <p className="text-xs text-slate-500">
                  Add your first entry using the form above to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Name
                      </th>
                      {supportsImage && (
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                          Image
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Last Updated
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 transition hover:bg-blue-50/30 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">
                            {row.primary}
                          </p>
                        </td>
                        {supportsImage && (
                          <td className="px-4 py-3">
                            {row.imageUrl ? (
                              <img
                                src={row.imageUrl}
                                alt={row.primary}
                                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50">
                                <Camera className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-600">
                            {row.secondary ? (
                              <span>{row.secondary}</span>
                            ) : (
                              <span className="italic text-slate-400">
                                No details
                              </span>
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold gap-1.5 ${
                              row.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${
                                row.status === "active"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            {row.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-600">
                            {extractDate(row.updatedAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
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
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            {row.status === "inactive" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setActivateConfirm(row.id)
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  Reactivate
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeactivateConfirm(row.id)
                                }
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  Deactivate
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!deactivateConfirm}
        title="Deactivate entry?"
        description="This entry will be marked as inactive and won't appear in listings. You can reactivate it later."
        confirmText="Deactivate"
        cancelText="Cancel"
        isDangerous
        isLoading={deactivateLoading}
        onConfirm={handleDeactivateClick}
        onCancel={() => setDeactivateConfirm(null)}
      />

      <ConfirmDialog
        isOpen={!!activateConfirm}
        title="Reactivate entry?"
        description="This entry will be marked as active and will appear in listings."
        confirmText="Reactivate"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={activateLoading}
        onConfirm={handleActivateClick}
        onCancel={() => setActivateConfirm(null)}
      />
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
  const activateActor = useActivateActor();

  const createDirector = useCreateDirector();
  const updateDirector = useUpdateDirector();
  const deactivateDirector = useDeactivateDirector();
  const activateDirector = useActivateDirector();

  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();
  const deactivateGenre = useDeactivateGenre();
  const activateGenre = useActivateGenre();

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

  const totalRecords = directorsRows.length + actorsRows.length + genresRows.length;
  const totalActive = 
    directorsRows.filter(r => r.status === "active").length +
    actorsRows.filter(r => r.status === "active").length +
    genresRows.filter(r => r.status === "active").length;

  return (
    <div className="space-y-6">

      {/* Content Sections */}
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
            createDirector.isPending || updateDirector.isPending || deactivateDirector.isPending || activateDirector.isPending
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
          onActivate={(id) => activateDirector.mutateAsync(id)}
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
          isBusy={createActor.isPending || updateActor.isPending || deactivateActor.isPending || activateActor.isPending}
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
          onActivate={(id) => activateActor.mutateAsync(id)}
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
          isBusy={createGenre.isPending || updateGenre.isPending || deactivateGenre.isPending || activateGenre.isPending}
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
          onActivate={(id) => activateGenre.mutateAsync(id)}
        />
      )}
    </div>
  );
}
