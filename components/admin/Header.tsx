"use client";

import { useAdminAuth } from "@/features/dashboard/context/admin-auth-context";
import AdminPageHelp from "./tutorials/AdminPageHelp";

export default function Header() {
  const { admin, loading } = useAdminAuth();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const displayName = admin?.email ?? "";

  return (
    <header className="zuimi-gradient flex items-center justify-between px-6 py-4">
      <div className="bg-[linear-gradient(to_right,#1683EE,#F12F7A,#F68812)] bg-clip-text text-3xl font-extrabold text-transparent">
        zuimi
      </div>

      <div className="flex items-center gap-3 text-white">
        <AdminPageHelp />
        <div
          data-tutorial="admin-header-identity"
          className="flex items-center gap-2"
          title={displayName}
        >
          {loading ? (
            <>
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/50" />
              <div className="h-4 w-16 animate-pulse rounded bg-white/50" />
            </>
          ) : admin ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80">
              <span className="text-xs font-semibold text-blue-600">
                {getInitials(displayName)}
              </span>
            </div>
          ) : (
            <>
              <div className="h-8 w-8 rounded-full bg-white/80" />
              <span className="text-sm">Guest</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

