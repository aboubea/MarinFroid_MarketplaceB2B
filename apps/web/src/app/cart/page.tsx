import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getCartWithItems } from "@/lib/cart";
import { getDb } from "@/lib/db";
import { deliveryAddresses, users } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { CartTable } from "@/components/CartTable";
import { getEffectivePermissions } from "@/lib/permissions";

export default async function CartPage() {
  const { session, organization } = await requireClientSession();
  const { items } = await getCartWithItems(organization.id, session.userId);
  const db = getDb();
  const [addresses, user] = await Promise.all([
    db.query.deliveryAddresses.findMany({ where: eq(deliveryAddresses.organizationId, organization.id) }),
    db.query.users.findFirst({ where: eq(users.id, session.userId) }),
  ]);

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Panier</h1>
      <CartTable
        initialItems={items}
        addresses={addresses}
        canSubmit={!!user && getEffectivePermissions(user).canOrder}
        isOrgAdmin={session.role === "org_admin"}
      />
    </AppShell>
  );
}
