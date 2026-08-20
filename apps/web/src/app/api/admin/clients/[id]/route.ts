import { NextResponse } from "next/server";
import { eq, desc, inArray } from "drizzle-orm";
import { requireMarinFroidSession, requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, users, orders, activityLogs } from "@marin-froid/db";
import { logActivity } from "@/lib/activity";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const db = getDb();

  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  if (!organization) return NextResponse.json({ error: "Société introuvable." }, { status: 404 });

  const [orgUsers, recentOrders] = await Promise.all([
    db.query.users.findMany({ where: eq(users.organizationId, id) }),
    db.query.orders.findMany({ where: eq(orders.organizationId, id), orderBy: [desc(orders.createdAt)], limit: 5 }),
  ]);

  return NextResponse.json({
    organization: { id: organization.id, name: organization.name, status: organization.status, createdAt: organization.createdAt },
    users: orgUsers.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, active: u.active })),
    recentOrders: recentOrders.map((o) => ({ id: o.id, reference: o.reference, status: o.status, createdAt: o.createdAt })),
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidAdminSession();
  const db = getDb();

  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  if (!organization) return NextResponse.json({ error: "Société introuvable." }, { status: 404 });

  // Marin Froid's own staff (mf_admin/mf_ops) belong to an "organization"
  // row too — never let that one be deleted from the client list.
  const staffMember = await db.query.users.findFirst({
    where: (u, { and, eq: eqFn, inArray: inArrayFn }) => and(eqFn(u.organizationId, id), inArrayFn(u.role, ["mf_admin", "mf_ops"])),
  });
  if (staffMember) {
    return NextResponse.json({ error: "Impossible de supprimer l'organisation Marin Froid." }, { status: 400 });
  }

  const orderCount = await db.query.orders.findFirst({ where: eq(orders.organizationId, id) });
  if (orderCount) {
    return NextResponse.json(
      { error: "Impossible de supprimer : cette société a des commandes existantes. Supprimez-les d'abord, ou suspendez la société plutôt." },
      { status: 409 },
    );
  }

  try {
    // Users cascade off the organization, but activity_logs.actor_user_id
    // has no onDelete — clear it for this org's users first so the delete
    // below doesn't fail on anyone who ever did anything logged.
    const orgUsers = await db.query.users.findMany({ where: eq(users.organizationId, id) });
    if (orgUsers.length > 0) {
      await db.update(activityLogs).set({ actorUserId: null }).where(inArray(activityLogs.actorUserId, orgUsers.map((u) => u.id)));
    }
    await db.delete(organizations).where(eq(organizations.id, id));
  } catch {
    return NextResponse.json({ error: "Impossible de supprimer cette société." }, { status: 409 });
  }

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    action: "client_deleted",
    entityType: "organization",
    entityId: id,
    summary: `Société « ${organization.name} » supprimée`,
  });

  return NextResponse.json({ ok: true });
}
