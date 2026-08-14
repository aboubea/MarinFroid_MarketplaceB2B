import { requireClientSession } from "@/lib/session-guard";
import { AppShell } from "@/components/AppShell";
import { NotificationsCenter } from "@/components/NotificationsCenter";

export default async function NotificationsPage() {
  const { session, organization } = await requireClientSession();

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Notifications</h1>
      <NotificationsCenter />
    </AppShell>
  );
}
