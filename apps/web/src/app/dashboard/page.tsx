import Link from "next/link";
import { eq, desc, ne, and, gte } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, products } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { getCartWithItems } from "@/lib/cart";
import { DashboardQuickAdd } from "@/components/DashboardQuickAdd";
import { orderStatusLabel } from "@/lib/order-status";

export default async function DashboardPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [recentOrders, inProgressOrders, orders30d, cart] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.organizationId, organization.id),
      orderBy: [desc(orders.createdAt)],
      limit: 5,
    }),
    db.query.orders.findMany({
      where: and(eq(orders.organizationId, organization.id), ne(orders.status, "completed"), ne(orders.status, "cancelled")),
    }),
    db.query.orders.findMany({
      where: and(eq(orders.organizationId, organization.id), gte(orders.createdAt, thirtyDaysAgo)),
    }),
    getCartWithItems(organization.id, session.userId),
  ]);

  const rows = await db
    .select({
      productId: orderItems.productId,
      name: products.name,
      sku: products.sku,
      unit: products.unit,
      indicativePrice: products.indicativePrice,
      quantity: orderItems.quantity,
      orderCreatedAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(eq(orders.organizationId, organization.id));

  const items30d = await db
    .select({ quantity: orderItems.quantity, indicativePrice: products.indicativePrice })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(products.id, orderItems.productId))
    .where(and(eq(orders.organizationId, organization.id), gte(orders.createdAt, thirtyDaysAgo)));
  const spend30d = items30d.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * i.quantity : 0), 0);
  const hasPricing = items30d.some((i) => i.indicativePrice);

  const byProduct = new Map<
    string,
    { productId: string; name: string; sku: string; unit: string; indicativePrice: string | null; orderCount: number; lastOrderedAt: string }
  >();
  for (const row of rows) {
    const createdAt = row.orderCreatedAt.toString();
    const existing = byProduct.get(row.productId);
    if (existing) {
      existing.orderCount += 1;
      if (new Date(createdAt) > new Date(existing.lastOrderedAt)) existing.lastOrderedAt = createdAt;
    } else {
      byProduct.set(row.productId, {
        productId: row.productId,
        name: row.name,
        sku: row.sku,
        unit: row.unit,
        indicativePrice: row.indicativePrice,
        orderCount: 1,
        lastOrderedAt: createdAt,
      });
    }
  }
  const frequent = Array.from(byProduct.values()).sort((a, b) => b.orderCount - a.orderCount).slice(0, 5);

  const lastOrderItems = recentOrders.length
    ? await db.query.orderItems.findMany({ where: eq(orderItems.orderId, recentOrders[0].id) })
    : [];

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Bonjour, {session.fullName.split(" ")[0]} 👋</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>Voici un aperçu de votre activité.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
        {hasPricing && (
          <div className="stat-card">
            <div className="stat-value">{spend30d.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</div>
            <div className="stat-label">Dépenses indicatives (30j)</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-value">{orders30d.length}</div>
          <div className="stat-label">Commandes (30j)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{inProgressOrders.length}</div>
          <div className="stat-label">Commandes en cours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{cart.items.reduce((s, i) => s + i.quantity, 0)}</div>
          <div className="stat-label">Articles dans le panier</div>
        </div>
      </div>

      <div className="grid-split-2" style={{ gap: 16, marginBottom: 32, alignItems: "start" }}>
        <section>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Derniers achats</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            {lastOrderItems.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucun achat pour le moment.</div>
            ) : (
              lastOrderItems.slice(0, 5).map((item, idx) => (
                <div key={item.id} style={{ padding: "12px 16px", borderBottom: idx < Math.min(lastOrderItems.length, 5) - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{item.productNameSnapshot}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Qté habituelle {item.quantity} {item.unitSnapshot}</div>
                </div>
              ))
            )}
          </div>
          <Link href="/orders" style={{ fontSize: 12.5, fontWeight: 600, display: "inline-block", marginTop: 8 }}>Voir tout l'historique →</Link>
        </section>

        <section>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Réachat express</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            {frequent.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-muted)" }}>Pas encore d'historique.</div>
            ) : (
              frequent.map((item, idx) => (
                <div key={item.productId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: idx < frequent.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.name}</div>
                  <DashboardQuickAdd productId={item.productId} />
                </div>
              ))
            )}
          </div>
          <Link href="/reachat" style={{ fontSize: 12.5, fontWeight: 600, display: "inline-block", marginTop: 8 }}>Voir plus de produits →</Link>
        </section>
      </div>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16 }}>Commandes récentes</h2>
          <Link href="/orders" style={{ fontSize: 13, fontWeight: 600 }}>Tout voir</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>Aucune commande passée.</div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td><Link href={`/orders/${o.id}`} style={{ fontWeight: 600 }}>{o.reference}</Link></td>
                    <td style={{ color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td><span className={`badge badge-${o.status}`}>{orderStatusLabel(o.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
