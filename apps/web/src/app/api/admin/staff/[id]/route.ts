import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users, activityLogs, invitations } from "@marin-froid/db";
import { logActivity } from "@/lib/activity";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "mf_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  if (id === session.userId) {
    return NextResponse.json({ error: "Vous ne pouvez pas vous supprimer vous-même." }, { status: 400 });
  }

  const db = getDb();
  const target = await db.query.users.findFirst({
    where: and(eq(users.id, id), eq(users.organizationId, session.organizationId), inArray(users.role, ["mf_admin", "mf_ops"])),
  });
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });

  try {
    // activity_logs.actor_user_id and invitations.invited_by_user_id both
    // reference users with no onDelete — clear those first or the delete
    // below fails on anyone who ever did anything logged or sent an invite.
    await db.update(activityLogs).set({ actorUserId: null }).where(eq(activityLogs.actorUserId, id));
    await db.update(invitations).set({ invitedByUserId: null }).where(eq(invitations.invitedByUserId, id));
    await db.delete(users).where(eq(users.id, id));
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer : ce compte apparaît dans des commandes existantes. Désactivez-le plutôt." },
      { status: 409 },
    );
  }

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    action: "staff_deleted",
    entityType: "user",
    entityId: id,
    summary: `${target.fullName} (${target.email}) supprimé de l'équipe Marin Froid`,
  });

  return NextResponse.json({ ok: true });
}
