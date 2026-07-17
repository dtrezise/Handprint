import { NextResponse } from "next/server";
import { readModerationReviewQueue } from "@/lib/server/social-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(readModerationReviewQueue());
}
