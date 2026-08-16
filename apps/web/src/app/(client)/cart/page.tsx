import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getCartWithItems } from "@/lib/cart";
import { getDb } from "@/lib/db";
import { deliveryAddresses, users } from "@marin-froid/db";
import { CartTable } from "@/components/CartTable";
import { getEffectivePermissions } from "@/lib/permissions";
import { PageHeader } from "@/components/PageHeader";

export default async function CartPage() {
  const { session, organization } = await requireClientSession();
  const { items } = await getCartWithItems(organization.id, session.userId);
  const db = getDb();
  const [addresses, user] = await Promise.all([
    db.query.deliveryAddresses.findMany({ where: eq(deliveryAddresses.organizationId, organization.id) }),
    db.query.users.findFirst({ where: eq(users.id, session.userId) }),
  ]);

  return (
    <>
      <PageHeader title="Panier" />
      <CartTable
        initialItems={items}
        addresses={addresses}
        canSubmit={!!user && getEffectivePermissions(user).canOrder}
        isOrgAdmin={session.role === "org_admin"}
      />
    </>
  );
}
