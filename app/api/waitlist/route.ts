import { NextRequest, NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/get-api-base-url";

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/newsletter/subscribe/`,
      {
        method: "POST",
        headers: {
          "Content-Type": request.headers.get("content-type") ?? "application/json",
        },
        body: await request.text(),
        cache: "no-store",
      },
    );

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Waitlist service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
