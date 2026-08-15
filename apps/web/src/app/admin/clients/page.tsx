import { desc } from "drizzle-orm";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { AdminClientsTabs } from "@/components/AdminClientsTabs";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminClientsPage() {
  const session = await requireMarinFroidAdminSession();
  const db = getDb();
  const list = await db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] });

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Clients" subtitle="Sociétés clientes et invitations envoyées." />
      <AdminClientsTabs
        initialOrganizations={list.map((o) => ({ id: o.id, name: o.name, status: o.status, createdAt: o.createdAt.toString() }))}
      />
    </AdminShell>
  );
}
