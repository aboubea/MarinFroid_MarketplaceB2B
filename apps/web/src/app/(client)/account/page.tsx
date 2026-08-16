import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { deliveryAddresses } from "@marin-froid/db";
import { AddressManager } from "@/components/AddressManager";
import { Avatar } from "@/components/Avatar";
import { PageHeader } from "@/components/PageHeader";

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
    <>
      <PageHeader title="Mon compte" />

      <div className="grid-aside-360">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Mot de passe</div>
                <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Dernière connexion enregistrée par le système.</div>
              </div>
              <a href="/forgot-password" className="btn-secondary" style={{ fontSize: 13 }}>Changer</a>
            </div>
          </div>
        </div>

        <div>
          <h2 className="section-title">Adresses de livraison</h2>
          {session.role === "org_admin" ? (
            <AddressManager initialAddresses={addresses} />
          ) : (
            <>
              <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 12 }}>
                Seul l'administrateur de votre société peut ajouter ou modifier les adresses de livraison.
              </p>
              {addresses.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Aucune adresse enregistrée.</p>
              ) : (
                <div className="grid-split-2">
                  {addresses.map((a) => (
                    <div key={a.id} className="card" style={{ padding: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                        {a.label} {a.isDefault && <span className="badge badge-completed" style={{ marginLeft: 6 }}>par défaut</span>}
                      </div>
                      <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                        {a.line1}{a.line2 ? `, ${a.line2}` : ""} · {a.postalCode} {a.city} · {a.country}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
