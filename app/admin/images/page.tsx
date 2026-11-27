"use client";

import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";
import { hasAdminPermission } from "@/features/dashboard/permissions";
import ImageGallery from "@/components/admin/ImageGallery";
import ImageUploader from "@/components/admin/ImageUploader";
import React from "react";

const ImagesHomePage = () => {
  const { admin } = useAdminAuth();
  return (
    <div>
      {hasAdminPermission(admin, "newsletter", "manage") && <ImageUploader />}
      <ImageGallery />
    </div>
  );
};

export default ImagesHomePage;
