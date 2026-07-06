import { NextResponse } from "next/server";
import { actionById } from "@/lib/handprint-data";

type ReportRequest = {
  actionId?: string;
  reason?: string;
  note?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ReportRequest;
  const action = body.actionId ? actionById(body.actionId) : undefined;

  if (!action) {
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  }

  return NextResponse.json({
    id: `report-${action.id}-${Date.now()}`,
    actionId: action.id,
    reason: body.reason ?? "Other",
    note: body.note ?? "",
    status: "open",
    nextReviewState: "escalated"
  });
}
