import { NextResponse } from "next/server";
import { readImpactReceiptLedger } from "@/lib/server/impact-receipt-ledger";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const ledger = await readImpactReceiptLedger();
  return NextResponse.json({
    receipts: ledger.receipts,
    generatedAt: new Date().toISOString()
  });
}
