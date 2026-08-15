import Link from "next/link";
import { eq, desc, gte, lte, and, or, inArray } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import {
  organizations,
  users,
  orders,
  orderItems,
  products,
  activityLogs,
  notificationRecipients,
  brandingSettings,
} from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { Avatar } from "@/components/Avatar";
import { orderStatusLabel } from "@/lib/order-status";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";

export default async function AdminOverviewPage() {
  const session = await requireMarinFroidSession();
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
    recentActivity,
    orgsToWatch,
    recentOrders,
    ordersInProgress,
    lateOrders,
    activeRecipients,
    branding,
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
    db.query.activityLogs.findMany({ orderBy: [desc(activityLogs.createdAt)], limit: 6 }),
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
    db.query.notificationRecipients.findMany({ where: eq(notificationRecipients.active, true) }),
    db.query.brandingSettings.findFirst(),
  ]);

  const lateOrdersWithOrg = await Promise.all(
    lateOrders.map(async (o) => ({
      ...o,
      organization: await db.query.organizations.findFirst({ where: eq(organizations.id, o.organizationId) }),
    })),
  );

  const indicativeRevenue30d = items30d.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * i.quantity : 0), 0);
  const hasPricing = items30d.some((i) => i.indicativePrice);

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Administration</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, marginBottom: 24 }}>Vue globale et configuration.</p>

      <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--color-text-muted)", marginBottom: 10 }}>
        Performance
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        {hasPricing && (
          <div className="stat-card">
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
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
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
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Commandes en retard</h2>
          <div className="card" style={{ overflow: "hidden" }}>
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
        </section>
      )}

      <div className="grid-split-2" style={{ gap: 16, marginBottom: 16, alignItems: "start" }}>
        <section>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Activité récente</h2>
          <div className="card" style={{ overflow: "hidden" }}>
            <RecentActivityFeed
              initialActivity={recentActivity.map((a) => ({ id: a.id, summary: a.summary, actorLabel: a.actorLabel, createdAt: a.createdAt.toString() }))}
              initialHasMore={recentActivity.length === 6}
            />
          </div>
          <Link href="/admin/activity" style={{ fontSize: 12.5, fontWeight: 600, display: "inline-block", marginTop: 8 }}>Voir toute l'activité →</Link>
        </section>

        <section>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Sociétés clientes à suivre</h2>
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
          <Link href="/admin/clients" style={{ fontSize: 12.5, fontWeight: 600, display: "inline-block", marginTop: 8 }}>Voir toutes les sociétés →</Link>
        </section>
      </div>

      <section style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <h2 style={{ fontSize: 15 }}>Dernières commandes</h2>
          <Link href="/admin/orders" style={{ fontSize: 12.5, fontWeight: 600 }}>Voir toutes les commandes →</Link>
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          {recentOrders.length === 0 ? (
            <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucune commande.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Client</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td><Link href={`/admin/orders/${o.id}`} style={{ fontWeight: 600 }}>{o.reference}</Link></td>
                    <td style={{ color: "var(--color-text-muted)" }}>{o.organizationName}</td>
                    <td><span className={`badge badge-${o.status}`}>{orderStatusLabel(o.status)}</span></td>
                    <td style={{ color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="grid-split-2" style={{ gap: 16 }}>
        <section>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Email & notifications</h2>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "var(--color-text-muted)" }}>Destinataires actifs</span>
              <span style={{ fontWeight: 700 }}>{activeRecipients.length}</span>
            </div>
            <Link href="/admin/notifications" className="btn-secondary" style={{ display: "inline-block", marginTop: 8, fontSize: 12.5 }}>
              Gérer les notifications
            </Link>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 15, marginBottom: 10 }}>Branding actif</h2>
          <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: branding?.primaryColor ?? "#0F172A" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Marin Froid</div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{branding?.primaryColor ?? "#0F172A"}</div>
              </div>
            </div>
            <Link href="/admin/branding" className="btn-secondary" style={{ fontSize: 12.5 }}>Modifier</Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
