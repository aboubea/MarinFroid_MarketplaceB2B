import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { StaffManager } from "@/components/StaffManager";

export default async function AdminStaffPage() {
  const session = await requireMarinFroidAdminSession();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Équipe Marin Froid</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, marginBottom: 24 }}>
        Comptes internes (administration et équipe préparation).
      </p>
      <StaffManager currentUserId={session.userId} />
    </AdminShell>
  );
}
