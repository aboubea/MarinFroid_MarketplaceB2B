import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { ActivityLog } from "@/components/ActivityLog";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminActivityPage() {
  await requireMarinFroidAdminSession();

  return (
    <>
      <PageHeader title="Journal d'activité" subtitle="Traçabilité des actions effectuées sur la plateforme." />
      <ActivityLog />
    </>
  );
}
