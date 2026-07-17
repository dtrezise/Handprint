import { NextResponse } from "next/server";

type OrganizerSubmissionRequest = {
  actionId?: string;
  title?: string;
  organizer?: string;
  organizerWebsite?: string;
  communityAffiliation?: string;
  contactEmail?: string;
  neighborhood?: string;
  locationName?: string;
  startsAt?: string;
  duration?: string;
  capacity?: number;
  category?: string;
  listingType?: string;
  summary?: string;
  skills?: string[];
  safetyNote?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as OrganizerSubmissionRequest;

  if (!body.title || !body.organizer || !body.contactEmail || !body.communityAffiliation || !body.summary) {
    return NextResponse.json({ error: "Missing required organizer submission fields" }, { status: 400 });
  }

  const sensitiveText = `${body.title} ${body.summary} ${body.safetyNote ?? ""}`.toLowerCase();
  const needsEscalation = ["youth", "school", "fundraiser", "medical", "campaign"].some((term) => sensitiveText.includes(term));

  return NextResponse.json({
    actionId: body.actionId ?? `draft-${Date.now()}`,
    status: needsEscalation ? "escalated" : "pending",
    trustTier: needsEscalation ? "Escalated" : "Pending review",
    reviewNote: needsEscalation
      ? "Sensitive terms detected. Review before listing."
      : `New organizer submission from ${body.contactEmail}. Affiliation: ${body.communityAffiliation}.`,
    received: true
  });
}
