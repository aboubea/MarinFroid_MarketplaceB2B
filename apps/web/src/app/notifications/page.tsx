import { requireClientSession } from "@/lib/session-guard";
import { AppShell } from "@/components/AppShell";
import { NotificationsCenter } from "@/components/NotificationsCenter";
import { PageHeader } from "@/components/PageHeader";

export default async function NotificationsPage() {
  const { session, organization } = await requireClientSession();

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <PageHeader title="Notifications" />
      <NotificationsCenter />
    </AppShell>
  );
}
