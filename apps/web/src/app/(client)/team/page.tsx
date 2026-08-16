import { requireOrgAdminSession } from "@/lib/team-guard";
import { TeamManager } from "@/components/TeamManager";
import { PageHeader } from "@/components/PageHeader";

export default async function TeamPage() {
  const { session, organization } = await requireOrgAdminSession();

  return (
    <>
      <PageHeader title="Équipe" subtitle={`Gérez les utilisateurs de ${organization.name}.`} />
      <TeamManager currentUserId={session.userId} />
    </>
  );
}
