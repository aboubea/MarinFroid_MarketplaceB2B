import { desc } from "drizzle-orm";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";
import { AdminClientsTabs } from "@/components/AdminClientsTabs";
import { PageHeader } from "@/components/PageHeader";
import { getInternalOrganizationIds } from "@/lib/organizations";

export default async function AdminClientsPage() {
  await requireMarinFroidAdminSession();
  const db = getDb();
  const [list, internalOrgIds] = await Promise.all([
    db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] }),
    getInternalOrganizationIds(),
  ]);
  const clientOrgs = list.filter((o) => !internalOrgIds.has(o.id));

  return (
    <>
      <PageHeader title="Clients" subtitle="Sociétés clientes et invitations envoyées." />
      <AdminClientsTabs
        initialOrganizations={clientOrgs.map((o) => ({ id: o.id, name: o.name, status: o.status, createdAt: o.createdAt.toString() }))}
      />
    </>
  );
}
