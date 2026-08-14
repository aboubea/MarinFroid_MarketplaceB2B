import { eq } from "drizzle-orm";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { products, productCategories } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { QuickAddButton } from "@/components/QuickAddButton";

export default async function CatalogPage() {
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const categories = await db.query.productCategories.findMany({ orderBy: (c, { asc }) => [asc(c.position)] });
  const allProducts = await db.query.products.findMany({ where: eq(products.active, true) });

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Catalogue</h1>
      {categories.map((cat) => {
        const items = allProducts.filter((p) => p.categoryId === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>{cat.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {items.map((p) => (
                <div key={p.id} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{p.sku} · {p.unit}</div>
                  <QuickAddButton productId={p.id} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </AppShell>
  );
}
