"use client";
import NewsletterHistory, {
  NewsletterRow,
} from "@/components/admin/NewsletterHistory";
import SectionSkeleton from "@/components/admin/SectionSkeleton";
import { useGetNewsLetter } from "@/features/dashboard/service/newsletter";

const NewsLetterHome = () => {
  const { data, isPending } = useGetNewsLetter();

  if (isPending || !data) {
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

export default NewsLetterHome;
