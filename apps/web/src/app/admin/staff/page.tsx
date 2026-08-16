import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { StaffManager } from "@/components/StaffManager";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminStaffPage() {
  const session = await requireMarinFroidAdminSession();

  return (
    <>
      <PageHeader title="Équipe Marin Froid" subtitle="Comptes internes (administration et équipe préparation)." />
      <StaffManager currentUserId={session.userId} />
    </>
  );
}
