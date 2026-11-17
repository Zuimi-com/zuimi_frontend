import { publicRequestOrigin } from "@/lib/server/request-origin";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithAdminSession } from "@/lib/server/admin-session";
export async function GET(request: NextRequest) {
  const response = await fetchWithAdminSession("/login/admin/session/");
  const data = await response.json();
  return NextResponse.redirect(
    new URL(
      response.ok && data.user?.is_staff === true
        ? "/eco/boarddash/55019/"
        : "/admin-login",
      publicRequestOrigin(request),
    ),
  );
}
