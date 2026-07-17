import { NextResponse } from "next/server";
import { attachSessionCookie, createSession, readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = readSession(request);
  return attachSessionCookie(NextResponse.json({ session }), session);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: "viewer" | "organizer_editor" | "handprint_reviewer" | "pilot_admin";
  };
  const session = createSession(body.mode ?? "pilot_admin");
  return attachSessionCookie(NextResponse.json({ session }), session);
}
