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
import { useMemo, useState } from "react";
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
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <select
        multiple
        value={value}
        onChange={(event) =>
          onChange(Array.from(event.target.selectedOptions).map((option) => option.value))
        }
        className="h-28 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function FileUploadField({
  label,
  help,
  accept,
  file,
  onChange,
}: {
  label: string;
  help: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <label className="block rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 transition hover:border-blue-400 hover:bg-blue-50/40">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700"
      />
      <p className="mt-2 truncate text-xs text-slate-500">
        {file ? `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB` : help}
      </p>
    </label>
  );
}

function AssetStatusBadge({ asset }: { asset: MovieAsset }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[asset.status]}`}
    >
      {statusIcons[asset.status]}
      {asset.status}
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
  const canProcess = latestJob?.status === "queued" || latestJob?.status === "failed";

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canProcess && (
        <button
          type="button"
          onClick={onProcess}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
        >
          {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Process
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
          Retry
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
    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("Duration must be greater than zero");
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

      toast.success("Movie created");
      setSelectedMovieId(movie.id);
      setMovieForm(initialMovieForm);
      formElement.reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleUploadAsset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedMovieId) {
      toast.error("Select a movie");
      return;
    }

    if (!sourceFile) {
      toast.error("Select a source video");
      return;
    }

    try {
      await uploadAsset.mutateAsync({
        movieId: selectedMovieId,
        sourceFile,
      });
      toast.success("Source video uploaded");
      setSourceFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const runAssetAction = async (assetId: string, action: () => Promise<unknown>, message: string) => {
    setActiveActionId(assetId);
    try {
      await action();
      toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActiveActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Movie Uploads
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Create movie records, upload source files, and manage stream readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            moviesQuery.refetch();
            assetsQuery.refetch();
            producersQuery.refetch();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
          <div className="bg-linear-to-r from-slate-50 via-white to-blue-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Video className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Movie record
                </h2>
                <p className="text-sm text-slate-600">
                  Metadata must exist before a source video can be attached.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateMovie} className="space-y-5 px-6 py-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Title
                </span>
                <input
                  value={movieForm.title}
                  onChange={(event) => updateMovieForm({ title: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                  <span>Producer</span>
                  <Link
                    href="/admin/producers"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Manage producers
                  </Link>
                </span>
                <select
                  value={movieForm.producer}
                  onChange={(event) => updateMovieForm({ producer: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a producer</option>
                  {producers.map((producer) => (
                    <option key={producer.id} value={producer.id}>
                      {producer.full_name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Release date
                </span>
                <input
                  type="date"
                  value={movieForm.releaseDate}
                  onChange={(event) => updateMovieForm({ releaseDate: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Duration
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={movieForm.duration}
                    onChange={(event) => updateMovieForm({ duration: event.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Price (ZTK)
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
                      value={movieForm.price}
                      onChange={(event) => updateMovieForm({ price: event.target.value })}
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

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </span>
              <textarea
                value={movieForm.description}
                onChange={(event) => updateMovieForm({ description: event.target.value })}
                rows={3}
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
                  onChange={(event) => updateMovieForm({ directorId: event.target.value })}
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
                  onChange={(event) => updateMovieForm({ language: event.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Rating
                </span>
                <input
                  value={movieForm.rating}
                  onChange={(event) => updateMovieForm({ rating: event.target.value })}
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

            <div className="grid gap-4 md:grid-cols-3">
              <FileUploadField
                label="Poster image"
                help="JPG, PNG, or WEBP • Max 10MB"
                accept="image/jpeg,image/png,image/webp"
                file={movieForm.posterFile}
                onChange={(posterFile) => updateMovieForm({ posterFile })}
              />

              <FileUploadField
                label="Movie title artwork"
                help="SVG only • Max 2MB"
                accept="image/svg+xml,.svg"
                file={movieForm.titleSvgFile}
                onChange={(titleSvgFile) => updateMovieForm({ titleSvgFile })}
              />

              <FileUploadField
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
                disabled={createMovie.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#0f4ea8] to-[#1684ef] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-50"
              >
                {createMovie.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Create movie
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
          <div className="bg-linear-to-r from-slate-50 via-white to-emerald-50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Source upload
                </h2>
                <p className="text-sm text-slate-600">
                  Attach the master video file to a movie record.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUploadAsset} className="space-y-5 px-6 py-6">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Movie
              </span>
              <select
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

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Source video
              </span>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-m4v,video/x-matroska"
                onChange={(event) => setSourceFile(event.target.files?.[0] || null)}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
              />
            </label>

            {sourceFile && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <FileVideo className="h-5 w-5 text-emerald-700" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {sourceFile.name}
                  </p>
                  <p className="text-xs text-emerald-700">
                    {(sourceFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploadAsset.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {uploadAsset.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload source
            </button>
          </form>
        </section>
      </div>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Processing queue
            </h2>
            <p className="text-sm text-slate-600">
              {sortedAssets.length} source asset{sortedAssets.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto px-6 py-6">
          {assetsQuery.isPending ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-xl bg-linear-to-r from-slate-200 to-slate-100"
                />
              ))}
            </div>
          ) : sortedAssets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
              <FileVideo className="mx-auto mb-3 h-9 w-9 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                No uploaded source files
              </p>
            </div>
          ) : (
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-3">Movie</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Renditions</th>
                  <th className="px-4 py-3">Manifest</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssets.map((asset) => {
                  const isBusy =
                    activeActionId === asset.id ||
                    processJob.isPending ||
                    retryAsset.isPending ||
                    publishAsset.isPending ||
                    unpublishAsset.isPending;
                  const activeManifest = asset.manifests.find((manifest) => manifest.is_active);

                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-slate-100 transition hover:bg-blue-50/30 last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">
                          {asset.movie_title}
                        </p>
                        <p className="mt-1 font-mono text-xs text-slate-500">
                          {asset.movie}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {asset.source_filename || "No file"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {(asset.source_size_bytes / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <AssetStatusBadge asset={asset} />
                          <p className="text-xs text-slate-500">
                            {asset.is_streamable ? "Published" : "Not published"}
                          </p>
                          {asset.failure_reason && (
                            <p className="max-w-xs text-xs text-red-600">
                              {asset.failure_reason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {asset.renditions.length > 0 ? (
                            asset.renditions.map((rendition) => (
                              <span
                                key={rendition.id}
                                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                              >
                                {rendition.label}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {activeManifest ? (
                          <p className="max-w-[220px] truncate font-mono text-xs text-slate-600">
                            {activeManifest.manifest_path}
                          </p>
                        ) : (
                          <span className="text-sm text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {extractDate(asset.updated_at)}
                      </td>
                      <td className="px-4 py-4">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
