"use client";

import { useGetSubscribers } from "@/features/dashboard/service/newsletter";
import SectionSkeleton from "./SectionSkeleton";
import SubscribersTable from "./SubscribersHistory";

export default function SubscribersOverview() {
  const subscribers = useGetSubscribers();

  if (subscribers.isPending) {
    return <SectionSkeleton />;
  }

  if (subscribers.isError) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
        Subscribers could not be loaded. Refresh the page to try again.
      </p>
    );
  }

  return <SubscribersTable rows={subscribers.data || []} />;
}

