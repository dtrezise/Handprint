import { NextResponse } from "next/server";
import { readImpactReceiptLedger } from "@/lib/server/impact-receipt-ledger";

export async function GET(_request: Request, { params }: { params: { receiptId: string } }) {
  const ledger = await readImpactReceiptLedger();
  const receipt = ledger.receipts.find((item) => item.id === params.receiptId);

  if (!receipt) {
    return NextResponse.json({ error: "Impact receipt not found" }, { status: 404 });
  }

  return NextResponse.json({
    receipt,
    generatedAt: new Date().toISOString()
  });
}
