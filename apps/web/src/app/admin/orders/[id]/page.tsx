import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { orders, orderItems, organizations, orderStatusHistory, deliveryAddresses, products } from "@marin-froid/db";
import { OrderPreparationTimeline } from "@/components/OrderPreparationTimeline";
import { DeleteOrderButton } from "@/components/DeleteOrderButton";
import { PageHeader } from "@/components/PageHeader";
import { orderStatusLabel } from "@/lib/order-status";

function formatEUR(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) notFound();

  const [organization, items, history, deliveryAddress] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, order.organizationId) }),
    db
      .select({
        id: orderItems.id,
        productNameSnapshot: orderItems.productNameSnapshot,
        skuSnapshot: orderItems.skuSnapshot,
        unitSnapshot: orderItems.unitSnapshot,
        quantity: orderItems.quantity,
        indicativePrice: products.indicativePrice,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, order.id)),
    db.query.orderStatusHistory.findMany({
      where: eq(orderStatusHistory.orderId, order.id),
      orderBy: (h, { asc }) => [asc(h.createdAt)],
    }),
    order.deliveryAddressId
      ? db.query.deliveryAddresses.findFirst({ where: eq(deliveryAddresses.id, order.deliveryAddressId) })
      : Promise.resolve(null),
  ]);

  const orderTotal = items.some((i) => i.indicativePrice)
    ? items.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * i.quantity : 0), 0)
    : null;

  return (
    <>
      <PageHeader
        title={order.reference}
        subtitle={`${organization?.name} · ${new Date(order.createdAt).toLocaleString("fr-FR")}`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className={`badge badge-${order.status}`}>{orderStatusLabel(order.status)}</span>
            <DeleteOrderButton orderId={order.id} reference={order.reference} />
          </div>
        }
      />

      <div style={{ marginBottom: 20 }}>
        <OrderPreparationTimeline
          status={order.status}
          history={history.map((h) => ({ status: h.status, createdAt: h.createdAt.toString() }))}
          estimatedDeliveryDate={order.estimatedDeliveryDate?.toString() ?? null}
        />
      </div>

      {(deliveryAddress || order.notes || order.estimatedDeliveryDate) && (
        <div className="card grid-split-2" style={{ padding: 16, marginBottom: 20, gap: 16 }}>
          {deliveryAddress && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
                Adresse de livraison
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{deliveryAddress.label}</div>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                {deliveryAddress.line1}{deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ""} · {deliveryAddress.postalCode} {deliveryAddress.city}
              </div>
            </div>
          )}
          {order.estimatedDeliveryDate && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
                Livraison estimée
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {new Date(order.estimatedDeliveryDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </div>
            </div>
          )}
          {order.notes && (
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
                Notes internes
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text)" }}>{order.notes}</div>
            </div>
          )}
        </div>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {items.map((item, idx) => (
          <div key={item.id} style={{ padding: 16, borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none", display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.productNameSnapshot}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {item.skuSnapshot} · {item.unitSnapshot}
                {item.indicativePrice && ` · ${formatEUR(Number(item.indicativePrice))} / ${item.unitSnapshot}`}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {item.indicativePrice && (
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{formatEUR(Number(item.indicativePrice) * item.quantity)}</div>
              )}
              <div style={{ fontWeight: item.indicativePrice ? 500 : 600, fontSize: item.indicativePrice ? 12 : 14, color: item.indicativePrice ? "var(--color-text-muted)" : undefined }}>
                × {item.quantity}
              </div>
            </div>
          </div>
        ))}
        {orderTotal !== null && (
          <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-bg)" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-muted)" }}>Total indicatif</span>
            <span style={{ fontSize: 17, fontWeight: 750, letterSpacing: "-0.01em" }}>{formatEUR(orderTotal)}</span>
          </div>
        )}
      </div>
    </>
  );
}
