import { NextResponse } from "next/server";
import { actionById, createMark } from "@/lib/handprint-data";

type CheckInRequest = {
  actionId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CheckInRequest;
  const action = body.actionId ? actionById(body.actionId) : undefined;

  if (!action) {
    return NextResponse.json({ error: "Unknown action" }, { status: 404 });
  }

  if (action.status !== "approved") {
    return NextResponse.json({ error: "Action is not joinable" }, { status: 409 });
  }

  return NextResponse.json({
    actionId: action.id,
    status: "checked_in",
    mark: createMark(action, "checked_in")
  });
}
