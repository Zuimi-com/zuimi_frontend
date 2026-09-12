import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import { setOperatorSession } from "@/lib/server/operator-session";

export async function POST(request: Request) {
  const credentials = await request.json();
  const response = await fetch(`${getApiBaseUrl()}/login/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials), cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || data.requires_2fa) return NextResponse.json(data, { status: response.status });
  if (!data.access || !data.refresh) return NextResponse.json({ detail: "Login failed." }, { status: 401 });
  const verification = await fetch(`${getApiBaseUrl()}/operators/session/`, {
    headers: { Authorization: `Bearer ${data.access}` }, cache: "no-store",
  });
  if (!verification.ok) return NextResponse.json({ detail: "Operator access required." }, { status: 403 });
  const { user } = await verification.json();
  await setOperatorSession(data.access, data.refresh);
  return NextResponse.json({ user });
}
