"use client";

import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";
import { NewsletterSubscriber } from "@/features/dashboard/service/newsletter";

const demoSubscribers: NewsletterSubscriber[] = [
  {
    id: "demo-subscriber-1",
    email: "amina@example.com",
    first_name: "Amina",
    last_name: "Okafor",
    subscribed_at: "2026-09-10T09:30:00Z",
  },
  {
    id: "demo-subscriber-2",
    email: "tunde@example.com",
    first_name: "Tunde",
    last_name: "Adeleke",
    subscribed_at: "2026-09-08T15:45:00Z",
  },
];

export default function SubscribersTable({
  rows,
}: {
  rows: NewsletterSubscriber[];
}) {
  const { isPlayback } = useAdminTutorial();
  const displayedRows = isPlayback ? demoSubscribers : rows;

  return (
    <section
      data-tutorial="subscriber-overview"
      className="w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <div className="flex items-end justify-between gap-4 px-5 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Subscribers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Newsletter recipients and the date they joined.
          </p>
        </div>
        <p data-tutorial="subscriber-total" className="text-sm font-semibold text-gray-700">
          {displayedRows.length.toLocaleString()} total
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Subscribed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedRows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              displayedRows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td
                    data-tutorial={index === 0 ? "subscriber-email" : undefined}
                    className="px-6 py-4 text-sm font-medium text-gray-900"
                  >
                    {row.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {[row.first_name, row.last_name].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td
                    data-tutorial={index === 0 ? "subscriber-date" : undefined}
                    className="px-6 py-4 text-sm text-gray-600"
                  >
                    {new Date(row.subscribed_at).toLocaleString()}
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

