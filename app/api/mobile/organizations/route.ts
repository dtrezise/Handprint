import { NextResponse } from "next/server";
import { readOrganizerLedger } from "@/lib/server/organizer-ledger";
import { attachSessionCookie, readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = readSession(request);
  const ledger = await readOrganizerLedger(session);
  return attachSessionCookie(NextResponse.json({
    profiles: ledger.profiles,
    generatedAt: new Date().toISOString()
  }), session);
}
