import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import { hasAdminPermission } from "@/features/dashboard/permissions";
import Board from "@/features/coordination/Board";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Zuimi · Delivery & Growth",
  robots: { index: false, follow: false },
};
export default async function BoardPage() {
  const jar = await cookies();
  const access = jar.get("zuimi_admin_access")?.value;
  if (!access)
    redirect(
      jar.has("zuimi_admin_refresh")
        ? "/api/admin/board-entry"
        : "/admin-login",
    );
  const response = await fetch(`${getApiBaseUrl()}/login/admin/session/`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  if (response.status === 401)
    redirect(
      jar.has("zuimi_admin_refresh")
        ? "/api/admin/board-entry"
        : "/admin-login",
    );
  if (!response.ok)
    throw new Error("Unable to verify the admin session. Please retry.");
  const data = await response.json();
  if (data.user?.is_dashboard_admin !== true) redirect("/admin-login");
  if (!hasAdminPermission(data.user, "coordination")) redirect("/admin");
  return <Board
    canManage={hasAdminPermission(data.user, "coordination", "manage")}
    canViewCreators={hasAdminPermission(data.user, "creators")}
    canManageCreators={hasAdminPermission(data.user, "creators", "manage")}
    canViewAudit={hasAdminPermission(data.user, "audit")}
  />;
}
