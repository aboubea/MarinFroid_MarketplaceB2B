import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { clientNotifications } from "@marin-froid/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const db = getDb();
  await db
    .update(clientNotifications)
    .set({ readAt: new Date() })
    .where(and(eq(clientNotifications.id, id), eq(clientNotifications.userId, session.userId)));

  return NextResponse.json({ ok: true });
}
