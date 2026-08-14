import Link from "next/link";
import { eq, desc, ne } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminHomePage() {
  const session = await requireMarinFroidSession();
  const db = getDb();
  const pending = await db.query.orders.findMany({
    where: ne(orders.status, "completed"),
    orderBy: [desc(orders.createdAt)],
    limit: 10,
  });

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Commandes à traiter</h1>
      {pending.length === 0 ? (
        <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>Aucune commande en attente.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pending.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{o.reference}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleString("fr-FR")}</div>
              </div>
              <span className={`badge badge-${o.status}`}>{o.status}</span>
            </Link>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
