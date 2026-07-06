import { NextResponse } from "next/server";
import { completedHighlights, nextJoinableActions, publicHandprintProfile } from "@/lib/handprint-data";

export function GET(_request: Request, { params }: { params: { handle: string } }) {
  const handle = params.handle.toLowerCase();

  if (handle !== publicHandprintProfile.handle) {
    return NextResponse.json({ error: "Profile is not public" }, { status: 404 });
  }

  return NextResponse.json({
    profile: publicHandprintProfile,
    completed: completedHighlights(),
    nextActions: nextJoinableActions()
  });
}
