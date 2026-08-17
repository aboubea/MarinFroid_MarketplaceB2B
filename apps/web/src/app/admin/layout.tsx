import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName}>
      {children}
    </AdminShell>
  );
}
