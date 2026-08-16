import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { brandingSettings } from "@marin-froid/db";

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export async function POST(request: Request) {
  await requireMarinFroidSession();
  const { logoUrl, authImageUrl, authImageZoom, authImagePositionX, authImagePositionY, primaryColor, secondaryColor } = await request.json();

  const zoom = clamp(authImageZoom, 100, 250, 100);
  const posX = clamp(authImagePositionX, 0, 100, 50);
  const posY = clamp(authImagePositionY, 0, 100, 50);

  const db = getDb();
  const existing = await db.query.brandingSettings.findFirst();

  const values = {
    logoUrl: logoUrl || null,
    authImageUrl: authImageUrl || null,
    authImageZoom: zoom,
    authImagePositionX: posX,
    authImagePositionY: posY,
    primaryColor,
    secondaryColor,
  };

  if (existing) {
    await db
      .update(brandingSettings)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(brandingSettings.id, existing.id));
  } else {
    await db.insert(brandingSettings).values(values);
  }

  return NextResponse.json({ ok: true });
}
