import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getSessionFromRequest } from "@/lib/mobile-auth";
import { getDb } from "@/lib/db";
import { orders, orderItems } from "@marin-froid/db";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(request);
  if (!session || !session.organizationId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const db = getDb();
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.organizationId, session.organizationId)),
  });
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) });

  return NextResponse.json({
    order: { id: order.id, reference: order.reference, status: order.status, createdAt: order.createdAt },
    items,
  });
}
