import { NextResponse } from "next/server";
import { badgeById, initialMarks, localActions } from "@/lib/handprint-data";

export function GET(_request: Request, { params }: { params: { badgeId: string } }) {
  const badge = badgeById(params.badgeId);
  if (!badge) {
    return NextResponse.json({ error: "Badge not found" }, { status: 404 });
  }

  const mark = initialMarks.find((item) => item.badgeId === badge.id);
  const action = mark ? localActions.find((item) => item.id === mark.eventId) : undefined;

  return NextResponse.json({
    badge,
    mark,
    action,
    verification: {
      issuedBy: badge.issuedBy,
      evidence: action?.reviewNote ?? badge.verification,
      praise: "This badge affirms useful action that already changed something real."
    },
    generatedAt: new Date().toISOString()
  });
}
