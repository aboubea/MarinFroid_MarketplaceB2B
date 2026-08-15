import { requireOrgAdminSession } from "@/lib/team-guard";
import { AppShell } from "@/components/AppShell";
import { TeamManager } from "@/components/TeamManager";
import { PageHeader } from "@/components/PageHeader";

export default async function TeamPage() {
  const { session, organization } = await requireOrgAdminSession();

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <PageHeader title="Équipe" subtitle={`Gérez les utilisateurs de ${organization.name}.`} />
      <TeamManager currentUserId={session.userId} />
    </AppShell>
  );
}
