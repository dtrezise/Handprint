import { NextResponse } from "next/server";
import { actionById, organizerConfirmations } from "@/lib/handprint-data";
import { createImpactReceiptFromConfirmation, readImpactReceiptLedger, writeImpactReceiptLedger } from "@/lib/server/impact-receipt-ledger";
import { applyOrganizerLedgerPatch, findOrganizerByPublicId, readOrganizerLedger, writeOrganizerLedger } from "@/lib/server/organizer-ledger";
import { attachSessionCookie, readSession, requireAnyRole } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const session = readSession(request);
  try {
    requireAnyRole(session, ["organizer_editor", "handprint_reviewer"], "post-event confirmation");
    const body = (await request.json()) as { confirmationId?: string };
    const confirmation = organizerConfirmations.find((item) => item.id === body.confirmationId);
    if (!confirmation) return attachSessionCookie(NextResponse.json({ error: "Confirmation not found" }, { status: 404 }), session);

    const action = actionById(confirmation.actionId);
    if (!action) return attachSessionCookie(NextResponse.json({ error: "Action not found" }, { status: 404 }), session);

    const organizerLedger = await readOrganizerLedger(session);
    const organizer = findOrganizerByPublicId(organizerLedger.profiles, action.organizer);
    if (!organizer) return attachSessionCookie(NextResponse.json({ error: "Organizer not found" }, { status: 404 }), session);

    const receipt = createImpactReceiptFromConfirmation(confirmation, action, organizer);
    const receiptLedger = await readImpactReceiptLedger();
    const nextReceipts = [receipt, ...receiptLedger.receipts.filter((item) => item.id !== receipt.id)];
    const writtenReceiptLedger = await writeImpactReceiptLedger(nextReceipts);

    const nextProfiles = applyOrganizerLedgerPatch(
      organizerLedger.profiles,
      {
        impactReceiptUpdate: {
          organizerId: organizer.id,
          receiptId: receipt.id
        }
      },
      new Date(),
      session.roles
    );
    const writtenOrganizerLedger = await writeOrganizerLedger(nextProfiles, session);

    return attachSessionCookie(
      NextResponse.json({
        receipt,
        receiptLedger: writtenReceiptLedger,
        organizerLedger: writtenOrganizerLedger
      }),
      session
    );
  } catch (error) {
    return attachSessionCookie(
      NextResponse.json({ error: error instanceof Error ? error.message : "Confirmation failed" }, { status: 403 }),
      session
    );
  }
}
