import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, users } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { OrgStatusToggle } from "@/components/OrgStatusToggle";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";

const ROLE_LABELS: Record<string, string> = {
  mf_admin: "Admin Marin Froid",
  mf_ops: "Équipe commandes",
  org_admin: "Administrateur",
  org_buyer: "Acheteur",
  org_viewer: "Utilisateur secondaire",
};

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidSession();
  const db = getDb();

  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  if (!organization) notFound();
  const orgUsers = await db.query.users.findMany({ where: eq(users.organizationId, id) });

  return (
    <AdminShell fullName={session.fullName}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24 }}>{organization.name}</h1>
        <OrgStatusToggle organizationId={organization.id} currentStatus={organization.status} />
      </div>

      <h2 style={{ fontSize: 15, marginBottom: 12 }}>Utilisateurs</h2>
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
    </AdminShell>
  );
}
