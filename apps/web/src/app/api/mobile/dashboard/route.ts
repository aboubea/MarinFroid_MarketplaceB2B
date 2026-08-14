import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";
import { orders, orderItems, products } from "@marin-froid/db";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session || !session.organizationId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const db = getDb();

  const recentOrders = await db.query.orders.findMany({
    where: eq(orders.organizationId, session.organizationId),
    orderBy: [desc(orders.createdAt)],
    limit: 5,
  });

  const recentItems = recentOrders.length
    ? await db
        .select({ productId: orderItems.productId, name: products.name, sku: products.sku, unit: products.unit })
        .from(orderItems)
        .innerJoin(products, eq(products.id, orderItems.productId))
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(eq(orders.organizationId, session.organizationId))
        .orderBy(desc(orders.createdAt))
        .limit(8)
    : [];

  const uniqueRecent = Array.from(new Map(recentItems.map((i) => [i.productId, i])).values());

  return NextResponse.json({
    recentProducts: uniqueRecent,
    recentOrders: recentOrders.map((o) => ({ id: o.id, reference: o.reference, status: o.status, createdAt: o.createdAt })),
  });
}
