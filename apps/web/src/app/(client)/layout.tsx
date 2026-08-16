import { requireClientSession } from "@/lib/session-guard";
import { AppShell } from "@/components/AppShell";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const { session, organization } = await requireClientSession();

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      {children}
    </AppShell>
  );
}
