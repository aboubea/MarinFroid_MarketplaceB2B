import { desc } from "drizzle-orm";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { InviteClientForm } from "@/components/InviteClientForm";
import { AdminClientsBoard } from "@/components/AdminClientsBoard";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminClientsPage() {
  const session = await requireMarinFroidAdminSession();
  const db = getDb();
  const list = await db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] });

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Clients" />

      <div className="card" style={{ padding: 20, marginBottom: 32 }}>
        <h2 className="section-title">Inviter une nouvelle société</h2>
        <InviteClientForm />
      </div>

      <AdminClientsBoard
        initialOrganizations={list.map((o) => ({ id: o.id, name: o.name, status: o.status, createdAt: o.createdAt.toString() }))}
      />
    </AdminShell>
  );
}
