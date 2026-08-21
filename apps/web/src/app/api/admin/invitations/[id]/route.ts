import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { invitations } from "@marin-froid/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidAdminSession();
  const db = getDb();

  const invitation = await db.query.invitations.findFirst({ where: eq(invitations.id, id) });
  if (!invitation) return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });

  await db.delete(invitations).where(eq(invitations.id, id));
  return NextResponse.json({ ok: true });
}
