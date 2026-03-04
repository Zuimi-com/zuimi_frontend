"use client";
import { useGetNewsLetter } from "@/features/dashboard/service/newsletter";
import SectionSkeleton from "./SectionSkeleton";
import SubscribersTable, { SubscribersRow } from "./SubscribersHistory";

export default function SubscribersOverview() {
  const { data, isPending } = useGetNewsLetter();

  if (isPending || !data) {
    return <SectionSkeleton />;
  }

  const subscribers: SubscribersRow[] = data.map((data) => ({
    subject: data.email,
    dateSent: data.subscribed_at,
    status: data.status,
    openRate: data.openRate!,
  }));

  return <SubscribersTable rows={subscribers} />;
}
