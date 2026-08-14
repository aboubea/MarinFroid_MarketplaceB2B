import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { deliveryAddresses } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { AddressManager } from "@/components/AddressManager";

export default async function AccountPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();
  const addresses = await db.query.deliveryAddresses.findMany({
    where: eq(deliveryAddresses.organizationId, organization.id),
  });

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Compte</h1>
      <div className="card" style={{ padding: 24, maxWidth: 480, marginBottom: 32 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Nom</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{session.fullName}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Société</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{organization.name}</div>
        </div>
        <a href="/forgot-password" style={{ fontSize: 13, fontWeight: 600 }}>Changer mon mot de passe</a>
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Adresses de livraison</h2>
      <div style={{ maxWidth: 480 }}>
        <AddressManager initialAddresses={addresses} />
      </div>
    </AppShell>
  );
}
