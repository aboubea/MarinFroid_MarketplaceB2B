import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, users, deliveryAddresses } from "@marin-froid/db";
import { OrgStatusToggle } from "@/components/OrgStatusToggle";
import { OrgUsersTable } from "@/components/OrgUsersTable";
import { DeleteOrgButton } from "@/components/DeleteOrgButton";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidAdminSession();
  const db = getDb();

  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  if (!organization) notFound();
  const orgUsers = await db.query.users.findMany({ where: eq(users.organizationId, id) });
  const addresses = await db.query.deliveryAddresses.findMany({ where: eq(deliveryAddresses.organizationId, id) });

  return (
    <>
      <PageHeader
        title={organization.name}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <OrgStatusToggle organizationId={organization.id} currentStatus={organization.status} />
            <DeleteOrgButton organizationId={organization.id} organizationName={organization.name} />
          </div>
        }
      />

      <h2 className="section-title">Utilisateurs</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <OrgUsersTable
          organizationId={organization.id}
          initialUsers={orgUsers.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, active: u.active }))}
        />
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
    </>
  );
}
