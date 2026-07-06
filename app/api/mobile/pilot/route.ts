import { NextResponse } from "next/server";
import { defaultProfile, initialMarks, localActions } from "@/lib/handprint-data";

export function GET() {
  return NextResponse.json({
    profile: {
      ...defaultProfile,
      handle: "dan",
      interests: defaultProfile.interests,
      skills: defaultProfile.skills,
      availability: defaultProfile.availability
    },
    actions: localActions.map(({ accent: _accent, ...action }) => action),
    marks: initialMarks,
    rsvps: {
      "tenant-rights-clinic": "checkedIn"
    },
    selectedActionId: localActions[0]?.id ?? "",
    isOnboarded: false,
    authState: "appleReady",
    locationPermission: "notRequested"
  });
}
