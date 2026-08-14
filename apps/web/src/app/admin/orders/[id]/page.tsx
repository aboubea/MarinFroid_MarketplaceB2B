import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, organizations } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidSession();
  const db = getDb();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) notFound();

  const [organization, items] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, order.organizationId) }),
    db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) }),
  ]);

  return (
    <AdminShell fullName={session.fullName}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>{order.reference}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            {organization?.name} · {new Date(order.createdAt).toLocaleString("fr-FR")}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {items.map((item, idx) => (
          <div key={item.id} style={{ padding: 16, borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.productNameSnapshot}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{item.skuSnapshot} · {item.unitSnapshot}</div>
            </div>
            <div style={{ fontWeight: 600 }}>× {item.quantity}</div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
