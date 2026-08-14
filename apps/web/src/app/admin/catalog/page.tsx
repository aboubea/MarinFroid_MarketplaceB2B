import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { CatalogAdminTable } from "@/components/CatalogAdminTable";

export default async function AdminCatalogPage() {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName}>
      <CatalogAdminTable />
    </AdminShell>
  );
}
