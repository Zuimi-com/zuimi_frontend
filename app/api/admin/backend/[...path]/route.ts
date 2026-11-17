import { isSameOriginRequest } from "@/lib/server/request-origin";
import { NextRequest, NextResponse } from "next/server";

import { clearAdminSession, fetchWithAdminSession } from "@/lib/server/admin-session";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    if (!isSameOriginRequest(request.headers, true)) {
      return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });
    }
  }

  const { path } = await context.params;
  const upstreamPath = `/${path.map(encodeURIComponent).join("/")}/${request.nextUrl.search}`;
  const headers: Record<string, string> = {};
  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const response = await fetchWithAdminSession(upstreamPath, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method)
      ? undefined
      : await request.arrayBuffer(),
  });

  if (response.status === 401) {
    await clearAdminSession();
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
