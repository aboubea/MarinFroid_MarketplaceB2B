import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { products, productImages } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { CatalogBrowser } from "@/components/CatalogBrowser";
import { PageHeader } from "@/components/PageHeader";

export default async function CatalogPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const categories = await db.query.productCategories.findMany({ orderBy: (c, { asc }) => [asc(c.position)] });
  const allProducts = await db.query.products.findMany({ where: eq(products.active, true) });

  // One representative image per product, so tiles show the real thing
  // instead of an SKU placeholder.
  const allImages = await db.query.productImages.findMany({
    orderBy: (i, { asc }) => [asc(i.position)],
  });
  const imageByProduct = new Map<string, string>();
  for (const img of allImages) {
    if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img.url);
  }

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <PageHeader title="Catalogue" />
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
          imageUrl: imageByProduct.get(p.id) ?? null,
        }))}
      />
    </AppShell>
  );
}
