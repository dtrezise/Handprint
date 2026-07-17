import { NextResponse } from "next/server";
import { applyWorldChangerFollowPatch, readWorldChangerFollows, type WorldChangerFollowPatch } from "@/lib/server/world-changer-ledger";
import { attachSessionCookie, readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = readSession(request);
  return attachSessionCookie(NextResponse.json(readWorldChangerFollows(session)), session);
}

export async function POST(request: Request) {
  const session = readSession(request);
  try {
    const body = (await request.json()) as WorldChangerFollowPatch;
    return attachSessionCookie(NextResponse.json(applyWorldChangerFollowPatch(session, body)), session);
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "World Changer follow update failed" }, { status: 400 }),
      session
    );
  }
}
