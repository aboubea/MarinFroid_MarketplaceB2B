import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, products } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { ReachatBrowser } from "@/components/ReachatBrowser";
import { PageHeader } from "@/components/PageHeader";

export default async function ReachatPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const rows = await db
    .select({
      productId: orderItems.productId,
      name: products.name,
      sku: products.sku,
      unit: products.unit,
      origin: products.origin,
      packaging: products.packaging,
      indicativePrice: products.indicativePrice,
      active: products.active,
      quantity: orderItems.quantity,
      orderCreatedAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orders.organizationId, organization.id));

  const byProduct = new Map<
    string,
    {
      productId: string;
      name: string;
      sku: string;
      unit: string;
      origin: string | null;
      packaging: string | null;
      indicativePrice: string | null;
      active: boolean;
      orderCount: number;
      lastOrderedAt: string;
      usualQuantity: number;
    }
  >();

  for (const row of rows) {
    const existing = byProduct.get(row.productId);
    const createdAt = row.orderCreatedAt.toString();
    if (existing) {
      existing.orderCount += 1;
      existing.usualQuantity = Math.max(existing.usualQuantity, row.quantity);
      if (new Date(createdAt) > new Date(existing.lastOrderedAt)) existing.lastOrderedAt = createdAt;
    } else {
      byProduct.set(row.productId, {
        productId: row.productId,
        name: row.name,
        sku: row.sku,
        unit: row.unit,
        origin: row.origin,
        packaging: row.packaging,
        indicativePrice: row.indicativePrice,
        active: row.active,
        orderCount: 1,
        lastOrderedAt: createdAt,
        usualQuantity: row.quantity,
      });
    }
  }

  const items = Array.from(byProduct.values()).filter((i) => i.active);

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <PageHeader title="Mes produits habituels" subtitle="Retrouvez vos références récurrentes et lancez une commande express." />
      <ReachatBrowser items={items} />
    </AppShell>
  );
}
