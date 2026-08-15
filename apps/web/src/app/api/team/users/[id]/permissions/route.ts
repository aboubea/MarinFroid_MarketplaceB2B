import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";
import { encodeOverrides } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "org_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { canOrder, receivesOrderEmails } = await request.json();
  if (typeof canOrder !== "boolean" || typeof receivesOrderEmails !== "boolean") {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }

  const db = getDb();
  const target = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.organizationId, session.organizationId)),
  });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  if (target.role === "org_admin") {
    return NextResponse.json({ error: "Les permissions d'un administrateur ne sont pas modifiables." }, { status: 400 });
  }

  await db.update(users).set({ permissions: encodeOverrides({ canOrder, receivesOrderEmails }) }).where(eq(users.id, id));

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: session.organizationId,
    action: "permissions_updated",
    entityType: "user",
    entityId: id,
    summary: `Permissions personnalisées pour ${target.fullName}`,
  });

  return NextResponse.json({ ok: true });
}
