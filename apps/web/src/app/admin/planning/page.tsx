import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, organizations, orderItems } from "@marin-froid/db";
import { PageHeader } from "@/components/PageHeader";
import { PullToRefresh } from "@/components/PullToRefresh";

const COLUMNS = [
  { status: "submitted" as const, title: "À traiter", accent: "var(--color-warning, #D97706)" },
  { status: "acknowledged" as const, title: "Confirmées", accent: "var(--color-accent, #2563EB)" },
  { status: "processing" as const, title: "En préparation", accent: "var(--color-accent, #2563EB)" },
  { status: "shipped" as const, title: "Expédiées", accent: "var(--color-success)" },
];

function ageInDays(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
}

export default async function AdminPlanningPage() {
  const db = getDb();

  const columnsData = await Promise.all(
    COLUMNS.map(async (col) => {
      const rows = await db
        .select({
          id: orders.id,
          reference: orders.reference,
          createdAt: orders.createdAt,
          organizationName: organizations.name,
        })
        .from(orders)
        .innerJoin(organizations, eq(organizations.id, orders.organizationId))
        .where(eq(orders.status, col.status))
        .orderBy(asc(orders.createdAt));

      const withItemCounts = await Promise.all(
        rows.map(async (o) => {
          const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, o.id) });
          return { ...o, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) };
        }),
      );

      return { ...col, orders: withItemCounts };
    }),
  );

  return (
    <PullToRefresh>
      <PageHeader title="Planning" subtitle="Charge par étape, commandes les plus anciennes en premier." />

      <div className="planning-board">
        {columnsData.map((col) => (
          <div key={col.status}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: col.accent, display: "inline-block" }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{col.title}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)" }}>{col.orders.length}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 40 }}>
              {col.orders.length === 0 ? (
                <div className="card" style={{ padding: 16, fontSize: 12, color: "var(--color-text-faint)" }}>
                  Aucune commande.
                </div>
              ) : (
                col.orders.map((o) => {
                  const age = ageInDays(o.createdAt);
                  const isLate = age >= 3;
                  return (
                    <Link
                      key={o.id}
                      href={`/admin/orders/${o.id}`}
                      className="card"
                      style={{
                        padding: 12,
                        display: "block",
                        borderColor: isLate ? "var(--color-danger, #DC2626)" : undefined,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{o.reference}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isLate ? "var(--color-danger, #DC2626)" : "var(--color-text-faint)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {age === 0 ? "Aujourd'hui" : `${age} j`}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{o.organizationName}</div>
                      <div style={{ fontSize: 11.5, color: "var(--color-text-faint)", marginTop: 2 }}>{o.itemCount} article(s)</div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </PullToRefresh>
  );
}
