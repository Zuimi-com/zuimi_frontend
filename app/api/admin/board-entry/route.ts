import { publicRequestOrigin } from "@/lib/server/request-origin";
import { hasAdminPermission } from "@/features/dashboard/permissions";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithAdminSession } from "@/lib/server/admin-session";
export async function GET(request: NextRequest) {
  const response = await fetchWithAdminSession("/login/admin/session/");
  const data = await response.json();
  let destination = "/admin-login";
  if (response.ok && data.user?.is_dashboard_admin === true) {
    destination = hasAdminPermission(data.user, "coordination") ? "/eco/boarddash/55019/" : "/admin";
  }
  return NextResponse.redirect(new URL(destination, publicRequestOrigin(request)));
}
