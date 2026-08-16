import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { orders, organizations, deliveryAddresses, orderItems } from "@marin-froid/db";
import { DeliveriesRoutePanel, type DeliveryStop } from "@/components/DeliveriesRoutePanel";
import { PageHeader } from "@/components/PageHeader";

function targetThursday(): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 4 ? 0 : (4 - day + 7) % 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function AdminDeliveriesPage() {
  const db = getDb();

  const start = targetThursday();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const dayOrders = await db
    .select({
      id: orders.id,
      reference: orders.reference,
      status: orders.status,
      deliveryAddressId: orders.deliveryAddressId,
      organizationName: organizations.name,
    })
    .from(orders)
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .where(
      and(
        gte(orders.estimatedDeliveryDate, start),
        lt(orders.estimatedDeliveryDate, end),
        inArray(orders.status, ["shipped", "completed"]),
      ),
    );

  const addressIds = dayOrders.map((o) => o.deliveryAddressId).filter((id): id is string => !!id);
  const addresses = addressIds.length
    ? await db.query.deliveryAddresses.findMany({ where: inArray(deliveryAddresses.id, addressIds) })
    : [];
  const addressById = new Map(addresses.map((a) => [a.id, a]));

  const itemCounts = await Promise.all(
    dayOrders.map(async (o) => {
      const items = await db.query.orderItems.findMany({ where: eq(orderItems.orderId, o.id) });
      return items.reduce((sum, i) => sum + i.quantity, 0);
    }),
  );

  const stops: DeliveryStop[] = dayOrders.map((o, idx) => {
    const address = o.deliveryAddressId ? addressById.get(o.deliveryAddressId) : null;
    return {
      orderId: o.id,
      reference: o.reference,
      status: o.status,
      organizationName: o.organizationName,
      address: address
        ? { label: address.label, line1: address.line1, line2: address.line2, city: address.city, postalCode: address.postalCode }
        : null,
      itemCount: itemCounts[idx],
    };
  });

  const isToday = start.toDateString() === new Date().toDateString();

  return (
    <>
      <PageHeader
        title="Livraisons du jour"
        subtitle={`${isToday ? "Tournée d'aujourd'hui" : `Prochaine tournée — jeudi ${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`} · Départ Marin Froid, Chemin du Chapitre, Toulouse.`}
      />

      <DeliveriesRoutePanel initialStops={stops} />
    </>
  );
}
