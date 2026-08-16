import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// No cookies/params are read here, so without this Next.js statically
// caches the response at build time and never picks up branding changes.
export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const branding = await db.query.brandingSettings.findFirst();
  return NextResponse.json({
    logoUrl: branding?.logoUrl ?? null,
    authImageUrl: branding?.authImageUrl ?? null,
  });
}
