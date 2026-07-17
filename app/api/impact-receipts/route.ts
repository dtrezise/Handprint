import { NextResponse } from "next/server";
import {
  applyImpactReceiptPatch,
  readImpactReceiptLedger,
  writeImpactReceiptLedger,
  type ImpactReceiptPatch
} from "@/lib/server/impact-receipt-ledger";
import { attachSessionCookie, readSession, requireAnyRole } from "@/lib/server/session";

export async function GET() {
  return NextResponse.json(await readImpactReceiptLedger());
}

export async function POST(request: Request) {
  const session = readSession(request);
  try {
    requireAnyRole(session, ["organizer_editor", "handprint_reviewer"], "impact receipt writing");
    const body = (await request.json()) as ImpactReceiptPatch;
    const current = await readImpactReceiptLedger();
    const receipts = applyImpactReceiptPatch(current.receipts, body);
    return attachSessionCookie(NextResponse.json(await writeImpactReceiptLedger(receipts)), session);
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "Impact receipt update failed" }, { status: 403 }),
      session
    );
  }
}
