import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { ActivityLog } from "@/components/ActivityLog";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminActivityPage() {
  const session = await requireMarinFroidAdminSession();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Journal d'activité" subtitle="Traçabilité des actions effectuées sur la plateforme." />
      <ActivityLog />
    </AdminShell>
  );
}
