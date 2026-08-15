import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "mf_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (id === session.userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous désactiver vous-même." }, { status: 400 });
  }

  const { active } = await request.json();
  const db = getDb();

  const target = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.organizationId, session.organizationId), inArray(users.role, ["mf_admin", "mf_ops"])),
  });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  await db.update(users).set({ active }).where(eq(users.id, id));
  return NextResponse.json({ ok: true });
}
