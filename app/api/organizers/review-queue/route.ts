import { NextResponse } from "next/server";
import { readOrganizationReviewQueue } from "@/lib/server/organizer-ledger";
import { attachSessionCookie, readSession, requireAnyRole } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = readSession(request);
  try {
    requireAnyRole(session, ["handprint_reviewer"], "organization duplicate review queue");
    return attachSessionCookie(NextResponse.json({ items: await readOrganizationReviewQueue() }), session);
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "Review queue unavailable" }, { status: 403 }),
      session
    );
  }
}
