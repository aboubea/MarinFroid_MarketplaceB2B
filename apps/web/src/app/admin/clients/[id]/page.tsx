import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations, users } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { OrgStatusToggle } from "@/components/OrgStatusToggle";

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
          <div style={{ padding: 16, color: "var(--color-text-muted)" }}>Aucun utilisateur actif pour le moment.</div>
        ) : (
          orgUsers.map((u, idx) => (
            <div key={u.id} style={{ padding: 16, borderBottom: idx < orgUsers.length - 1 ? "1px solid var(--color-border)" : "none", display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.fullName}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{u.email} · {u.role}</div>
              </div>
              <span className={`badge ${u.active ? "badge-completed" : "badge-cancelled"}`}>{u.active ? "actif" : "désactivé"}</span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
