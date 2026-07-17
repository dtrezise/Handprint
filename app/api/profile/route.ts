import { NextResponse } from "next/server";
import { readProfileSettingsLedger, writeProfileSettingsLedger } from "@/lib/server/profile-settings";
import { attachSessionCookie, readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = readSession(request);
  return attachSessionCookie(NextResponse.json(readProfileSettingsLedger(session)), session);
}

export async function POST(request: Request) {
  const session = readSession(request);
  try {
    const body = (await request.json()) as Parameters<typeof writeProfileSettingsLedger>[1];
    return attachSessionCookie(NextResponse.json(writeProfileSettingsLedger(session, body)), session);
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "Profile settings update failed" }, { status: 400 }),
      session
    );
  }
}
