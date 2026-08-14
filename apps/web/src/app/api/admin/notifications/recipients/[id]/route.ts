import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { notificationRecipients } from "@marin-froid/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const { active } = await request.json();
  const db = getDb();
  await db.update(notificationRecipients).set({ active }).where(eq(notificationRecipients.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const db = getDb();
  await db.delete(notificationRecipients).where(eq(notificationRecipients.id, id));
  return NextResponse.json({ ok: true });
}
