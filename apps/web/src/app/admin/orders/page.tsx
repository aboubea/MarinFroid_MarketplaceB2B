import Link from "next/link";
import { desc } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, organizations } from "@marin-froid/db";
import { eq } from "drizzle-orm";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminOrdersPage() {
  const session = await requireMarinFroidSession();
  const db = getDb();
  const list = await db
    .select({
      id: orders.id,
      reference: orders.reference,
      status: orders.status,
      createdAt: orders.createdAt,
      organizationName: organizations.name,
    })
    .from(orders)
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .orderBy(desc(orders.createdAt));

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Toutes les commandes</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((o) => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{o.reference} — {o.organizationName}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleString("fr-FR")}</div>
            </div>
            <span className={`badge badge-${o.status}`}>{o.status}</span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
