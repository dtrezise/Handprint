import { NextResponse } from "next/server";
import { trainingCredentials } from "@/lib/handprint-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET() {
  return NextResponse.json({
    credentials: trainingCredentials,
    generatedAt: new Date().toISOString()
  });
}
