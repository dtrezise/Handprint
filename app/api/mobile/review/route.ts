import { NextResponse } from "next/server";
import type { EventStatus } from "@/lib/handprint-data";
import { actionById } from "@/lib/handprint-data";

type ReviewDecisionRequest = {
  actionId?: string;
  decision?: EventStatus;
};

const allowedDecisions: EventStatus[] = ["approved", "pending", "escalated", "rejected"];

export async function POST(request: Request) {
  const body = (await request.json()) as ReviewDecisionRequest;
  const action = body.actionId ? actionById(body.actionId) : undefined;
  const decision = body.decision;

  if (!body.actionId) {
    return NextResponse.json({ error: "Missing actionId" }, { status: 400 });
  }

  if (!decision || !allowedDecisions.includes(decision)) {
    return NextResponse.json({ error: "Unsupported review decision" }, { status: 400 });
  }

  return NextResponse.json({
    actionId: body.actionId,
    title: action?.title ?? "Organizer submission",
    status: decision,
    trustTier: decision === "approved" ? "Verified" : decision === "pending" ? "Pending review" : "Escalated",
    reviewNote:
      decision === "approved"
        ? "Approved for pilot listing."
        : decision === "rejected"
          ? "Rejected from pilot listing. Organizer can revise and resubmit."
          : "Requires additional review before public listing.",
    recorded: true
  });
}
