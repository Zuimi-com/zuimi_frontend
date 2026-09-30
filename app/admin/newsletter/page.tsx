"use client";

import NewsletterHistory from "@/components/admin/NewsletterHistory";
import SectionSkeleton from "@/components/admin/SectionSkeleton";
import { useGetBroadcasts } from "@/features/dashboard/service/newsletter";

export default function NewsLetterHome() {
  const broadcasts = useGetBroadcasts();

  if (broadcasts.isPending) {
    return <SectionSkeleton />;
  }

  if (broadcasts.isError) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
        Newsletter history could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  return <NewsletterHistory rows={broadcasts.data || []} />;
}

