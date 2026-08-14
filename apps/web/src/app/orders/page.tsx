import { eq, desc } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { OrdersList } from "@/components/OrdersList";

export default async function OrdersPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();
  const list = await db.query.orders.findMany({
    where: eq(orders.organizationId, organization.id),
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Vos commandes</h1>
      <OrdersList
        orders={list.map((o) => ({ id: o.id, reference: o.reference, status: o.status, createdAt: o.createdAt.toString() }))}
      />
    </AppShell>
  );
}
