import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, orderItems, deliveryAddresses, orderStatusHistory } from "@marin-froid/db";
import { ReorderButton } from "@/components/ReorderButton";
import { OrderPreparationTimeline } from "@/components/OrderPreparationTimeline";
import { orderStatusLabel } from "@/lib/order-status";
import { PageHeader } from "@/components/PageHeader";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const { id } = await params;
  const { confirmed } = await searchParams;
  const { organization } = await requireClientSession();
  const db = getDb();

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.organizationId, organization.id)),
  });
  if (!order) notFound();

  const [items, address, history] = await Promise.all([
    db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) }),
    order.deliveryAddressId
      ? db.query.deliveryAddresses.findFirst({ where: eq(deliveryAddresses.id, order.deliveryAddressId) })
      : Promise.resolve(null),
    db.query.orderStatusHistory.findMany({
      where: eq(orderStatusHistory.orderId, order.id),
      orderBy: (h, { asc }) => [asc(h.createdAt)],
    }),
  ]);

  return (
    <>
      {confirmed === "1" && (
        <div className="card success-pop" style={{ padding: 16, marginBottom: 24, borderColor: "var(--color-success)", background: "#F0FDF4", display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Commande transmise à l'équipe Marin Froid. Vous recevrez un e-mail de confirmation.
        </div>
      )}
      <PageHeader
        title={order.reference}
        subtitle={new Date(order.createdAt).toLocaleString("fr-FR")}
        action={<span className={`badge badge-${order.status}`}>{orderStatusLabel(order.status)}</span>}
      />

      <div style={{ marginBottom: 20 }}>
        <OrderPreparationTimeline
          status={order.status}
          history={history.map((h) => ({ status: h.status, createdAt: h.createdAt.toString() }))}
        />
      </div>

      {(address || order.estimatedDeliveryDate || order.notes) && (
        <div className="card" style={{ padding: 16, marginBottom: 20, fontSize: 13, color: "var(--color-text-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
          {address && (
            <div>
              <strong style={{ color: "var(--color-text)" }}>Livraison —</strong> {address.label} · {address.line1}, {address.postalCode} {address.city}
            </div>
          )}
          {order.estimatedDeliveryDate && (
            <div>
              <strong style={{ color: "var(--color-text)" }}>Livraison estimée —</strong>{" "}
              {new Date(order.estimatedDeliveryDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          )}
          {order.notes && (
            <div>
              <strong style={{ color: "var(--color-text)" }}>Notes —</strong> {order.notes}
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ overflow: "hidden", marginBottom: 20 }}>
        {items.map((item, idx) => (
          <div key={item.id} style={{ padding: 16, borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none", display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.productNameSnapshot}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{item.skuSnapshot} · {item.unitSnapshot}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600 }}>× {item.preparedQuantity ?? item.quantity}</div>
              {item.preparedQuantity !== null && item.preparedQuantity !== item.quantity && (
                <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>commandé × {item.quantity}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ReorderButton orderId={order.id} />
    </>
  );
}
