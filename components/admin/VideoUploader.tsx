"use client";

import { useState } from "react";
import { UploadCloud, X, Video } from "lucide-react";

export default function VideoUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const removeVideo = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
  };


  const isPending = false;

  const handleSubmit = async () => {
    if (!files.length) return;

    try {

      alert("Videos uploaded successfully!");
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-gray-600" />
        Upload Videos
      </h2>

      {/* Upload Area */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-orange-400 transition">
        <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">
          Click to upload or drag and drop
        </span>
        <input
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Preview Section */}
      {previews.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previews.map((src, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border"
            >
              <video src={src} controls className="w-full h-48 object-cover" />

              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!files.length || isPending}
        className="mt-6 w-full bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Uploading..." : "Submit Videos"}
      </button>
    </div>
  );
}
