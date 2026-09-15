import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/get-api-base-url";
import { setOperatorSession } from "@/lib/server/operator-session";

export async function POST(request: Request) {
  const response = await fetch(`${getApiBaseUrl()}/login/verify-2fa/`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()), cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data.access || !data.refresh) return NextResponse.json(data, { status: response.status });
  const verification = await fetch(`${getApiBaseUrl()}/operators/session/`, {
    headers: { Authorization: `Bearer ${data.access}` }, cache: "no-store",
  });
  if (!verification.ok) return NextResponse.json({ detail: "Operator access required." }, { status: 403 });
  const { user } = await verification.json();
  await setOperatorSession(data.access, data.refresh);
  return NextResponse.json({ user });
}
