import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/get-api-base-url";
import { setAdminSession } from "@/lib/server/admin-session";

export async function POST(request: Request) {
  const credentials = await request.json();
  const loginResponse = await fetch(`${getApiBaseUrl()}/login/admin/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });
  const loginData = await loginResponse.json();

  if (!loginResponse.ok || !loginData.access || !loginData.refresh) {
    return NextResponse.json(loginData, { status: loginResponse.status });
  }

  const verification = await fetch(`${getApiBaseUrl()}/login/admin/session/`, {
    headers: { Authorization: `Bearer ${loginData.access}` },
    cache: "no-store",
  });
  const verificationData = await verification.json();
  if (!verification.ok || !verificationData.user?.is_staff) {
    return NextResponse.json(
      { detail: "Admin privileges could not be verified." },
      { status: 403 },
    );
  }

  await setAdminSession(loginData.access, loginData.refresh);
  return NextResponse.json({ user: verificationData.user });
}
