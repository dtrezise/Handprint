import { NextResponse } from "next/server";
import { earnedBadges, initialMarks, localActions } from "@/lib/handprint-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  const badges = earnedBadges(initialMarks).map((badge) => {
    const mark = initialMarks.find((item) => item.badgeId === badge.id);
    const action = mark ? localActions.find((item) => item.id === mark.eventId) : undefined;
    return {
      ...badge,
      mark,
      action: action
        ? {
            id: action.id,
            title: action.title,
            organizer: action.organizer,
            impact: action.impact,
            rewardEligible: action.rewardEligible
          }
        : undefined
    };
  });

  return NextResponse.json({
    badges,
    generatedAt: new Date().toISOString()
  });
}
