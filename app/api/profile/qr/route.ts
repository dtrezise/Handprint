import { NextResponse } from "next/server";
import { rotateProfileQr, writeProfileSettingsLedger } from "@/lib/server/profile-settings";
import { attachSessionCookie, readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: Request) {
  const session = readSession(request);
  try {
    const body = (await request.json().catch(() => ({}))) as { action?: "rotate" | "enable" | "disable" };
    const action = body.action ?? "rotate";
    const ledger =
      action === "rotate"
        ? rotateProfileQr(session)
        : writeProfileSettingsLedger(session, {
            settings: { qrEnabled: action === "enable" }
          });
    return attachSessionCookie(NextResponse.json(ledger), session);
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "QR settings update failed" }, { status: 400 }),
      session
    );
  }
}
