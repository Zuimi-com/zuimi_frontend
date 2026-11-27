"use client";

import { extractDate } from "@/lib/utils";
import {
  CatalogGenre,
  CatalogProducer,
  CatalogProfile,
  useCreateActor,
  useCreateDirector,
  useCreateGenre,
  useCreateProducer,
  useSendProducerVerification,
  useDeactivateActor,
  useDeactivateDirector,
  useDeactivateGenre,
  useDeactivateProducer,
  useActivateActor,
  useActivateDirector,
  useActivateGenre,
  useActivateProducer,
  useGetActors,
  useGetDirectors,
  useGetGenres,
  useGetProducers,
  useUpdateActor,
  useUpdateDirector,
  useUpdateGenre,
  useUpdateProducer,
} from "@/features/dashboard/service/movie-catalog";
import { AlertCircle, BriefcaseBusiness, Camera, Check, Crown, Film, Loader2, Music, Pencil, Plus, Power, Trash2, X, RotateCcw } from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";
import { hasAdminPermission } from "@/features/dashboard/permissions";
import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";

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
  emailVerified?: boolean;
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
  canManage: boolean;
  onCreate: (values: FormValues) => Promise<MutationResult>;
  onUpdate: (id: string, values: FormValues) => Promise<MutationResult>;
  onDeactivate: (id: string) => Promise<MutationResult>;
  onActivate: (id: string) => Promise<MutationResult>;
  onSendVerification?: (id: string) => Promise<void>;
};

export type CatalogSectionMode = "all" | "directors" | "actors" | "genres" | "producers";

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
      <div
        data-tutorial="catalog-confirm-dialog"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
      >
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
  canManage,
  onCreate,
  onUpdate,
  onDeactivate,
  onActivate,
  onSendVerification,
}: EntitySectionProps) {
  const fieldsId = useId();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>({
    primary: "",
    secondary: "",
    imageFile: null,
  });
  const [imageError, setImageError] = useState("");
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(null);
  const [activateConfirm, setActivateConfirm] = useState<string | null>(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { isPlayback, demoState } = useAdminTutorial();
  const tutorialSlug = title.toLowerCase();
  const fixtureRow: EntityRow = {
    id: `tutorial-${tutorialSlug}`,
    primary: title === "Genres" ? "Drama" : `Tutorial ${title.slice(0, -1)}`,
    secondary:
      title === "Producers"
        ? "producer@example.com"
        : title === "Genres"
          ? "Character-led stories"
          : "A local example used only during this tutorial.",
    imageUrl: null,
    status: demoState === "reactivate" ? "inactive" : "active",
    updatedAt: new Date().toISOString(),
  };
  const displayRows = isPlayback ? [fixtureRow] : rows;

  const activeCount = displayRows.filter(
    (item) => item.status === "active",
  ).length;

  const inactiveCount = displayRows.length - activeCount;

  const resetForm = () => {
    setAdding(false);
    setImageError("");
    setEditingId(null);
    setForm({ primary: "", secondary: "", imageFile: null });
  };

  useEffect(() => {
    if (!isPlayback || demoState !== "edit") return;
    setEditingId(fixtureRow.id);
    setForm({
      primary: fixtureRow.primary,
      secondary: fixtureRow.secondary || "",
      imageFile: null,
    });
  }, [demoState, isPlayback, title]);

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
    if (!canManage || isPlayback) return;

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
    if (!canManage || isPlayback) return;
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
    if (!canManage || isPlayback) return;
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

  const isProducer = title === "Producers";
  const secondaryLimit = title === "Directors" ? 2000 : title === "Genres" ? 500 : undefined;
  const formId = `${fieldsId}-form`;

  const getEntityIcon = () => {
    if (title === "Directors") return <Crown className="h-5 w-5" />;
    if (title === "Actors") return <Film className="h-5 w-5" />;
    if (title === "Producers") return <BriefcaseBusiness className="h-5 w-5" />;
    if (title === "Genres") return <Music className="h-5 w-5" />;
    return <Plus className="h-5 w-5" />;
  };

  const cropImage = async () => {
    const original = form.imageFile;
    if (!original) return;
    try {
      const bitmap = await createImageBitmap(original);
      try {
        const edge = Math.min(bitmap.width, bitmap.height);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = Math.min(edge, 1024);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Image editor unavailable");
        context.drawImage(
          bitmap, (bitmap.width - edge) / 2, (bitmap.height - edge) / 2,
          edge, edge, 0, 0, canvas.width, canvas.height,
        );
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob || blob.size > 5 * 1024 * 1024) throw new Error("Cropped image is too large");
        const cropped = new File([blob], "profile-crop.png", { type: "image/png" });
        setForm((current) => current.imageFile === original ? { ...current, imageFile: cropped } : current);
        setImageError("");
      } finally {
        bitmap.close();
      }
    } catch {
      setImageError("Could not crop this image. You can upload the original or choose another image.");
    }
  };

  const entryForm = (
          <form
            id={formId}
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
              <div
                data-tutorial={`catalog-${tutorialSlug}-primary`}
                className={supportsImage ? "md:col-span-3" : "md:col-span-4"}
              >
                <label htmlFor={`${fieldsId}-name`} className="mb-2 block text-sm font-semibold text-slate-700">
                  {primaryLabel}
                </label>
                <input
                  id={`${fieldsId}-name`}
                  autoFocus
                  required
                  value={form.primary}
                  disabled={isPlayback}
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
                        : title === "Producers"
                          ? "Ava DuVernay"
                        : "Action"
                  }`}
                />
              </div>

              <div
                data-tutorial={`catalog-${tutorialSlug}-secondary`}
                className={supportsImage ? "md:col-span-4" : "md:col-span-5"}
              >
                <label htmlFor={`${fieldsId}-details`} className="mb-2 block text-sm font-semibold text-slate-700">
                  {secondaryLabel}
                </label>
                <input
                  id={`${fieldsId}-details`}
                  type={isProducer ? "email" : "text"}
                  required={isProducer}
                  maxLength={secondaryLimit}
                  value={form.secondary}
                  disabled={isPlayback}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      secondary: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={isProducer ? "producer@example.com" : `Optional ${secondaryLabel.toLowerCase()}`}
                />
              </div>

              {supportsImage && (
                <div
                  data-tutorial={`catalog-${tutorialSlug}-image`}
                  className="md:col-span-3"
                >
                  <label htmlFor={`${fieldsId}-image`} className="mb-2 block text-sm font-semibold text-slate-700">
                    Profile Image
                  </label>
                  <div className="relative">
                    <input
                      id={`${fieldsId}-image`}
                      type="file"
                      disabled={isPlayback}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => {
                        const selected = event.target.files?.[0] || null;
                        setImageError("");
                        if (selected && (
                          !["image/png", "image/jpeg", "image/webp"].includes(selected.type)
                          || selected.size > 5 * 1024 * 1024
                        )) {
                          event.currentTarget.value = "";
                          setImageError("Choose a JPG, PNG, or WEBP image up to 5 MB.");
                          setForm((current) => ({ ...current, imageFile: null }));
                          return;
                        }
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

                  {imageError && <p role="alert" className="mt-2 text-xs text-red-700">{imageError}</p>}
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
                        <p className="text-xs text-emerald-600 mt-1">Ready to upload</p>
                        {title === "Directors" && (
                          <button type="button" onClick={() => void cropImage()} className="mt-1 text-xs font-medium text-blue-700 hover:underline">
                            Crop to a centred square
                          </button>
                        )}
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
                  data-tutorial={`catalog-${tutorialSlug}-submit`}
                  type="submit"
                  disabled={isPlayback || isBusy || !form.primary.trim()}
                  className="inline-flex w-full flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#0f4ea8] to-[#1684ef] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {editingId ? "Update" : "Create entry"}
                </button>

                {(editingId || adding) && (
                  <button
                    aria-label="Cancel editing"
                    data-tutorial={`catalog-${tutorialSlug}-cancel`}
                    type="button"
                    onClick={() => {
                      if (!isPlayback) resetForm();
                    }}
                    disabled={isPlayback}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </form>

  );

  return (
    <section
      data-tutorial={`catalog-${tutorialSlug}-overview`}
      className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-lg shadow-slate-200/60"
    >
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
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsExpanded(true);
                setAdding(true);
              }}
              disabled={!canManage || isPlayback || isBusy}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add New Entry
            </button>
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
          {canManage && !editingId && (adding || isPlayback) && entryForm}
          {/* Data Section */}
          <div className="px-6 py-6">
            {isLoading && !isPlayback ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-lg bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : displayRows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/50 py-8 text-center">
                <div className="mb-3 flex justify-center">
                  {title === "Directors" ? (
                    <Crown className="h-8 w-8 text-slate-400" />
                  ) : title === "Actors" ? (
                    <Film className="h-8 w-8 text-slate-400" />
                  ) : title === "Producers" ? (
                    <BriefcaseBusiness className="h-8 w-8 text-slate-400" />
                  ) : (
                    <Music className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <p className="mb-1 text-sm font-medium text-slate-600">
                  No {title.toLowerCase()} yet
                </p>
                <p className="text-xs text-slate-500">
                  Select Add New Entry to create the first record.
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
                    {displayRows.map((row) => (
                      <Fragment key={row.id}>
                      <tr
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
                          {isProducer && row.secondary && (
                            row.emailVerified ? (
                              <span className="text-xs font-medium text-emerald-700">Email verified</span>
                            ) : (
                              <button
                                type="button"
                                className="mt-1 text-xs font-medium text-blue-700 hover:underline disabled:opacity-50"
                                disabled={!canManage || isPlayback || isBusy}
                                onClick={async () => {
                                  try {
                                    await onSendVerification?.(row.id);
                                    toast.success("Verification email sent");
                                  } catch (error) {
                                    toast.error(getErrorMessage(error));
                                  }
                                }}
                              >
                                Send verification email
                              </button>
                            )
                          )}
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
                                  ? `bg-emerald-500 ${isProducer ? "motion-safe:animate-pulse" : ""}`
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
                              data-tutorial={`catalog-${tutorialSlug}-edit`}
                              type="button"
                              aria-label={`Edit ${row.primary}`}
                              onClick={() => {
                                setAdding(false);
                                setImageError("");
                                setEditingId(row.id);
                                setForm({
                                  primary: row.primary,
                                  secondary: row.secondary || "",
                                  imageFile: null,
                                });
                              }}
                              disabled={!canManage || isPlayback}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>

                            {row.status === "inactive" ? (
                              <button
                                data-tutorial={`catalog-${tutorialSlug}-reactivate`}
                                type="button"
                                onClick={() =>
                                  setActivateConfirm(row.id)
                                }
                                disabled={!canManage || isPlayback}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  Reactivate
                                </span>
                              </button>
                            ) : (
                              <button
                                data-tutorial={`catalog-${tutorialSlug}-deactivate`}
                                type="button"
                                onClick={() =>
                                  setDeactivateConfirm(row.id)
                                }
                                disabled={!canManage || isPlayback || isBusy}
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
                      {canManage && editingId === row.id && (
                        <tr>
                          <td colSpan={supportsImage ? 6 : 5}>{entryForm}</td>
                        </tr>
                      )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!deactivateConfirm || (isPlayback && demoState === "deactivate")}
        title="Deactivate entry?"
        description="This entry will be marked as inactive and won't appear in listings. You can reactivate it later."
        confirmText="Deactivate"
        cancelText="Cancel"
        isDangerous
        isLoading={deactivateLoading || isPlayback}
        onConfirm={handleDeactivateClick}
        onCancel={() => setDeactivateConfirm(null)}
      />

      <ConfirmDialog
        isOpen={!!activateConfirm || (isPlayback && demoState === "reactivate")}
        title="Reactivate entry?"
        description="This entry will be marked as active and will appear in listings."
        confirmText="Reactivate"
        cancelText="Cancel"
        isDangerous={false}
        isLoading={activateLoading || isPlayback}
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
    status: row.is_active ? "active" : "inactive",
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

const mapProducerRows = (rows: CatalogProducer[] | undefined): EntityRow[] => {
  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    primary: row.full_name,
    secondary: row.email,
    emailVerified: Boolean(row.email_verified_at),
    status: row.status,
    updatedAt: row.updated_at,
  }));
};

export default function CatalogManagementSection({
  mode = "all",
}: CatalogManagementSectionProps) {
  const { isPlayback } = useAdminTutorial();
  const { admin } = useAdminAuth();
  const canManageCatalog = hasAdminPermission(admin, "catalog", "manage");
  const actorsQuery = useGetActors(!isPlayback && (mode === "all" || mode === "actors"));
  const directorsQuery = useGetDirectors(!isPlayback && (mode === "all" || mode === "directors"));
  const genresQuery = useGetGenres(!isPlayback && (mode === "all" || mode === "genres"));
  const producersQuery = useGetProducers(!isPlayback && (mode === "all" || mode === "producers"));

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

  const createProducer = useCreateProducer();
  const sendVerification = useSendProducerVerification();
  const updateProducer = useUpdateProducer();
  const deactivateProducer = useDeactivateProducer();
  const activateProducer = useActivateProducer();

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

  const producersRows = useMemo(
    () => mapProducerRows(producersQuery.data).sort((a, b) => a.primary.localeCompare(b.primary)),
    [producersQuery.data],
  );

  const showDirectors = mode === "all" || mode === "directors";
  const showActors = mode === "all" || mode === "actors";
  const showGenres = mode === "all" || mode === "genres";
  const showProducers = mode === "all" || mode === "producers";

  const totalRecords = directorsRows.length + actorsRows.length + genresRows.length + producersRows.length;
  const totalActive = 
    directorsRows.filter(r => r.status === "active").length +
    actorsRows.filter(r => r.status === "active").length +
    genresRows.filter(r => r.status === "active").length +
    producersRows.filter(r => r.status === "active").length;

  return (
    <div className="space-y-6">

      {/* Content Sections */}
      {showProducers && (
        <EntitySection
          canManage={hasAdminPermission(admin, "producers", "manage")}
          title="Producers"
          description="Add and maintain producers available during movie upload."
          primaryLabel="Full Name"
          secondaryLabel="Email"
          rows={producersRows}
          isLoading={producersQuery.isPending}
          isBusy={
            createProducer.isPending ||
            updateProducer.isPending ||
            deactivateProducer.isPending ||
            activateProducer.isPending ||
            sendVerification.isPending
          }
          onCreate={(values) =>
            createProducer.mutateAsync({
              full_name: values.primary,
              email: values.secondary,
            })
          }
          onUpdate={(id, values) =>
            updateProducer.mutateAsync({
              id,
              data: {
                full_name: values.primary,
                email: values.secondary,
              },
            })
          }
          onDeactivate={(id) => deactivateProducer.mutateAsync(id)}
          onActivate={(id) => activateProducer.mutateAsync(id)}
          onSendVerification={(id) => sendVerification.mutateAsync(id)}
        />
      )}

      {showDirectors && (
        <EntitySection
          canManage={canManageCatalog}
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
              bio: values.secondary,
              profile_image_file: values.imageFile || undefined,
            })
          }
          onUpdate={(id, values) =>
            updateDirector.mutateAsync({
              id,
              data: {
                full_name: values.primary,
                bio: values.secondary,
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
          canManage={canManageCatalog}
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
              bio: values.secondary,
              profile_image_file: values.imageFile || undefined,
            })
          }
          onUpdate={(id, values) =>
            updateActor.mutateAsync({
              id,
              data: {
                full_name: values.primary,
                bio: values.secondary,
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
          canManage={canManageCatalog}
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
              description: values.secondary,
            })
          }
          onUpdate={(id, values) =>
            updateGenre.mutateAsync({
              id,
              data: {
                name: values.primary,
                description: values.secondary,
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
