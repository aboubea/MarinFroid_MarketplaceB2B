import Link from "next/link";
import { eq, desc, gte, lte, and, or, inArray } from "drizzle-orm";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, users, orders, orderItems, products } from "@marin-froid/db";
import { Avatar } from "@/components/Avatar";
import { orderStatusLabel } from "@/lib/order-status";
import { getOrderTotals } from "@/lib/order-totals";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminOverviewPage() {
  await requireMarinFroidAdminSession();
  const db = getDb();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const lateThreshold = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const openStatuses = ["submitted", "acknowledged", "processing", "shipped"] as const;

  const [
    activeOrgs,
    activeUsers,
    orders7d,
    items30d,
    orgsToWatch,
    recentOrders,
    ordersInProgress,
    lateOrders,
  ] = await Promise.all([
    db.query.organizations.findMany({ where: eq(organizations.status, "active") }),
    db.query.users.findMany({ where: eq(users.active, true) }),
    db.query.orders.findMany({ where: gte(orders.createdAt, sevenDaysAgo) }),
    db
      .select({ quantity: orderItems.quantity, indicativePrice: products.indicativePrice })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(gte(orders.createdAt, thirtyDaysAgo)),
    db.query.organizations.findMany({
      where: or(eq(organizations.status, "invited"), eq(organizations.status, "suspended")),
      limit: 6,
    }),
    db
      .select({
        id: orders.id,
        reference: orders.reference,
        status: orders.status,
        createdAt: orders.createdAt,
        organizationName: organizations.name,
      })
      .from(orders)
      .innerJoin(organizations, eq(organizations.id, orders.organizationId))
      .orderBy(desc(orders.createdAt))
      .limit(6),
    db.query.orders.findMany({ where: inArray(orders.status, [...openStatuses]) }),
    db.query.orders.findMany({
      where: and(inArray(orders.status, [...openStatuses]), lte(orders.createdAt, lateThreshold)),
      limit: 6,
      orderBy: [orders.createdAt],
    }),
  ]);

  const lateOrdersWithOrg = await Promise.all(
    lateOrders.map(async (o) => ({
      ...o,
      organization: await db.query.organizations.findFirst({ where: eq(organizations.id, o.organizationId) }),
    })),
  );

  const recentOrdersTotals = await getOrderTotals(recentOrders.map((o) => o.id));

  const indicativeRevenue30d = items30d.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * i.quantity : 0), 0);
  const hasPricing = items30d.some((i) => i.indicativePrice);

  return (
    <>
      <PageHeader title="Administration" subtitle="Vue globale et configuration." />

      <h2 className="eyebrow">Performance</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
        {hasPricing && (
          <div className="stat-card stat-card-accent">
            <div className="stat-value">{indicativeRevenue30d.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}</div>
            <div className="stat-label">CA indicatif (30j)</div>
          </div>
        )}
        <div className="stat-card">
          <div className="stat-value">{orders7d.length}</div>
          <div className="stat-label">Commandes (7j)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{ordersInProgress.length}</div>
          <div className="stat-label">Commandes en cours</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeOrgs.length}</div>
          <div className="stat-label">Sociétés actives</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeUsers.length}</div>
          <div className="stat-label">Utilisateurs actifs</div>
        </div>
      </div>

      {lateOrdersWithOrg.length > 0 && (
        <section style={{ marginBottom: 16 }}>
          <h2 className="section-title">Commandes en retard</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>N° Commande</th>
                    <th>Client</th>
                    <th>Statut</th>
                    <th>Depuis</th>
                  </tr>
                </thead>
                <tbody>
                  {lateOrdersWithOrg.map((o) => (
                    <tr key={o.id}>
                      <td><Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 600 }}>{o.reference}</Link></td>
                      <td style={{ color: "var(--color-text-muted)" }}>{o.organization?.name ?? "—"}</td>
                      <td><span className={`badge badge-${o.status}`}>{orderStatusLabel(o.status)}</span></td>
                      <td style={{ color: "var(--color-danger, #DC2626)", fontWeight: 600 }}>
                        {Math.floor((Date.now() - new Date(o.createdAt).getTime()) / (24 * 60 * 60 * 1000))} j
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <div className="grid-split-2" style={{ gap: 16, marginBottom: 32, alignItems: "start" }}>
        <section>
          <h2 className="section-title">Dernières commandes</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            {recentOrders.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucune commande.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table data-table-compact">
                  <thead>
                    <tr>
                      <th>N° Commande</th>
                      <th>Client</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const total = recentOrdersTotals.get(o.id) ?? 0;
                      return (
                        <tr key={o.id}>
                          <td><Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 600 }}>{o.reference}</Link></td>
                          <td style={{ color: "var(--color-text-muted)" }}>{o.organizationName}</td>
                          <td style={{ fontWeight: 600 }}>{total > 0 ? total.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : "—"}</td>
                          <td><span className={`badge badge-${o.status}`}>{orderStatusLabel(o.status)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Sociétés clientes à suivre</h2>
            <Link href="/admin/clients" style={{ fontSize: 12.5, fontWeight: 600 }}>Voir toutes les sociétés →</Link>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            {orgsToWatch.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucune société en attente ou suspendue.</div>
            ) : (
              orgsToWatch.map((o, idx) => (
                <Link
                  key={o.id}
                  href={`/admin/clients/${o.id}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: idx < orgsToWatch.length - 1 ? "1px solid var(--color-border)" : "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={o.name} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</span>
                  </div>
                  <span className={`badge ${o.status === "suspended" ? "badge-cancelled" : "badge-submitted"}`}>
                    {o.status === "suspended" ? "Suspendue" : "Invitée"}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}
