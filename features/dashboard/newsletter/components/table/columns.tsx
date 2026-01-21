"use client";

import { ColumnDef } from "@tanstack/react-table";


export type NewsletterStatus = "Sent" | "Draft" | "Scheduled";

export type Newsletter = {
  id: string;
  subject: string;
  date: string;
  status: NewsletterStatus;
  rate: string;
};


const statusStyles: Record<NewsletterStatus, string> = {
  Sent: "bg-green-100 text-green-700",
  Draft: "bg-gray-100 text-gray-700",
  Scheduled: "bg-yellow-100 text-yellow-700",
};


export const columns: ColumnDef<Newsletter>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as NewsletterStatus;

      return (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "rate",
    header: "Rate",
  },
];
