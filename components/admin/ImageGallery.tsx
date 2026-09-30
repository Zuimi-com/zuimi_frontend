"use client";

import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import {
  NewsletterMedia,
  useGetLetterImages,
} from "@/features/dashboard/service/images";
import { Check, Copy, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 8;
const demoImages: NewsletterMedia[] = Array.from({ length: 9 }, (_, index) => ({
  id: `demo-image-${index + 1}`,
  media_type: "IMAGE",
  media_data: { url: `https://media.zuimi.example/newsletter/demo-${index + 1}.jpg` },
  uploaded_at: "2026-09-20T10:00:00Z",
}));

export default function ImageGallery() {
  const { isPlayback } = useAdminTutorial();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const query = useGetLetterImages(!isPlayback);

  const images = useMemo(
    () =>
      (isPlayback ? demoImages : query.data || []).filter(
        (item) => item.media_type === "IMAGE" && item.media_data?.url,
      ),
    [isPlayback, query.data],
  );
  const totalPages = Math.max(1, Math.ceil(images.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const pageImages = images.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const copyToClipboard = async (url: string, id: string) => {
    if (isPlayback) return;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section data-tutorial="image-gallery" className="mx-auto mt-10 max-w-6xl">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <ImageIcon className="h-5 w-5 text-gray-600" />
        Uploaded Images
      </h2>

      {query.isPending && !isPlayback ? <p className="mb-4 text-sm text-gray-500">Loading images…</p> : null}
      {query.isError && !isPlayback ? <p className="mb-4 text-sm text-red-700">Images could not be loaded.</p> : null}
      {!query.isPending && !isPlayback && images.length === 0 ? <p className="mb-4 text-sm text-gray-500">No images uploaded yet.</p> : null}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {pageImages.map((image, index) => {
          const url = image.media_data!.url!;
          const demo = image.id.startsWith("demo-");
          return (
            <article key={image.id} className="group relative overflow-hidden rounded-lg border bg-white">
              {demo ? (
                <div className="grid aspect-square w-full place-items-center bg-gradient-to-br from-blue-100 via-pink-50 to-orange-100 text-xs font-medium text-slate-500">
                  Demo newsletter image
                </div>
              ) : (
                <Image src={url} alt="Uploaded newsletter media" width={400} height={400} className="aspect-square w-full object-cover" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  data-tutorial={index === 0 ? "image-copy-link" : undefined}
                  onClick={() => copyToClipboard(url, image.id)}
                  disabled={isPlayback}
                  className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-800 shadow disabled:cursor-default"
                >
                  {copiedId === image.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  {copiedId === image.id ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {images.length > ITEMS_PER_PAGE ? (
        <div data-tutorial="image-pagination" className="mt-6 flex items-center justify-between gap-4">
          <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={isPlayback || currentPage === 1} className="rounded-md border bg-white px-3 py-2 text-sm disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={isPlayback || currentPage === totalPages} className="rounded-md border bg-white px-3 py-2 text-sm disabled:opacity-50">
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}

