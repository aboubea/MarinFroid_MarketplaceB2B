import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { users, activityLogs, invitations, orders } from "@marin-froid/db";
import { logActivity } from "@/lib/activity";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  const session = await requireMarinFroidAdminSession();
  const db = getDb();

  const target = await db.query.users.findFirst({ where: and(eq(users.id, userId), eq(users.organizationId, id)) });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  const placedOrder = await db.query.orders.findFirst({ where: eq(orders.placedByUserId, userId) });
  if (placedOrder) {
    return NextResponse.json(
      { error: "Impossible de supprimer : cet utilisateur a passé des commandes existantes. Désactivez-le plutôt." },
      { status: 409 },
    );
  }

  try {
    // activity_logs.actor_user_id and invitations.invited_by_user_id both
    // reference users with no onDelete — clear those first.
    await db.update(activityLogs).set({ actorUserId: null }).where(eq(activityLogs.actorUserId, userId));
    await db.update(invitations).set({ invitedByUserId: null }).where(eq(invitations.invitedByUserId, userId));
    await db.delete(users).where(eq(users.id, userId));
  } catch {
    return NextResponse.json({ error: "Impossible de supprimer cet utilisateur." }, { status: 409 });
  }

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: id,
    action: "org_user_deleted",
    entityType: "user",
    entityId: userId,
    summary: `${target.fullName} (${target.email}) supprimé`,
  });

  return NextResponse.json({ ok: true });
}
