import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { InvitationsTable } from "@/components/InvitationsTable";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminInvitationsPage() {
  const session = await requireMarinFroidAdminSession();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Invitations" subtitle="Suivez, renvoyez ou annulez les invitations envoyées aux sociétés clientes." />
      <InvitationsTable />
    </AdminShell>
  );
}
