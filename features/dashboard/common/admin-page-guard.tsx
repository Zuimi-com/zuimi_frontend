"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAdminAuth } from "../context/admin-auth-context";
import { canVisitAdminPage } from "../permissions";

export default function AdminPageGuard({ children }: { children: ReactNode }) {
  const { admin } = useAdminAuth();
  const path = usePathname();
  if (canVisitAdminPage(admin, path)) return children;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Access restricted</h1>
      <p>Your account does not have access to this part of the dashboard.</p>
      <Link className="text-blue-700 underline" href="/admin">Return to the dashboard</Link>
    </section>
  );
}
