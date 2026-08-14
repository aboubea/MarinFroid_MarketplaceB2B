import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { deliveryAddresses } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { AddressManager } from "@/components/AddressManager";
import { Avatar } from "@/components/Avatar";

const ROLE_LABELS: Record<string, string> = {
  mf_admin: "Admin Marin Froid",
  mf_ops: "Équipe commandes",
  org_admin: "Administrateur",
  org_buyer: "Acheteur",
  org_viewer: "Lecture / administratif",
};

export default async function AccountPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();
  const addresses = await db.query.deliveryAddresses.findMany({
    where: eq(deliveryAddresses.organizationId, organization.id),
  });

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Mon compte</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520, marginBottom: 40 }}>
        <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar name={session.fullName} size={52} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{session.fullName}</div>
            <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{ROLE_LABELS[session.role] ?? session.role}</div>
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>
            Société
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>{organization.name}</div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
            Statut : {organization.status === "active" ? "Active" : organization.status}
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>
            Sécurité
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Mot de passe</div>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Dernière connexion enregistrée par le système.</div>
            </div>
            <a href="/forgot-password" className="btn-secondary" style={{ fontSize: 13 }}>Changer</a>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, marginBottom: 12 }}>Adresses de livraison</h2>
      <div style={{ maxWidth: 520 }}>
        <AddressManager initialAddresses={addresses} />
      </div>
    </AppShell>
  );
}
