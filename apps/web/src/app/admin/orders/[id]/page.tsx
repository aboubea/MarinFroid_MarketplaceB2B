import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { orders, orderItems, organizations, orderStatusHistory, deliveryAddresses } from "@marin-froid/db";
import { OrderStatusSelect } from "@/components/OrderStatusSelect";
import { OrderPreparationTimeline } from "@/components/OrderPreparationTimeline";
import { OrderItemsPrepPanel } from "@/components/OrderItemsPrepPanel";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const order = await db.query.orders.findFirst({ where: eq(orders.id, id) });
  if (!order) notFound();

  const [organization, items, history, deliveryAddress] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, order.organizationId) }),
    db.query.orderItems.findMany({ where: eq(orderItems.orderId, order.id) }),
    db.query.orderStatusHistory.findMany({
      where: eq(orderStatusHistory.orderId, order.id),
      orderBy: (h, { asc }) => [asc(h.createdAt)],
    }),
    order.deliveryAddressId
      ? db.query.deliveryAddresses.findFirst({ where: eq(deliveryAddresses.id, order.deliveryAddressId) })
      : Promise.resolve(null),
  ]);

  return (
    <>
      <PageHeader
        title={order.reference}
        subtitle={`${organization?.name} · ${new Date(order.createdAt).toLocaleString("fr-FR")}`}
        action={<OrderStatusSelect orderId={order.id} currentStatus={order.status} hideNextForStatuses={["processing"]} />}
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
                Notes au préparateur
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text)" }}>{order.notes}</div>
            </div>
          )}
        </div>
      )}

      <OrderItemsPrepPanel orderId={order.id} orderStatus={order.status} items={items} />
    </>
  );
}
