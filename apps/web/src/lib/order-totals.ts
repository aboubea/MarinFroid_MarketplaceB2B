import { eq, inArray, sql } from "drizzle-orm";
import { orderItems, products } from "@marin-froid/db";
import { getDb } from "./db";

export async function getOrderTotals(orderIds: string[]): Promise<Map<string, number>> {
  if (orderIds.length === 0) return new Map();
  const db = getDb();
  const rows = await db
    .select({
      orderId: orderItems.orderId,
      total: sql<string>`sum(${orderItems.quantity} * coalesce(${products.indicativePrice}, 0))`,
    })
    .from(orderItems)
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(inArray(orderItems.orderId, orderIds))
    .groupBy(orderItems.orderId);
  return new Map(rows.map((r) => [r.orderId, Number(r.total)]));
}
