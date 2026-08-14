import Link from "next/link";
import { eq, desc, ne, and } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, products } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { ProductTile } from "@/components/ProductTile";

export default async function DashboardPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const recentOrders = await db.query.orders.findMany({
    where: eq(orders.organizationId, organization.id),
    orderBy: [desc(orders.createdAt)],
    limit: 3,
  });

  const inProgressOrders = await db.query.orders.findMany({
    where: and(eq(orders.organizationId, organization.id), ne(orders.status, "completed"), ne(orders.status, "cancelled")),
  });

  const recentItems = recentOrders.length
    ? await db
        .select({
          productId: orderItems.productId,
          name: products.name,
          sku: products.sku,
          unit: products.unit,
          origin: products.origin,
          packaging: products.packaging,
          indicativePrice: products.indicativePrice,
        })
        .from(orderItems)
        .innerJoin(products, eq(products.id, orderItems.productId))
        .innerJoin(orders, eq(orders.id, orderItems.orderId))
        .where(eq(orders.organizationId, organization.id))
        .orderBy(desc(orders.createdAt))
        .limit(8)
    : [];

  const uniqueRecent = Array.from(new Map(recentItems.map((i) => [i.productId, i])).values());
  const lastOrder = recentOrders[0];

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Bonjour {session.fullName.split(" ")[0]}</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: 24 }}>Voici un aperçu de votre activité.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 40 }}>
        <div className="stat-card">
          <div className="stat-value">{inProgressOrders.length}</div>
          <div className="stat-label">Commande(s) en cours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{lastOrder ? new Date(lastOrder.createdAt).toLocaleDateString("fr-FR") : "—"}</div>
          <div className="stat-label">Dernière commande</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{uniqueRecent.length}</div>
          <div className="stat-label">Produits habituels</div>
        </div>
      </div>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Vos produits habituels</h2>
        {uniqueRecent.length === 0 ? (
          <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>
            Aucun achat pour le moment. <Link href="/catalog" style={{ fontWeight: 600 }}>Parcourir le catalogue</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {uniqueRecent.map((item) => (
              <ProductTile
                key={item.productId}
                productId={item.productId}
                name={item.name}
                sku={item.sku}
                unit={item.unit}
                origin={item.origin}
                packaging={item.packaging}
                price={item.indicativePrice}
              />
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
