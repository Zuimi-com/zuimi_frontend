"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Copy, Check, Image as ImageIcon } from "lucide-react";
import { useGetLetterImages } from "@/features/dashboard/service/images";

type GalleryImage = {
  id: string;
  url: string;
  uploadedAt: string;
};

type NewsletterMedia = {
  id: string;
  media_type: string;
  media_data?: {
    url?: string;
  };
  uploaded_at: string;
};

const ITEMS_PER_PAGE = 8;

export default function ImageGallery() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isPending } = useGetLetterImages();

  const images = useMemo<GalleryImage[]>(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return (data as NewsletterMedia[])
      .filter((item) => item.media_type === "IMAGE" && item.media_data?.url)
      .map((item) => ({
        id: item.id,
        url: item.media_data!.url!,
        uploadedAt: item.uploaded_at,
      }));
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(images.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  const paginatedImages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return images.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, images]);

  const copyToClipboard = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-gray-600" />
        Uploaded Images
      </h2>

      {isPending && <p className="mb-4 text-sm text-gray-500">Loading images...</p>}

      {!isPending && images.length === 0 && (
        <p className="mb-4 text-sm text-gray-500">No images uploaded yet.</p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {paginatedImages.map((image) => (
          <div
            key={image.id}
            className="group relative rounded-lg overflow-hidden border bg-white"
          >
            <Image
              src={image.url}
              alt="Uploaded"
              width={400}
              height={400}
              className="w-full aspect-square object-cover"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                onClick={() => copyToClipboard(image.url, image.id)}
                className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              >
                {copiedId === image.id ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length > ITEMS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
            disabled={currentPage === 1}
            className="rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
