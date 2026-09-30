"use client";

import { FileText, Send, Users, Clock3 } from "lucide-react";
import Link from "next/link";
import { useGetNewsletterSummary } from "@/features/dashboard/service/newsletter";
import { useAdminTutorial } from "@/components/admin/tutorials/AdminTutorialProvider";

export default function DashboardStats() {
  const { isPlayback } = useAdminTutorial();
  const summary = useGetNewsletterSummary(!isPlayback);

  const stats = [
    {
      title: "Subscribers",
      value: isPlayback ? 2500 : summary.data?.subscriber_count ?? "—",
      subtitle: "Current newsletter recipients",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Draft newsletters",
      value: isPlayback ? 3 : summary.data?.draft_count ?? "—",
      subtitle: "Saved but not sent",
      icon: FileText,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
    },
    {
      title: "Queued newsletters",
      value: isPlayback ? 1 : summary.data?.queued_count ?? "—",
      subtitle: "Waiting for delivery",
      icon: Clock3,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
    {
      title: "Newsletters sent",
      value: isPlayback ? 24 : summary.data?.sent_count ?? "—",
      subtitle: summary.data?.latest_sent_at
        ? `Latest: ${new Date(summary.data.latest_sent_at).toLocaleDateString()}`
        : "No completed sends yet",
      icon: Send,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {summary.isError ? (
            <p className="mt-1 text-sm text-red-700">
              Newsletter activity could not be loaded.
            </p>
          ) : null}
        </div>

        <Link
          href="/admin/compose-letter"
          data-tutorial="admin-compose-shortcut"
          onClick={(event) => isPlayback && event.preventDefault()}
          className="rounded-lg bg-zuimi-blue px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Compose Letter
        </Link>
      </div>

      <div
        data-tutorial="admin-dashboard-stats"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex flex-col gap-4 rounded-xl border bg-background p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zuimi-accent">{item.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full ${item.iconBg}`}>
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {summary.isPending && !isPlayback ? "…" : item.value}
                </h2>
                <p className="mt-1 text-xs text-zuimi-subtitle">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

