import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { orders, orderItems, products } from "@marin-froid/db";
import { addToCart } from "@/lib/cart";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.organizationId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const db = getDb();
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.organizationId, session.organizationId)),
  });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) });

  for (const item of items) {
    const stillActive = await db.query.products.findFirst({ where: and(eq(products.id, item.productId), eq(products.active, true)) });
    if (stillActive) {
      await addToCart(session.organizationId, session.userId, item.productId, item.quantity);
    }
  }

  return NextResponse.json({ ok: true });
}
