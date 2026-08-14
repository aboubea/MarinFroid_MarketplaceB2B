import { requireOrgAdminSession } from "@/lib/team-guard";
import { AppShell } from "@/components/AppShell";
import { TeamManager } from "@/components/TeamManager";

export default async function TeamPage() {
  const { session, organization } = await requireOrgAdminSession();

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Équipe</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, marginBottom: 24 }}>
        Gérez les utilisateurs de {organization.name}.
      </p>
      <TeamManager currentUserId={session.userId} />
    </AppShell>
  );
}
