import { NextResponse } from "next/server";
import { readProfileSettingsLedger, writeProfileSettingsLedger } from "@/lib/server/profile-settings";
import { attachSessionCookie, readSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const session = readSession(request);
  const ledger = readProfileSettingsLedger(session);
  return attachSessionCookie(
    NextResponse.json({
      profile: ledger.profile,
      settings: ledger.settings,
      qr: {
        enabled: ledger.settings.qrEnabled,
        rotatedAt: ledger.settings.qrRotatedAt,
        fallbackUrl: "/h/hp-dan"
      },
      updatedAt: ledger.updatedAt
    }),
    session
  );
}

export async function POST(request: Request) {
  const session = readSession(request);
  try {
    const body = (await request.json()) as Parameters<typeof writeProfileSettingsLedger>[1];
    const ledger = writeProfileSettingsLedger(session, body);
    return attachSessionCookie(
      NextResponse.json({
        profile: ledger.profile,
        settings: ledger.settings,
        qr: {
          enabled: ledger.settings.qrEnabled,
          rotatedAt: ledger.settings.qrRotatedAt,
          fallbackUrl: "/h/hp-dan"
        },
        updatedAt: ledger.updatedAt
      }),
      session
    );
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "Mobile profile update failed" }, { status: 400 }),
      session
    );
  }
}
