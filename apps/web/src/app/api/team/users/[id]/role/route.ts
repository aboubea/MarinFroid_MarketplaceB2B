import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";
import { logActivity } from "@/lib/activity";

const ALLOWED_ROLES = ["org_admin", "org_buyer", "org_viewer"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "org_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (id === session.userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle." }, { status: 400 });
  }

  const { role } = await request.json();
  if (!ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
  }

  const db = getDb();
  const target = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.organizationId, session.organizationId)),
  });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  await db.update(users).set({ role }).where(eq(users.id, id));

  const ROLE_LABELS: Record<string, string> = { org_admin: "Administrateur", org_buyer: "Acheteur", org_viewer: "Lecture / administratif" };
  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: session.organizationId,
    action: "staff_role_updated",
    entityType: "user",
    entityId: id,
    summary: `Rôle de ${target.fullName} changé en « ${ROLE_LABELS[role]} »`,
  });

  return NextResponse.json({ ok: true });
}
