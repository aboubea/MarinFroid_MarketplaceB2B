import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { CatalogAdminTable } from "@/components/CatalogAdminTable";

export default async function AdminCatalogPage() {
  const session = await requireMarinFroidAdminSession();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <CatalogAdminTable />
    </AdminShell>
  );
}
