import { requireClientSession } from "@/lib/session-guard";
import { getCartWithItems } from "@/lib/cart";
import { AppShell } from "@/components/AppShell";
import { CartTable } from "@/components/CartTable";

export default async function CartPage() {
  const { session, organization } = await requireClientSession();
  const { items } = await getCartWithItems(organization.id, session.userId);

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Panier</h1>
      <CartTable initialItems={items} />
    </AppShell>
  );
}
