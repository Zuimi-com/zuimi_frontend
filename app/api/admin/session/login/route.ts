import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/get-api-base-url";
import { setAdminSession } from "@/lib/server/admin-session";

export async function POST(request: Request) {
  const credentials = await request.json();
  const isChallenge = typeof credentials.challenge_token === "string";
  const loginPath = isChallenge ? "/login/verify-2fa/" : "/login/admin/";
  const loginResponse = await fetch(`${getApiBaseUrl()}${loginPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });
  const loginData = await loginResponse.json();

  if (!loginResponse.ok) {
    return NextResponse.json({ detail: loginData.detail || "Login failed." }, { status: loginResponse.status });
  }
  if (loginData.requires_2fa && !isChallenge) {
    return NextResponse.json({ requires_2fa: true, challenge_token: loginData.challenge_token });
  }
  if (!loginData.access || !loginData.refresh) {
    return NextResponse.json({ detail: "Login failed." }, { status: 401 });
  }

  const verification = await fetch(`${getApiBaseUrl()}/login/admin/session/`, {
    headers: { Authorization: `Bearer ${loginData.access}` },
    cache: "no-store",
  });
  const verificationData = await verification.json();
  if (!verification.ok || !verificationData.user?.is_dashboard_admin) {
    return NextResponse.json(
      { detail: "Admin privileges could not be verified." },
      { status: 403 },
    );
  }

  await setAdminSession(loginData.access, loginData.refresh);
  return NextResponse.json({ user: verificationData.user });
}
