"use client";

import { useState } from "react";
import Image from "next/image";
import { Copy, Check, Image as ImageIcon } from "lucide-react";
import { useGetLetterImages } from "@/features/dashboard/service/images";

type ServerImage = {
  id: string;
  url: string;
};

const dummyImages: ServerImage[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  },
];

export default function ImageGallery() {
  const [images] = useState<ServerImage[]>(dummyImages);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { data, isPending } = useGetLetterImages();

  console.log(data);
  

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

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative rounded-lg overflow-hidden border bg-white"
          >
            <Image
              src={`${image.url}?auto=format&fit=crop&w=800&q=80`}
              alt="Uploaded"
              width={400}
              height={400}
              className="w-full aspect-square object-cover"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                onClick={() =>
                  copyToClipboard(
                    `${image.url}?auto=format&fit=crop&w=800&q=80`,
                    image.id,
                  )
                }
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
    </div>
  );
}
