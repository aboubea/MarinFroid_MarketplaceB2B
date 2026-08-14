import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, users, orders } from "@marin-froid/db";

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
