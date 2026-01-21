import { Newsletter } from "@/features/dashboard/newsletter/components/table/columns";
import { NewsletterDataTable } from "@/features/dashboard/newsletter/components/table/data-table";
import React from "react";
export const newsletters: Newsletter[] = [
  {
    id: "1",
    subject: "Welcome to Our Newsletter 🎉",
    date: "Jan 10, 2026",
    status: "Sent",
    rate: "78%",
  },
  {
    id: "2",
    subject: "New Features Update",
    date: "Jan 15, 2026",
    status: "Sent",
    rate: "82%",
  },
  {
    id: "3",
    subject: "Weekly Tips & Insights",
    date: "Jan 18, 2026",
    status: "Draft",
    rate: "--",
  },
  {
    id: "4",
    subject: "January Product Highlights",
    date: "Jan 20, 2026",
    status: "Scheduled",
    rate: "--",
  },
  {
    id: "5",
    subject: "Special Offer for Subscribers",
    date: "Jan 21, 2026",
    status: "Sent",
    rate: "80%",
  },
];

const NewsLetterHome = () => {
  return (
    <main className="space-y-5">
      <h1 className="font-bold text-2xl">Newsletter History</h1>
      <NewsletterDataTable data={newsletters} />
    </main>
  );
};

export default NewsLetterHome;
