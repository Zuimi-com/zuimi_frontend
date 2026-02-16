"use client";
import React from "react";
import NewsletterHistory, {
  NewsletterRow,
} from "@/components/admin/NewsletterHistory";
import { useGetBroadcasts, useGetNewsLetter } from "@/features/dashboard/service/newsletter";
import SectionSkeleton from "./SectionSkeleton";

const NewsLetterSection = () => {
  const { data, isPending: isLoadingNewsLetter } = useGetNewsLetter();
  const { data: broadcasts } = useGetBroadcasts()
  
  console.log(broadcasts);
  

  if (isLoadingNewsLetter || !data) {
    return <SectionSkeleton />;
  }

  const newsLetters: NewsletterRow[] = data.map((data) => ({
    subject: data.email,
    dateSent: data.subscribed_at,
    status: data.status,
    openRate: data.openRate!,
  }));

  return <NewsletterHistory rows={newsLetters} />;
};

export default NewsLetterSection;
