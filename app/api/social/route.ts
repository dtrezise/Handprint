import { NextResponse } from "next/server";
import { applySocialLedgerPatch, readSocialLedger, type SocialLedgerPatch } from "@/lib/server/social-ledger";
import { attachSessionCookie, readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = readSession(request);
  return attachSessionCookie(NextResponse.json(readSocialLedger(session)), session);
}

export async function POST(request: Request) {
  const session = readSession(request);
  try {
    const body = (await request.json()) as SocialLedgerPatch;
    return attachSessionCookie(NextResponse.json(applySocialLedgerPatch(session, body)), session);
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "Social ledger update failed" }, { status: 400 }),
      session
    );
  }
}
