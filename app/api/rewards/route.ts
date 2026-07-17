import { NextResponse } from "next/server";
import { readRewardLedger, writeRewardLedger, type RewardLedger } from "@/lib/server/reward-ledger";

export async function GET() {
  return NextResponse.json(await readRewardLedger());
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<RewardLedger>;
  const current = await readRewardLedger(body.profileHandle ?? "dan");
  const nextLedger: RewardLedger = {
    profileHandle: body.profileHandle ?? current.profileHandle,
    lastUpdatedAt: new Date().toISOString(),
    rsvps: body.rsvps ?? current.rsvps,
    marks: body.marks ?? current.marks
  };

  return NextResponse.json(await writeRewardLedger(nextLedger));
}
