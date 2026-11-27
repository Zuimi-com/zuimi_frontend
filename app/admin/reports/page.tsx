"use client";

import ReportQueue from "@/components/operator/ReportQueue";
import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";
import { hasAdminPermission } from "@/features/dashboard/permissions";

export default function AdminReportsPage() {
  const { admin } = useAdminAuth();
  return <ReportQueue basePath="/api/admin/backend" canDecide={hasAdminPermission(admin, "reports", "manage")} />;
}
