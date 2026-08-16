import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { CatalogAdminTable } from "@/components/CatalogAdminTable";

export default async function AdminCatalogPage() {
  await requireMarinFroidAdminSession();

  return <CatalogAdminTable />;
}
