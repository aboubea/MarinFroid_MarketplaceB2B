import { NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders } from "@marin-froid/db";
import { changeOrderStatus } from "@/lib/order-status-service";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
  }

  const db = getDb();
  const dueOrders = await db.query.orders.findMany({
    where: and(eq(orders.status, "shipped"), lte(orders.estimatedDeliveryDate, new Date())),
  });

  let completed = 0;
  for (const order of dueOrders) {
    await changeOrderStatus({ orderId: order.id, status: "completed", actorLabel: "Automatique (date de livraison estimée atteinte)" });
    completed++;
  }

  return NextResponse.json({ ok: true, completed });
}
