import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { NotificationSettings } from "@/components/NotificationSettings";

export default async function AdminNotificationsPage() {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Emails & notifications</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, marginBottom: 24 }}>
        Choisissez qui reçoit un email pour chaque événement métier.
      </p>
      <NotificationSettings />
    </AdminShell>
  );
}
