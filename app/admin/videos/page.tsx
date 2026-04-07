import VideoGallery from "@/components/admin/VideoGallery";
import VideoUploader from "@/components/admin/VideoUploader";
import React from "react";

const VideoHomePage = () => {
  return (
    <div className="space-y-5">
      <VideoUploader />
      <VideoGallery />
    </div>
  );
};

export default VideoHomePage;
