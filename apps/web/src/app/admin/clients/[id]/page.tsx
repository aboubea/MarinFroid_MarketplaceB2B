import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, users, deliveryAddresses } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { OrgStatusToggle } from "@/components/OrgStatusToggle";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

const ROLE_LABELS: Record<string, string> = {
  mf_admin: "Admin Marin Froid",
  mf_ops: "Équipe commandes",
  org_admin: "Administrateur",
  org_buyer: "Acheteur",
  org_viewer: "Lecture / administratif",
};

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidAdminSession();
  const db = getDb();

  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  if (!organization) notFound();
  const orgUsers = await db.query.users.findMany({ where: eq(users.organizationId, id) });
  const addresses = await db.query.deliveryAddresses.findMany({ where: eq(deliveryAddresses.organizationId, id) });

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title={organization.name} action={<OrgStatusToggle organizationId={organization.id} currentStatus={organization.status} />} />

      <h2 className="section-title">Utilisateurs</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        {orgUsers.length === 0 ? (
          <EmptyState illustration="users" title="Aucun utilisateur" description="Cette société n'a pas encore d'utilisateur actif." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {orgUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={u.fullName} />
                        <span style={{ fontWeight: 600 }}>{u.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-text-muted)" }}>{u.email}</td>
                    <td>{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td>
                      <span className={`status-dot ${u.active ? "on" : "off"}`}>{u.active ? "Actif" : "Désactivé"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 className="section-title" style={{ margin: "24px 0 12px" }}>Adresses de livraison</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        {addresses.length === 0 ? (
          <EmptyState illustration="box" title="Aucune adresse" description="Cette société n'a pas encore renseigné d'adresse de livraison." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {addresses.map((a, idx) => (
              <div
                key={a.id}
                style={{
                  padding: "14px 16px",
                  borderBottom: idx < addresses.length - 1 ? "1px solid var(--color-border)" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                    {a.label} {a.isDefault && <span className="badge badge-completed" style={{ marginLeft: 6 }}>par défaut</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>
                    {a.line1}{a.line2 ? `, ${a.line2}` : ""} · {a.postalCode} {a.city} · {a.country}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
