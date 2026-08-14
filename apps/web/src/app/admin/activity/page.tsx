import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { ActivityLog } from "@/components/ActivityLog";

export default async function AdminActivityPage() {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Journal d'activité</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, marginBottom: 24 }}>
        Traçabilité des actions effectuées sur la plateforme.
      </p>
      <ActivityLog />
    </AdminShell>
  );
}
