import { eq, and, gte, lte } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { AdminOrdersBoard } from "@/components/AdminOrdersBoard";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminPreparationPage() {
  const session = await requireMarinFroidSession();
  const db = getDb();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [toTreat, inPrep, shippedToday, late] = await Promise.all([
    db.query.orders.findMany({ where: eq(orders.status, "submitted") }),
    db.query.orders.findMany({ where: eq(orders.status, "processing") }),
    db.query.orders.findMany({ where: and(eq(orders.status, "shipped"), gte(orders.updatedAt, startOfDay)) }),
    db.query.orders.findMany({ where: and(eq(orders.status, "submitted"), lte(orders.createdAt, twentyFourHoursAgo)) }),
  ]);

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Préparation des commandes" subtitle="Ce qu'il faut traiter maintenant." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-value">{toTreat.length}</div>
          <div className="stat-label">À traiter</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{inPrep.length}</div>
          <div className="stat-label">En préparation</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{shippedToday.length}</div>
          <div className="stat-label">Expédiées aujourd'hui</div>
        </div>
        {late.length > 0 && (
          <div className="stat-card" style={{ borderColor: "var(--color-danger)" }}>
            <div className="stat-value" style={{ color: "var(--color-danger)" }}>{late.length}</div>
            <div className="stat-label">En attente depuis +24h</div>
          </div>
        )}
      </div>

      <AdminOrdersBoard />
    </AdminShell>
  );
}
