import { NextResponse } from "next/server";
import { clearOperatorSession, getOperatorRefreshToken, operatorFetch } from "@/lib/server/operator-session";

export async function GET() {
  const response = await operatorFetch("/operators/session/");
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE() {
  const refresh = await getOperatorRefreshToken();
  try {
    if (refresh) {
      await operatorFetch("/login/logout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });
    }
  } finally {
    await clearOperatorSession();
  }
  return new NextResponse(null, { status: 204 });
}
