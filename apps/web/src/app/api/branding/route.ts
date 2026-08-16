import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const branding = await db.query.brandingSettings.findFirst();
  return NextResponse.json({
    logoUrl: branding?.logoUrl ?? null,
    authImageUrl: branding?.authImageUrl ?? null,
  });
}
