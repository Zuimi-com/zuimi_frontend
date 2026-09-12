import { NextRequest, NextResponse } from "next/server";
import { operatorFetch } from "@/lib/server/operator-session";

type Context = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: Context) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ detail: "Invalid origin." }, { status: 403 });
  const { path } = await context.params;
  const normalized = path.join("/");
  const reportPath = /^community\/report-review(?:\/[0-9a-f-]{36}\/decide)?$/.test(normalized);
  const ctoPath = normalized === "operators/forensics-ticket";
  if (!reportPath && !ctoPath) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  if (ctoPath && request.method !== "POST" || reportPath && !["GET", "POST"].includes(request.method)) {
    return NextResponse.json({ detail: "Method not allowed." }, { status: 405 });
  }
  const response = await operatorFetch(`/${normalized}/${request.nextUrl.search}`, {
    method: request.method, headers: { "Content-Type": "application/json" },
    body: request.method === "GET" ? undefined : await request.text(),
  });
  return new NextResponse(response.body, {
    status: response.status, headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
