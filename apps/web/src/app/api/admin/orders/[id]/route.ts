import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, organizations, deliveryAddresses, orderStatusHistory } from "@marin-froid/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const db = getDb();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const [organization, items, address, history] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, order.organizationId) }),
    db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) }),
    order.deliveryAddressId
      ? db.query.deliveryAddresses.findFirst({ where: eq(deliveryAddresses.id, order.deliveryAddressId) })
      : Promise.resolve(null),
    db.query.orderStatusHistory.findMany({ where: eq(orderStatusHistory.orderId, order.id), orderBy: (h, { asc }) => [asc(h.createdAt)] }),
  ]);

  return NextResponse.json({
    order: { id: order.id, reference: order.reference, status: order.status, createdAt: order.createdAt },
    organizationName: organization?.name ?? "—",
    items,
    address,
    history,
  });
}
