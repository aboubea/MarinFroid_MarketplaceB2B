import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { brandingSettings } from "@marin-froid/db";

export async function POST(request: Request) {
  await requireMarinFroidSession();
  const { logoUrl, primaryColor, secondaryColor } = await request.json();

  const db = getDb();
  const existing = await db.query.brandingSettings.findFirst();

  if (existing) {
    await db
      .update(brandingSettings)
      .set({ logoUrl: logoUrl || null, primaryColor, secondaryColor, updatedAt: new Date() })
      .where(eq(brandingSettings.id, existing.id));
  } else {
    await db.insert(brandingSettings).values({ logoUrl: logoUrl || null, primaryColor, secondaryColor });
  }

  return NextResponse.json({ ok: true });
}
