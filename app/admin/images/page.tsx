import ImageGallery from "@/components/admin/ImageGallery";
import ImageUploader from "@/components/admin/ImageUploader";
import React from "react";

const ImagesHomePage = () => {
  return (
    <div>
      <ImageUploader />
      <ImageGallery />
    </div>
  );
};

export default ImagesHomePage;
