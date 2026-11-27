"use client";

import { useAdminAuth } from "../context/admin-auth-context";
import { hasAdminPermission } from "../permissions";
import DashboardStats from "./dashboard-stats";

export default function AdminHome() {
  const { admin } = useAdminAuth();
  if (hasAdminPermission(admin, "overview")) return <DashboardStats />;

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <p className="text-slate-600">Choose one of your assigned sections from the navigation.</p>
    </section>
  );
}
