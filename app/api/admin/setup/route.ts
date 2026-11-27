import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/get-api-base-url";

export async function POST(request: Request) {
  const response = await fetch(`${getApiBaseUrl()}/dashboard-admins/accept/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
    cache: "no-store",
  });
  return NextResponse.json(await response.json(), { status: response.status });
}
