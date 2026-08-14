import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { AdminOrdersBoard } from "@/components/AdminOrdersBoard";

export default async function AdminOrdersPage() {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Commandes</h1>
      <AdminOrdersBoard />
    </AdminShell>
  );
}
