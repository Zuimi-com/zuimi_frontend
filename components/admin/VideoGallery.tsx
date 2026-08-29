"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Check, Video } from "lucide-react";

type GalleryVideo = {
  id: string;
  url: string;
  uploadedAt: string;
};

const ITEMS_PER_PAGE = 6;

const DUMMY_VIDEOS: GalleryVideo[] = [
  {
    id: "1",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    uploadedAt: "2025-01-01",
  },
  {
    id: "2",
    url: "https://www.w3schools.com/html/movie.mp4",
    uploadedAt: "2025-01-02",
  },
  {
    id: "3",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    uploadedAt: "2025-01-03",
  },
  {
    id: "4",
    url: "https://www.w3schools.com/html/movie.mp4",
    uploadedAt: "2025-01-04",
  },
  {
    id: "5",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    uploadedAt: "2025-01-05",
  },
  {
    id: "6",
    url: "https://www.w3schools.com/html/movie.mp4",
    uploadedAt: "2025-01-06",
  },
  {
    id: "7",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    uploadedAt: "2025-01-07",
  },
];

export default function VideoGallery() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 💡 using dummy data instead of API
  const videos = useMemo(() => DUMMY_VIDEOS, []);

  const totalPages = Math.max(1, Math.ceil(videos.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  const paginatedVideos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return videos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, videos]);

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
        <Video className="w-5 h-5 text-gray-600" />
        Uploaded Videos
      </h2>

      {videos.length === 0 && (
        <p className="mb-4 text-sm text-gray-500">No videos uploaded yet.</p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {paginatedVideos.map((video) => (
          <div
            key={video.id}
            className="group relative rounded-lg overflow-hidden border bg-white"
          >
            <video
              src={video.url}
              className="w-full h-48 object-cover"
              muted
              preload="metadata"
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                onClick={() => copyToClipboard(video.url, video.id)}
                className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow hover:bg-gray-100 transition"
              >
                {copiedId === video.id ? (
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

      {videos.length > ITEMS_PER_PAGE && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() =>
              setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
            }
            disabled={currentPage === 1}
            className="rounded-md border bg-white px-3 py-2 text-sm disabled:opacity-50"
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
            className="rounded-md border bg-white px-3 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
