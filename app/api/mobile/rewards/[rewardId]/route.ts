import { NextResponse } from "next/server";
import { initialMarks, reachRewards } from "@/lib/handprint-data";

export function GET(_request: Request, { params }: { params: { rewardId: string } }) {
  const reward = reachRewards.find((item) => item.id === params.rewardId);
  if (!reward) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  const verifiedPoints = initialMarks.reduce((total, mark) => total + mark.points, 0);

  return NextResponse.json({
    reward: {
      id: reward.id,
      title: reward.title,
      tier: reward.milestone,
      category: reward.category,
      description: reward.description,
      requirement: reward.control,
      status: reward.availability
    },
    eligibility: {
      verifiedPoints,
      eligibleByPoints: verifiedPoints >= reward.pointsRequired,
      pointsRemaining: Math.max(0, reward.pointsRequired - verifiedPoints),
      reviewRequired: true,
      explanation: "High-value rewards require verified impact plus review, not points alone."
    },
    generatedAt: new Date().toISOString()
  });
}
