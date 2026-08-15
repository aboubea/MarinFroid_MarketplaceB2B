import { eq, desc } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { OrdersList } from "@/components/OrdersList";
import { getOrderTotals } from "@/lib/order-totals";
import { PageHeader } from "@/components/PageHeader";

export default async function OrdersPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();
  const list = await db.query.orders.findMany({
    where: eq(orders.organizationId, organization.id),
    orderBy: [desc(orders.createdAt)],
  });
  const totals = await getOrderTotals(list.map((o) => o.id));

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <PageHeader title="Vos commandes" />
      <OrdersList
        orders={list.map((o) => ({
          id: o.id,
          reference: o.reference,
          status: o.status,
          createdAt: o.createdAt.toString(),
          totalAmount: totals.get(o.id) ?? 0,
        }))}
      />
    </AppShell>
  );
}
