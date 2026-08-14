import { desc } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { InviteClientForm } from "@/components/InviteClientForm";
import { EmptyState } from "@/components/EmptyState";
import { ClientsTable } from "@/components/ClientsTable";

export default async function AdminClientsPage() {
  const session = await requireMarinFroidSession();
  const db = getDb();
  const list = await db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] });

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Clients</h1>

      <div className="card" style={{ padding: 20, marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Inviter une nouvelle société</h2>
        <InviteClientForm />
      </div>

      {list.length === 0 ? (
        <EmptyState
          illustration="users"
          title="Aucun client"
          description="Invitez une première société avec le formulaire ci-dessus."
        />
      ) : (
        <ClientsTable
          organizations={list.map((o) => ({ id: o.id, name: o.name, status: o.status, createdAt: o.createdAt.toString() }))}
        />
      )}
    </AdminShell>
  );
}
