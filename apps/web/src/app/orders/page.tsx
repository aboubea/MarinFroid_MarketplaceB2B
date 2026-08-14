import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";

export default async function OrdersPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();
  const list = await db.query.orders.findMany({
    where: eq(orders.organizationId, organization.id),
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Vos commandes</h1>
      {list.length === 0 ? (
        <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>Aucune commande.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{o.reference}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</div>
              </div>
              <span className={`badge badge-${o.status}`}>{o.status}</span>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
