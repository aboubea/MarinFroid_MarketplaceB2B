import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { productDocuments } from "@marin-froid/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const db = getDb();
  await db.delete(productDocuments).where(eq(productDocuments.id, id));
  return NextResponse.json({ ok: true });
}
