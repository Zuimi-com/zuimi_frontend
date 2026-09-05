"use client";

import {
  CatalogGenre,
  CatalogProfile,
  useGetActors,
  useGetDirectors,
  useGetGenres,
  useGetProducers,
} from "@/features/dashboard/service/movie-catalog";
import {
  MovieAsset,
  useCreateMovie,
  useGetMovieAssets,
  useGetMovies,
  useProcessMovieAssetJob,
  usePublishMovieAsset,
  useRetryMovieAssetProcessing,
  useUnpublishMovieAsset,
  useUploadMovieAsset,
} from "@/features/dashboard/service/movies";
import { extractDate } from "@/lib/utils";
import {
  CheckCircle2,
  CircleOff,
  Clock3,
  FileVideo,
  Loader2,
  Play,
  RefreshCcw,
  Send,
  Upload,
  Video,
  XCircle,
} from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

type MovieFormState = {
  title: string;
  description: string;
  releaseDate: string;
  duration: string;
  price: string;
  producer: string;
  directorId: string;
  genreIds: string[];
  actorIds: string[];
  rating: string;
  language: string;
  posterFile: File | null;
  titleSvgFile: File | null;
  trailerFile: File | null;
};

const initialMovieForm: MovieFormState = {
  title: "",
  description: "",
  releaseDate: "",
  duration: "",
  price: "0.00",
  producer: "",
  directorId: "",
  genreIds: [],
  actorIds: [],
  rating: "",
  language: "English",
  posterFile: null,
  titleSvgFile: null,
  trailerFile: null,
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as {
      response?: {
        data?: Record<string, unknown>;
      };
      message?: string;
    };
    const serverMessage = err.response?.data
      ? Object.values(err.response.data).flat().join(" ")
      : "";
    return serverMessage || err.message || "Request failed";
  }
  return "Request failed";
};

const statusStyles: Record<MovieAsset["status"], string> = {
  uploaded: "bg-sky-100 text-sky-700",
  processing: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

const statusIcons: Record<MovieAsset["status"], React.ReactNode> = {
  uploaded: <Clock3 className="h-3.5 w-3.5" />,
  processing: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  ready: <CheckCircle2 className="h-3.5 w-3.5" />,
  failed: <XCircle className="h-3.5 w-3.5" />,
};

function MultiSelect({
  label,
  value,
  options,
  getLabel,
  onChange,
}: {
  label: string;
  value: string[];
  options: Array<CatalogGenre | CatalogProfile>;
  getLabel: (option: CatalogGenre | CatalogProfile) => string;
  onChange: (value: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const visible = options.filter((option) =>
    getLabel(option).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <fieldset className="min-w-0 rounded-xl border border-slate-200 p-4">
      <legend className="px-1 text-sm font-semibold text-slate-700">
        {label}{" "}
        <span className="font-normal text-slate-500">
          · {value.length} selected
        </span>
      </legend>
      <input
        type="search"
        aria-label={`Search ${label.toLowerCase()}`}
        placeholder={`Search ${label.toLowerCase()}…`}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-blue-500"
      />
      <div className="max-h-40 space-y-1 overflow-y-auto">
        {visible.map((option) => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm text-slate-700 hover:bg-blue-50"
          >
            <input
              type="checkbox"
              checked={value.includes(option.id)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...value, option.id]
                    : value.filter((id) => id !== option.id),
                )
              }
              className="h-4 w-4 accent-blue-600"
            />
            {getLabel(option)}
          </label>
        ))}
        {visible.length === 0 && (
          <p className="p-2 text-sm text-slate-500">
            {options.length
              ? "No matches. Try another name."
              : `No ${label.toLowerCase()} available yet.`}
          </p>
        )}
      </div>
    </fieldset>
  );
}

function FileUploadField({
  label,
  help,
  accept,
  file,
  onChange,
  maxMB,
  extensions,
}: {
  label: string;
  help: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
  maxMB?: number;
  extensions: string[];
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  return (
    <div className="min-w-0 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        aria-describedby={`${id}-help`}
        aria-invalid={!!error}
        onChange={(event) => {
          const next = event.target.files?.[0];
          if (!next) return;
          const extension = next.name.split(".").pop()?.toLowerCase() || "";
          if (
            !extensions.includes(extension) ||
            next.size === 0 ||
            (maxMB && next.size > maxMB * 1024 * 1024)
          ) {
            setError(
              `Choose a non-empty ${extensions.join(", ").toUpperCase()} file${maxMB ? ` up to ${maxMB} MB` : ""}.`,
            );
            event.target.value = "";
            onChange(null);
            return;
          }
          setError("");
          onChange(next);
        }}
        className="block w-full min-w-0 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:font-semibold file:text-blue-700"
      />
      <p id={`${id}-help`} className="mt-2 text-xs leading-5 text-slate-500">
        {help}
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {file && (
        <div className="mt-3 flex items-start justify-between gap-2 text-sm">
          <p className="min-w-0 break-words text-slate-700">
            {file.name}
            <span className="block text-xs text-slate-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </p>
          <button
            type="button"
            aria-label={`Remove ${label.toLowerCase()}`}
            onClick={() => {
              onChange(null);
              setError("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="rounded px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function AssetStatusBadge({ asset }: { asset: MovieAsset }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[asset.status]}`}
    >
      {statusIcons[asset.status]}
      {asset.is_streamable
        ? "Published"
        : {
            uploaded: "Waiting to process",
            processing: "Preparing video",
            ready: "Ready to publish",
            failed: "Needs attention",
          }[asset.status]}
    </span>
  );
}

function AssetActions({
  asset,
  isBusy,
  onProcess,
  onRetry,
  onPublish,
  onUnpublish,
}: {
  asset: MovieAsset;
  isBusy: boolean;
  onProcess: () => void;
  onRetry: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}) {
  const latestJob = asset.latest_job;
  const canProcess =
    asset.status !== "failed" &&
    (latestJob?.status === "queued" || latestJob?.status === "failed");

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canProcess && (
        <button
          type="button"
          onClick={onProcess}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
        >
          {isBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Prepare video
        </button>
      )}

      {asset.status === "failed" && (
        <button
          type="button"
          onClick={onRetry}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Retry processing
        </button>
      )}

      {asset.status === "ready" &&
        (asset.is_streamable ? (
          <button
            type="button"
            onClick={onUnpublish}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <CircleOff className="h-3.5 w-3.5" />
            Unpublish
          </button>
        ) : (
          <button
            type="button"
            onClick={onPublish}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            Publish
          </button>
        ))}
    </div>
  );
}

export default function MovieUploadSection() {
  const [step, setStep] = useState<"details" | "video">("details");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");
  const [movieFileKey, setMovieFileKey] = useState(0);
  const [sourceFileKey, setSourceFileKey] = useState(0);
  const videoHeading = useRef<HTMLHeadingElement>(null);
  const queueHeading = useRef<HTMLHeadingElement>(null);
  const [movieForm, setMovieForm] = useState<MovieFormState>(initialMovieForm);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const moviesQuery = useGetMovies();
  const assetsQuery = useGetMovieAssets();
  const directorsQuery = useGetDirectors();
  const actorsQuery = useGetActors();
  const genresQuery = useGetGenres();
  const producersQuery = useGetProducers();

  const createMovie = useCreateMovie();
  const uploadAsset = useUploadMovieAsset();
  const processJob = useProcessMovieAssetJob();
  const retryAsset = useRetryMovieAssetProcessing();
  const publishAsset = usePublishMovieAsset();
  const unpublishAsset = useUnpublishMovieAsset();

  const sortedMovies = useMemo(
    () =>
      [...(moviesQuery.data || [])].sort((a, b) =>
        a.title.localeCompare(b.title),
      ),
    [moviesQuery.data],
  );

  const directors = useMemo(
    () => (directorsQuery.data || []).filter((item) => item.is_active),
    [directorsQuery.data],
  );

  const actors = useMemo(
    () => (actorsQuery.data || []).filter((item) => item.is_active),
    [actorsQuery.data],
  );

  const genres = useMemo(
    () => (genresQuery.data || []).filter((item) => item.is_active),
    [genresQuery.data],
  );

  const producers = useMemo(
    () => (producersQuery.data || []).filter((item) => item.is_active),
    [producersQuery.data],
  );

  const sortedAssets = useMemo(
    () =>
      [...(assetsQuery.data || [])].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      ),
    [assetsQuery.data],
  );

  const updateMovieForm = (patch: Partial<MovieFormState>) => {
    setMovieForm((current) => ({ ...current, ...patch }));
  };

  const handleCreateMovie = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (!movieForm.title.trim()) {
      toast.error("Movie title is required");
      return;
    }

    if (!movieForm.producer.trim()) {
      toast.error("Select a producer");
      return;
    }

    if (!movieForm.releaseDate) {
      toast.error("Release date is required");
      return;
    }

    const duration = Number(movieForm.duration);
    if (!Number.isInteger(duration) || duration <= 0) {
      toast.error("Enter the duration in whole minutes, greater than zero");
      return;
    }

    const price = Number(movieForm.price);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Price must be a valid non-negative amount");
      return;
    }

    const formElement = event.currentTarget;

    try {
      const movie = await createMovie.mutateAsync({
        title: movieForm.title.trim(),
        description: movieForm.description.trim() || undefined,
        release_date: movieForm.releaseDate,
        duration,
        price: price.toFixed(2),
        producer: movieForm.producer.trim(),
        director_id: movieForm.directorId || undefined,
        genre_ids: movieForm.genreIds,
        actor_ids: movieForm.actorIds,
        rating: movieForm.rating.trim() || undefined,
        language: movieForm.language.trim() || undefined,
        poster_file: movieForm.posterFile || undefined,
        title_svg_file: movieForm.titleSvgFile || undefined,
        trailer_file: movieForm.trailerFile || undefined,
      });

      toast.success("Movie details saved");
      setNotice(
        `“${movie.title}” is saved. Next, upload the full movie video.`,
      );
      setStep("video");
      requestAnimationFrame(() => videoHeading.current?.focus());
      setSelectedMovieId(movie.id);
      setMovieForm(initialMovieForm);
      formElement.reset();
      setMovieFileKey((current) => current + 1);
    } catch (error) {
      setFormError(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  const handleUploadAsset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (!selectedMovieId) {
      toast.error("Select a movie");
      return;
    }

    if (!sourceFile) {
      toast.error("Select a source video");
      return;
    }

    setUploadProgress(0);
    try {
      await uploadAsset.mutateAsync({
        movieId: selectedMovieId,
        sourceFile,
        onProgress: setUploadProgress,
      });
      toast.success("Source video uploaded");
      setSourceFile(null);
      setSourceFileKey((current) => current + 1);
      setAssetFilter("all");
      setAssetSearch("");
      setNotice(
        "Video uploaded. Follow its status below, then publish when it is ready.",
      );
      queueHeading.current?.focus();
    } catch (error) {
      setFormError(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    }
  };

  const runAssetAction = async (
    assetId: string,
    action: () => Promise<unknown>,
    message: string,
  ) => {
    setFormError("");
    setActiveActionId(assetId);
    try {
      await action();
      toast.success(message);
    } catch (error) {
      setFormError(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    } finally {
      setActiveActionId(null);
    }
  };

  const visibleAssets = sortedAssets.filter(
    (asset) =>
      `${asset.movie_title} ${asset.source_filename}`
        .toLowerCase()
        .includes(assetSearch.toLowerCase()) &&
      (assetFilter === "all" ||
        (assetFilter === "published"
          ? asset.is_streamable
          : assetFilter === "ready"
            ? asset.status === "ready" && !asset.is_streamable
            : asset.status === assetFilter)),
  );
  const existingUpload = sortedAssets.find(
    (asset) => asset.movie === selectedMovieId,
  );
  const catalogQueries = [
    moviesQuery,
    producersQuery,
    directorsQuery,
    actorsQuery,
    genresQuery,
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Upload a movie
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Add the movie details, upload the full video, then publish it for
            viewers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            moviesQuery.refetch();
            assetsQuery.refetch();
            producersQuery.refetch();
            directorsQuery.refetch();
            actorsQuery.refetch();
            genresQuery.refetch();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <ol
        aria-label="Movie upload workflow"
        className="grid gap-3 sm:grid-cols-3"
      >
        {[
          { title: "Add movie details", help: "Title, cast and artwork" },
          {
            title: "Upload full video",
            help: "Choose the movie and its video file",
          },
          {
            title: "Prepare & publish",
            help: "Make the video ready for viewers",
          },
        ].map((item, index) => (
          <li
            key={item.title}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.help}</p>
            </div>
          </li>
        ))}
      </ol>
      {catalogQueries.some((query) => query.isError) && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          Some movie or catalog options could not load. Use Refresh to try again
          before continuing.
        </div>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </p>
      )}
      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {formError}
        </p>
      )}
      <div className="flex flex-wrap gap-2" aria-label="Choose upload task">
        <button
          type="button"
          disabled={createMovie.isPending || uploadAsset.isPending}
          aria-pressed={step === "details"}
          onClick={() => setStep("details")}
          className={`rounded-xl px-5 py-3 text-sm font-semibold ${step === "details" ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
        >
          1. Add a new movie
        </button>
        <button
          type="button"
          disabled={createMovie.isPending || uploadAsset.isPending}
          aria-pressed={step === "video"}
          onClick={() => setStep("video")}
          className={`rounded-xl px-5 py-3 text-sm font-semibold ${step === "video" ? "bg-blue-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
        >
          2. Upload video for a saved movie
        </button>
      </div>
      <div>
        <section
          hidden={step !== "details"}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
        >
          <div className="bg-linear-to-r from-slate-50 via-white to-blue-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Movie details
                </h2>
                <p className="text-sm text-slate-600">
                  Start with the essentials. Fields marked * are required; all
                  others are optional.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateMovie} className="px-4 py-6 sm:px-6">
            <fieldset
              disabled={createMovie.isPending}
              className="min-w-0 space-y-6"
            >
              <h3 className="font-semibold text-slate-900">The essentials</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Movie title *
                  </span>
                  <input
                    required
                    value={movieForm.title}
                    onChange={(event) =>
                      updateMovieForm({ title: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                    <span>Producer *</span>
                    <Link
                      href="/admin/producers"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Manage producers (opens in a new tab)"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Manage producers
                    </Link>
                  </span>
                  <select
                    required
                    disabled={
                      producersQuery.isPending || producersQuery.isError
                    }
                    value={movieForm.producer}
                    onChange={(event) =>
                      updateMovieForm({ producer: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">
                      {producersQuery.isPending
                        ? "Loading producers…"
                        : "Select a producer"}
                    </option>
                    {producers.map((producer) => (
                      <option key={producer.id} value={producer.id}>
                        {producer.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Release date *
                  </span>
                  <input
                    type="date"
                    required
                    value={movieForm.releaseDate}
                    onChange={(event) =>
                      updateMovieForm({ releaseDate: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Duration (minutes) *
                    </span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={movieForm.duration}
                      onChange={(event) =>
                        updateMovieForm({ duration: event.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Price (ZTK) *
                    </span>
                    <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                      <span className="border-r border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600">
                        ZTK
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        required
                        value={movieForm.price}
                        onChange={(event) =>
                          updateMovieForm({ price: event.target.value })
                        }
                        onBlur={() => {
                          const value = Number(movieForm.price);
                          if (Number.isFinite(value) && value >= 0) {
                            updateMovieForm({ price: value.toFixed(2) });
                          }
                        }}
                        className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                  </label>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Enter the running time in minutes (for example, 95). Set the
                price to 0.00 for free access. Missing a producer? Add them
                using Manage producers.
              </p>
              <h3 className="border-t border-slate-100 pt-6 font-semibold text-slate-900">
                About the movie{" "}
                <span className="text-sm font-normal text-slate-500">
                  · Optional
                </span>
              </h3>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Synopsis
                </span>
                <textarea
                  value={movieForm.description}
                  onChange={(event) =>
                    updateMovieForm({ description: event.target.value })
                  }
                  placeholder="Give viewers a short summary of the story."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Director
                  </span>
                  <select
                    value={movieForm.directorId}
                    onChange={(event) =>
                      updateMovieForm({ directorId: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">None</option>
                    {directors.map((director) => (
                      <option key={director.id} value={director.id}>
                        {director.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Language
                  </span>
                  <input
                    value={movieForm.language}
                    onChange={(event) =>
                      updateMovieForm({ language: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Rating
                  </span>
                  <input
                    value={movieForm.rating}
                    onChange={(event) =>
                      updateMovieForm({ rating: event.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <MultiSelect
                  label="Genres"
                  value={movieForm.genreIds}
                  options={genres}
                  getLabel={(option) => (option as CatalogGenre).name}
                  onChange={(genreIds) => updateMovieForm({ genreIds })}
                />
                <MultiSelect
                  label="Cast"
                  value={movieForm.actorIds}
                  options={actors}
                  getLabel={(option) => (option as CatalogProfile).full_name}
                  onChange={(actorIds) => updateMovieForm({ actorIds })}
                />
              </div>

              <h3 className="border-t border-slate-100 pt-6 font-semibold text-slate-900">
                Artwork & trailer{" "}
                <span className="text-sm font-normal text-slate-500">
                  · Optional
                </span>
              </h3>
              <p className="text-sm text-slate-500">
                Add promotional files here. You will upload the full movie in
                the next step.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <FileUploadField
                  key={`poster-${movieFileKey}`}
                  maxMB={10}
                  extensions={["jpg", "jpeg", "png", "webp"]}
                  label="Poster image"
                  help="JPG, PNG, or WEBP • Max 10MB"
                  accept="image/jpeg,image/png,image/webp"
                  file={movieForm.posterFile}
                  onChange={(posterFile) => updateMovieForm({ posterFile })}
                />

                <FileUploadField
                  key={`artwork-${movieFileKey}`}
                  maxMB={2}
                  extensions={["svg"]}
                  label="Movie title artwork"
                  help="SVG only • Max 2MB"
                  accept="image/svg+xml,.svg"
                  file={movieForm.titleSvgFile}
                  onChange={(titleSvgFile) => updateMovieForm({ titleSvgFile })}
                />

                <FileUploadField
                  key={`trailer-${movieFileKey}`}
                  maxMB={250}
                  extensions={["mp4", "mov", "m4v", "webm"]}
                  label="Trailer"
                  help="MP4, MOV, M4V, or WEBM • Max 250MB"
                  accept="video/mp4,video/quicktime,video/webm,.m4v"
                  file={movieForm.trailerFile}
                  onChange={(trailerFile) => updateMovieForm({ trailerFile })}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    createMovie.isPending ||
                    producersQuery.isPending ||
                    producersQuery.isError
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#0f4ea8] to-[#1684ef] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
                >
                  {createMovie.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {createMovie.isPending
                    ? "Saving movie…"
                    : "Save details & continue"}
                </button>
              </div>
            </fieldset>
          </form>
        </section>

        <section
          hidden={step !== "video"}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
        >
          <div className="bg-linear-to-r from-slate-50 via-white to-emerald-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h2
                  ref={videoHeading}
                  tabIndex={-1}
                  className="text-xl font-semibold text-slate-900"
                >
                  Upload the full movie
                </h2>
                <p className="text-sm text-slate-600">
                  Choose a saved movie, then select its full-length video.
                  Uploading does not publish it.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUploadAsset} className="px-4 py-6 sm:px-6">
            <fieldset
              disabled={uploadAsset.isPending}
              className="min-w-0 space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Movie
                </span>
                <select
                  required
                  disabled={moviesQuery.isPending || moviesQuery.isError}
                  value={selectedMovieId}
                  onChange={(event) => setSelectedMovieId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select movie</option>
                  {sortedMovies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </label>

              {!moviesQuery.isPending &&
                !moviesQuery.isError &&
                sortedMovies.length === 0 && (
                  <p className="text-sm text-slate-600">
                    No movies yet. Choose “Add a new movie” above to save the
                    details first.
                  </p>
                )}
              {existingUpload && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  This movie already has a video. Uploading a new file will
                  replace it and remove streaming access until the replacement
                  is prepared and published.
                </p>
              )}
              <FileUploadField
                key={`source-${sourceFileKey}`}
                label="Full movie video"
                help="MP4, MOV, M4V or MKV. Choose the full movie, not its trailer."
                accept=".mp4,.mov,.m4v,.mkv"
                extensions={["mp4", "mov", "m4v", "mkv"]}
                file={sourceFile}
                onChange={setSourceFile}
              />
              {uploadAsset.isPending && (
                <div className="rounded-xl bg-blue-50 p-4">
                  <p
                    role="status"
                    className="mb-2 text-sm font-semibold text-blue-800"
                  >
                    {uploadProgress === 100
                      ? "Upload sent. Waiting for the server to finish saving…"
                      : `Uploading video… ${uploadProgress}%`}
                  </p>
                  <progress
                    aria-label="Video upload progress"
                    max={100}
                    value={uploadProgress}
                    className="h-2 w-full accent-blue-600"
                  />
                  <p className="mt-2 text-xs text-blue-700">
                    Keep this page open until the upload is complete.
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={
                  uploadAsset.isPending ||
                  !selectedMovieId ||
                  !sourceFile ||
                  moviesQuery.isError
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {uploadAsset.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploadAsset.isPending
                  ? "Uploading…"
                  : existingUpload
                    ? "Replace movie video"
                    : "Upload full movie"}
              </button>
            </fieldset>
          </form>
        </section>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
          <h2
            ref={queueHeading}
            tabIndex={-1}
            className="text-xl font-semibold text-slate-900"
          >
            3. Prepare & publish
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Prepare each uploaded video for playback. When it is ready, select
            Publish to make it available to viewers.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Status updates automatically every 10 seconds.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              aria-label="Search uploaded movies"
              placeholder="Search movie title or filename…"
              value={assetSearch}
              onChange={(event) => setAssetSearch(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-blue-500"
            />
            <select
              aria-label="Filter uploads by status"
              value={assetFilter}
              onChange={(event) => setAssetFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700"
            >
              <option value="all">All uploads ({sortedAssets.length})</option>
              <option value="uploaded">Waiting to process</option>
              <option value="processing">Preparing video</option>
              <option value="ready">Ready to publish</option>
              <option value="published">Published</option>
              <option value="failed">Needs attention</option>
            </select>
          </div>
        </div>
        <div className="space-y-3 p-4 sm:p-6">
          {assetsQuery.isError ? (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
            >
              Uploads could not load. Use Refresh to try again.
            </p>
          ) : assetsQuery.isPending ? (
            <p
              role="status"
              className="flex items-center gap-2 py-8 text-sm text-slate-600"
            >
              <Loader2 className="h-4 w-4 animate-spin" /> Loading uploads…
            </p>
          ) : visibleAssets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <FileVideo className="mx-auto mb-3 h-9 w-9 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                {sortedAssets.length
                  ? "No uploads match your search"
                  : "Your uploaded videos will appear here"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {sortedAssets.length
                  ? "Try another title or choose All uploads."
                  : "Save the movie details and upload its full video to get started."}
              </p>
            </div>
          ) : (
            visibleAssets.map((asset) => {
              const isBusy =
                activeActionId !== null ||
                processJob.isPending ||
                retryAsset.isPending ||
                publishAsset.isPending ||
                unpublishAsset.isPending;
              const nextStep = asset.is_streamable
                ? "Available to viewers. Unpublish to remove streaming access."
                : asset.status === "ready"
                  ? "Your video is ready. Select Publish when you want viewers to watch it."
                  : asset.status === "failed"
                    ? "The video could not be prepared. Retry processing; if it fails again, share the details with support."
                    : asset.status === "processing"
                      ? "The video is being prepared. Its status will update here."
                      : "Your upload is saved. Select Prepare video if the job is waiting to start.";
              return (
                <article
                  key={asset.id}
                  className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-slate-900">
                        {asset.movie_title}
                      </h3>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {asset.source_filename || "Unnamed video"} ·{" "}
                        {(asset.source_size_bytes / (1024 * 1024)).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                    <div className="shrink-0">
                      <AssetStatusBadge asset={asset} />
                    </div>
                  </div>
                  <p
                    className={`mt-4 text-sm ${asset.status === "failed" ? "text-red-700" : "text-slate-600"}`}
                  >
                    {nextStep}
                  </p>
                  <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <p className="text-xs text-slate-500">
                      Updated {extractDate(asset.updated_at)}
                      {asset.renditions.length
                        ? ` · ${asset.renditions.map((item) => item.label).join(", ")} available`
                        : ""}
                    </p>
                    <AssetActions
                      asset={asset}
                      isBusy={isBusy}
                      onProcess={() => {
                        if (!asset.latest_job) return;
                        runAssetAction(
                          asset.id,
                          () => processJob.mutateAsync(asset.latest_job!.id),
                          "Processing started",
                        );
                      }}
                      onRetry={() =>
                        runAssetAction(
                          asset.id,
                          () => retryAsset.mutateAsync(asset.id),
                          "Retry queued",
                        )
                      }
                      onPublish={() =>
                        runAssetAction(
                          asset.id,
                          () => publishAsset.mutateAsync(asset.id),
                          "Movie published",
                        )
                      }
                      onUnpublish={() =>
                        runAssetAction(
                          asset.id,
                          () => unpublishAsset.mutateAsync(asset.id),
                          "Movie unpublished",
                        )
                      }
                    />
                  </div>
                  <details className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <summary className="w-fit cursor-pointer rounded font-medium focus-visible:outline-blue-500">
                      Technical details for support
                    </summary>
                    <dl className="mt-3 space-y-2 break-all">
                      <div>
                        <dt className="font-semibold">Upload ID</dt>
                        <dd>{asset.id}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Movie ID</dt>
                        <dd>{asset.movie}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Processing job</dt>
                        <dd>
                          {asset.latest_job?.status || "No job available"}
                        </dd>
                      </div>
                      {(asset.failure_reason ||
                        asset.latest_job?.error_message) && (
                        <div className="text-red-700">
                          <dt className="font-semibold">Error</dt>
                          <dd>
                            {asset.failure_reason ||
                              asset.latest_job?.error_message}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="font-semibold">Playback manifest</dt>
                        <dd>
                          {asset.manifests.find(
                            (manifest) => manifest.is_active,
                          )?.manifest_path || "Not available yet"}
                        </dd>
                      </div>
                    </dl>
                  </details>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
