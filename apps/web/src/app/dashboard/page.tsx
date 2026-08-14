import Link from "next/link";
import { eq, desc, and } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, products } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { QuickAddButton } from "@/components/QuickAddButton";

export default async function DashboardPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const recentOrders = await db.query.orders.findMany({
    where: eq(orders.organizationId, organization.id),
    orderBy: [desc(orders.createdAt)],
    limit: 3,
  });

  const recentItems = recentOrders.length
    ? await db
        .select({
          productId: orderItems.productId,
          name: products.name,
          sku: products.sku,
          unit: products.unit,
        })
        .from(orderItems)
        .innerJoin(products, eq(products.id, orderItems.productId))
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(eq(orders.organizationId, organization.id))
        .orderBy(desc(orders.createdAt))
        .limit(8)
    : [];

  const uniqueRecent = Array.from(new Map(recentItems.map((i) => [i.productId, i])).values());

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Bonjour {session.fullName.split(" ")[0]}</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 32 }}>Reprenez où vous en étiez.</p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Vos produits habituels</h2>
        {uniqueRecent.length === 0 ? (
          <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>
            Aucun achat pour le moment. <Link href="/catalog" style={{ fontWeight: 600 }}>Parcourir le catalogue</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {uniqueRecent.map((item) => (
              <div key={item.productId} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{item.sku} · {item.unit}</div>
                <QuickAddButton productId={item.productId} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16 }}>Dernières commandes</h2>
          <Link href="/orders" style={{ fontSize: 13, fontWeight: 600 }}>Tout voir</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>Aucune commande passée.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentOrders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{o.reference}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <span className={`badge badge-${o.status}`}>{o.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
