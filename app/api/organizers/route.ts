import { NextResponse } from "next/server";
import {
  applyOrganizerLedgerPatch,
  readOrganizerLedger,
  recordOrganizationSubmissionReview,
  writeOrganizerLedger,
  type OrganizerLedgerPatch
} from "@/lib/server/organizer-ledger";
import { attachSessionCookie, readSession } from "@/lib/server/session";

export async function GET(request: Request) {
  const session = readSession(request);
  return attachSessionCookie(NextResponse.json(await readOrganizerLedger(session)), session);
}

export async function POST(request: Request) {
  const session = readSession(request);
  try {
    const body = (await request.json()) as OrganizerLedgerPatch;
    const current = await readOrganizerLedger(session);
    if (body.profile) await recordOrganizationSubmissionReview(body.profile, current.profiles);
    const profiles = applyOrganizerLedgerPatch(current.profiles, body, new Date(), session.roles);
    return attachSessionCookie(NextResponse.json(await writeOrganizerLedger(profiles, session)), session);
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "Organizer ledger update failed" }, { status: 403 }),
      session
    );
  }
}
