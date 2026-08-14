import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { products } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { CatalogBrowser } from "@/components/CatalogBrowser";

export default async function CatalogPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const categories = await db.query.productCategories.findMany({ orderBy: (c, { asc }) => [asc(c.position)] });
  const allProducts = await db.query.products.findMany({ where: eq(products.active, true) });

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 20 }}>Catalogue</h1>
      <CatalogBrowser
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        products={allProducts.map((p) => ({
          id: p.id,
          categoryId: p.categoryId,
          name: p.name,
          sku: p.sku,
          unit: p.unit,
          origin: p.origin,
          packaging: p.packaging,
          indicativePrice: p.indicativePrice,
        }))}
      />
    </AppShell>
  );
}
