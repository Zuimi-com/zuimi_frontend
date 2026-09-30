"use client";

import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import { NewsletterBroadcast } from "@/features/dashboard/service/newsletter";

const demoBroadcasts: NewsletterBroadcast[] = [
  {
    id: "demo-draft",
    subject: "October filmmaker update",
    body: "<p>Demo</p>",
    image_attachments: [],
    video_attachments: [],
    status: "DRAFT",
    created_at: "2026-09-28T10:00:00Z",
    updated_at: "2026-09-28T10:00:00Z",
    sent_at: null,
    recipient_count: 0,
    sent_count: 0,
    last_error: "",
  },
  {
    id: "demo-sent",
    subject: "New releases this week",
    body: "<p>Demo</p>",
    image_attachments: [],
    video_attachments: [],
    status: "SENT",
    created_at: "2026-09-20T10:00:00Z",
    updated_at: "2026-09-20T10:15:00Z",
    sent_at: "2026-09-20T10:15:00Z",
    recipient_count: 2500,
    sent_count: 2498,
    last_error: "",
  },
  {
    id: "demo-failed",
    subject: "Festival announcement",
    body: "<p>Demo</p>",
    image_attachments: [],
    video_attachments: [],
    status: "FAILED",
    created_at: "2026-09-18T10:00:00Z",
    updated_at: "2026-09-18T10:05:00Z",
    sent_at: null,
    recipient_count: 2500,
    sent_count: 0,
    last_error: "Delivery provider did not accept the request.",
  },
];

const statusStyle: Record<NewsletterBroadcast["status"], string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  QUEUED: "bg-amber-100 text-amber-800",
  SENT: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function NewsletterHistory({
  rows,
}: {
  rows: NewsletterBroadcast[];
}) {
  const { isPlayback } = useAdminTutorial();
  const displayedRows = isPlayback ? demoBroadcasts : rows;

  return (
    <section
      data-tutorial="newsletter-history"
      className="w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="px-5 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Newsletter History</h1>
        <p className="mt-1 text-sm text-gray-600">
          Saved drafts and delivery outcomes for newsletter broadcasts.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Sent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Recipients / sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No newsletter broadcasts found.
                </td>
              </tr>
            ) : (
              displayedRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td
                    data-tutorial={index === 0 ? "newsletter-history-subject" : undefined}
                    className="px-6 py-4 text-sm font-medium text-gray-900"
                  >
                    {row.subject}
                  </td>
                  <td
                    data-tutorial={index === 0 ? "newsletter-history-status" : undefined}
                    className="px-6 py-4"
                  >
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[row.status]}`}>
                      {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
                    </span>
                    {row.last_error ? (
                      <p className="mt-1 max-w-xs text-xs text-red-700">{row.last_error}</p>
                    ) : null}
                  </td>
                  <td
                    data-tutorial={index === 0 ? "newsletter-history-created" : undefined}
                    className="px-6 py-4 text-sm text-gray-600"
                  >
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td
                    data-tutorial={index === 0 ? "newsletter-history-sent" : undefined}
                    className="px-6 py-4 text-sm text-gray-600"
                  >
                    {row.sent_at ? new Date(row.sent_at).toLocaleString() : "—"}
                  </td>
                  <td
                    data-tutorial={index === 0 ? "newsletter-history-counts" : undefined}
                    className="px-6 py-4 text-sm text-gray-700"
                  >
                    {row.recipient_count.toLocaleString()} / {row.sent_count.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

