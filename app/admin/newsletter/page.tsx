"use client";

import NewsletterHistory from "@/components/admin/NewsletterHistory";
import SectionSkeleton from "@/components/admin/SectionSkeleton";
import { useGetBroadcasts } from "@/features/dashboard/service/newsletter";
import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";

export default function NewsLetterHome() {
  const { isPlayback } = useAdminTutorial();
  const broadcasts = useGetBroadcasts(!isPlayback);

  if (broadcasts.isPending && !isPlayback) {
    return <SectionSkeleton />;
  }

  if (broadcasts.isError && !isPlayback) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
        Newsletter history could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  return <NewsletterHistory rows={broadcasts.data || []} />;
}

