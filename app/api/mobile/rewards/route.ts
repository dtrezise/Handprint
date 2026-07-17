import { NextResponse } from "next/server";
import { initialMarks, reachRewards } from "@/lib/handprint-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  const verifiedPoints = initialMarks.reduce((total, mark) => total + mark.points, 0);
  const rewards = reachRewards.map((reward) => ({
    id: reward.id,
    title: reward.title,
    tier: reward.milestone,
    category: reward.category,
    description: reward.description,
    requirement: reward.control,
    status: reward.availability,
    eligibleByPoints: verifiedPoints >= reward.pointsRequired,
    pointsRemaining: Math.max(0, reward.pointsRequired - verifiedPoints),
    reviewRequired: true
  }));

  return NextResponse.json({
    verifiedPoints,
    rewards,
    generatedAt: new Date().toISOString()
  });
}
