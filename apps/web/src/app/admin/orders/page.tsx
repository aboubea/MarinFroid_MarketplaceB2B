import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { AdminOrdersBoard } from "@/components/AdminOrdersBoard";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminOrdersPage() {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Commandes" />
      <AdminOrdersBoard />
    </AdminShell>
  );
}
