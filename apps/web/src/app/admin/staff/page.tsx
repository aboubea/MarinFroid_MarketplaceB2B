import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { StaffManager } from "@/components/StaffManager";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminStaffPage() {
  const session = await requireMarinFroidAdminSession();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Équipe Marin Froid" subtitle="Comptes internes (administration et équipe préparation)." />
      <StaffManager currentUserId={session.userId} />
    </AdminShell>
  );
}
