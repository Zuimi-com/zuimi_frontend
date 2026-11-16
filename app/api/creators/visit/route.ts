import { NextRequest, NextResponse } from "next/server";
import { recordVisit, sameOrigin } from "@/lib/server/creator-funnel";
export async function POST(request: NextRequest) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { detail: "Invalid request origin." },
      { status: 403 },
    );
  try {
    await recordVisit(request);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { detail: "Visit tracking is temporarily unavailable." },
      { status: 503 },
    );
  }
}
