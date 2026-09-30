"use client";

import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import { useUploadLetterImages } from "@/features/dashboard/service/images";
import { Image as ImageIcon, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default function ImageUploader() {
  const { isPlayback, demoState } = useAdminTutorial();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const upload = useUploadLetterImages();
  const showDemoSelection = isPlayback && demoState === "images-selected";

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview)),
    [previews],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    const valid = selected.filter(
      (file) => ALLOWED_TYPES.includes(file.type) && file.size <= MAX_IMAGE_BYTES,
    );
    const rejected = selected.length - valid.length;
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setFiles(valid);
    setPreviews(valid.map((file) => URL.createObjectURL(file)));
    setMessage(
      rejected
        ? `${rejected} file${rejected === 1 ? "" : "s"} skipped. Use JPG, PNG, GIF, or WEBP up to 5MB.`
        : "",
    );
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async () => {
    if (!files.length || isPlayback) return;
    const result = await upload.mutateAsync(files);
    if (result.failed.length) {
      setMessage(
        `${result.uploaded.length} uploaded; ${result.failed.length} failed. Try the failed files again.`,
      );
    } else {
      setMessage(`${result.uploaded.length} image${result.uploaded.length === 1 ? "" : "s"} uploaded.`);
    }
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setFiles([]);
    setPreviews([]);
  };

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-gray-100 bg-white p-6 shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <ImageIcon className="h-5 w-5 text-gray-600" />
        Upload Newsletter Images
      </h2>

      <label
        data-tutorial="image-picker"
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-8 transition hover:border-orange-400"
      >
        <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
        <span className="text-sm text-gray-500">Click to choose images</span>
        <span className="mt-1 text-xs text-gray-400">JPG, PNG, GIF, or WEBP · 5MB each</span>
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileChange}
          disabled={isPlayback}
          className="hidden"
        />
      </label>

      {(previews.length > 0 || showDemoSelection) ? (
        <div data-tutorial="image-preview" className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {showDemoSelection && previews.length === 0 ? (
            <div className="relative grid aspect-square place-items-center rounded-lg border bg-gradient-to-br from-blue-100 to-pink-100">
              <span className="text-xs font-medium text-slate-600">zuimi-feature.jpg</span>
              <button
                type="button"
                data-tutorial="image-remove"
                disabled
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            previews.map((src, index) => (
              <div key={src} className="group relative overflow-hidden rounded-lg border">
                <Image src={src} alt={files[index]?.name || "Preview"} width={300} height={300} className="aspect-square w-full object-cover" />
                <button
                  type="button"
                  data-tutorial={index === 0 ? "image-remove" : undefined}
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                  aria-label={`Remove ${files[index]?.name || "image"}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : null}

      <button
        type="button"
        data-tutorial="image-upload"
        onClick={handleSubmit}
        disabled={isPlayback || !files.length || upload.isPending}
        className="mt-6 w-full rounded-lg bg-orange-500 py-2.5 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {upload.isPending ? "Uploading images…" : "Upload Images"}
      </button>
      {message ? <p role="status" className="mt-3 text-sm text-slate-600">{message}</p> : null}
    </section>
  );
}

