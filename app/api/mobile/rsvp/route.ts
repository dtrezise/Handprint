import { NextResponse } from "next/server";
import { actionById, createMark } from "@/lib/handprint-data";
import type { RsvpStatus } from "@/lib/handprint-data";

type RsvpRequest = {
  actionId?: string;
  status?: "saved" | "going" | "checked_in" | "checkedIn" | "confirmed";
};

export async function POST(request: Request) {
  const body = (await request.json()) as RsvpRequest;
  const action = body.actionId ? actionById(body.actionId) : undefined;

  if (!action) {
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  }

  const normalizedStatus: RsvpStatus = body.status === "checkedIn" ? "checked_in" : (body.status ?? "going");
  const mark = createMark(action, normalizedStatus);

  return NextResponse.json({
    actionId: action.id,
    status: normalizedStatus,
    mark,
    reviewRequired: action.status !== "approved"
  });
}
