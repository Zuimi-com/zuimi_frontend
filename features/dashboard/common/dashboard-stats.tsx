"use client";

import React from "react";
import { Users, UserCheck, Send, TrendingUp } from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "Total Subscribers",
    value: "2,530",
    subtitle: "All sign ups",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Active Subscribers",
    value: "2,500",
    subtitle: "Currently subscribed",
    icon: UserCheck,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Newsletter sent",
    value: "30",
    subtitle: "This year",
    icon: Send,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Open rate",
    value: "80%",
    subtitle: "based on last sent",
    icon: TrendingUp,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
];

const DashboardStats = () => {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <Link
          href={"/admin/compose-letter"}
          className="bg-zuimi-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          Compose Letter
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-xl border bg-background p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zuimi-accent">{item.title}</span>

                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${item.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {item.value}
                </h2>
                <p className="text-xs text-zuimi-subtitle mt-1">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DashboardStats;
