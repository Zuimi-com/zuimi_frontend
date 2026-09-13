import { NextResponse } from "next/server";
import { clearOperatorSession, operatorFetch } from "@/lib/server/operator-session";

export async function GET() {
  const response = await operatorFetch("/operators/session/");
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE() {
  await clearOperatorSession();
  return new NextResponse(null, { status: 204 });
}
