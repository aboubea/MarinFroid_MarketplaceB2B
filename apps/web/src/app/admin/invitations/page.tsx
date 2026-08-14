import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { InvitationsTable } from "@/components/InvitationsTable";

export default async function AdminInvitationsPage() {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Invitations</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, marginBottom: 24 }}>
        Suivez, renvoyez ou annulez les invitations envoyées aux sociétés clientes.
      </p>
      <InvitationsTable />
    </AdminShell>
  );
}
