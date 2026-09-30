"use client";

import NewsletterHistory from "@/components/admin/NewsletterHistory";
import { useGetBroadcasts } from "@/features/dashboard/service/newsletter";
import SectionSkeleton from "./SectionSkeleton";

const NewsLetterSection = () => {
  const broadcasts = useGetBroadcasts();

  if (broadcasts.isPending) return <SectionSkeleton />;
  if (broadcasts.isError) {
    return <p className="text-sm text-red-700">Newsletter history could not be loaded.</p>;
  }

  return <NewsletterHistory rows={broadcasts.data || []} />;
};

export default NewsLetterSection;
