import { NextResponse } from "next/server";
import { findOrganizerByPublicId, readOrganizerLedger } from "@/lib/server/organizer-ledger";

export async function GET(_request: Request, { params }: { params: { organizerId: string } }) {
  const ledger = await readOrganizerLedger();
  const profile = findOrganizerByPublicId(ledger.profiles, params.organizerId);

  if (!profile) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile,
    generatedAt: new Date().toISOString()
  });
}
