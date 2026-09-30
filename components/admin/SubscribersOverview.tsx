"use client";

import { useGetSubscribers } from "@/features/dashboard/service/newsletter";
import SectionSkeleton from "./SectionSkeleton";
import SubscribersTable from "./SubscribersHistory";
import { useAdminTutorial } from "./tutorials/AdminTutorialProvider";

export default function SubscribersOverview() {
  const { isPlayback, demoState } = useAdminTutorial();
  const subscribers = useGetSubscribers(!isPlayback);

  if (isPlayback && demoState === "subscriber-loading") {
    return (
      <div data-tutorial="subscriber-loading" role="status" className="rounded-xl border bg-white p-8 text-sm text-slate-600">
        Loading subscribers…
      </div>
    );
  }

  if (isPlayback && demoState === "subscriber-empty") {
    return (
      <div data-tutorial="subscriber-empty" className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-600">
        No subscribers found.
      </div>
    );
  }

  if (isPlayback && demoState === "subscriber-error") {
    return (
      <p data-tutorial="subscriber-error" role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
        Subscribers could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  if (subscribers.isPending && !isPlayback) {
    return <SectionSkeleton />;
  }

  if (subscribers.isError && !isPlayback) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
        Subscribers could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  return <SubscribersTable rows={subscribers.data || []} />;
}

