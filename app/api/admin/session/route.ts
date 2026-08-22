import { NextResponse } from "next/server";

import {
  clearAdminSession,
  fetchWithAdminSession,
  getRefreshToken,
} from "@/lib/server/admin-session";

export async function GET() {
  const response = await fetchWithAdminSession("/login/admin/session/");
  const data = await response.json();
  if (!response.ok) {
    await clearAdminSession();
  }
  return NextResponse.json(data, { status: response.status });
}

export async function DELETE() {
  const refresh = await getRefreshToken();
  if (refresh) {
    await fetchWithAdminSession("/login/logout/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
  }
  await clearAdminSession();
  return new NextResponse(null, { status: 204 });
}
