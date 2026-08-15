import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, organizations, deliveryAddresses, orderStatusHistory, products } from "@marin-froid/db";
import { getOrderTotals } from "@/lib/order-totals";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const db = getDb();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const [organization, items, address, history, totals] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, order.organizationId) }),
    db
      .select({
        id: orderItems.id,
        productNameSnapshot: orderItems.productNameSnapshot,
        skuSnapshot: orderItems.skuSnapshot,
        unitSnapshot: orderItems.unitSnapshot,
        quantity: orderItems.quantity,
        indicativePrice: products.indicativePrice,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, order.id)),
    order.deliveryAddressId
      ? db.query.deliveryAddresses.findFirst({ where: eq(deliveryAddresses.id, order.deliveryAddressId) })
      : Promise.resolve(null),
    db.query.orderStatusHistory.findMany({ where: eq(orderStatusHistory.orderId, order.id), orderBy: (h, { asc }) => [asc(h.createdAt)] }),
    getOrderTotals([order.id]),
  ]);

  return NextResponse.json({
    order: { id: order.id, reference: order.reference, status: order.status, createdAt: order.createdAt },
    organizationName: organization?.name ?? "—",
    items,
    address,
    history,
    totalAmount: totals.get(order.id) ?? 0,
  });
}
