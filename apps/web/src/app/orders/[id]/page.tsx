import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { ReorderButton } from "@/components/ReorderButton";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { id } = await params;
  const { confirmed } = await searchParams;
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.organizationId, organization.id)),
  });
  if (!order) notFound();

  const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) });

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name}>
      {confirmed === "1" && (
        <div className="card" style={{ padding: 16, marginBottom: 24, borderColor: "var(--color-success)", background: "#F0FDF4" }}>
          Commande transmise à l'équipe Marin Froid. Vous recevrez un e-mail de confirmation.
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>{order.reference}</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{new Date(order.createdAt).toLocaleString("fr-FR")}</p>
        </div>
        <span className={`badge badge-${order.status}`}>{order.status}</span>
      </div>

      <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
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

      <ReorderButton orderId={order.id} />
    </AppShell>
  );
}
