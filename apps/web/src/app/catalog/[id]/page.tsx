import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireClientSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { products, productImages, productDocuments } from "@marin-froid/db";
import { AppShell } from "@/components/AppShell";
import { ProductDetailAdd } from "@/components/ProductDetailAdd";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { session, organization } = await requireClientSession();
  const db = getDb();

  const product = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!product) notFound();

  const [images, documents] = await Promise.all([
    db.query.productImages.findMany({ where: eq(productImages.productId, id) }),
    db.query.productDocuments.findMany({ where: eq(productDocuments.productId, id) }),
  ]);

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name} role={session.role}>
      <Link href="/catalog" style={{ fontSize: 13, color: "var(--color-text-muted)", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        ← Retour au catalogue
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 40, alignItems: "start" }}>
        <div>
          <div className="product-thumb" style={{ aspectRatio: "1 / 1", fontSize: 13, marginBottom: 10 }}>
            {product.sku}
          </div>
          {images.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {images.map((img) => (
                <div key={img.id} className="product-thumb" style={{ aspectRatio: "1 / 1", fontSize: 9 }}>
                  img
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="badge badge-completed" style={{ marginBottom: 10 }}>{product.active ? "En stock" : "Indisponible"}</span>
          <h1 style={{ fontSize: 26, margin: "8px 0 4px", letterSpacing: "-0.02em" }}>{product.name}</h1>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>
            {product.origin ?? "Origine non renseignée"} · Réf. {product.sku}
          </p>

          {product.indicativePrice && (
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
              {Number(product.indicativePrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              <span style={{ fontSize: 13, fontWeight: 400, color: "var(--color-text-muted)" }}> / {product.unit}</span>
            </div>
          )}
          {product.packaging && (
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 24 }}>Soit {product.packaging}</p>
          )}

          <ProductDetailAdd productId={product.id} />

          <div className="card" style={{ padding: 20, marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Conditionnement</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{product.packaging ?? "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Conservation</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{product.storageTemp ?? "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>DLUO</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{product.shelfLife ?? "—"}</div>
            </div>
          </div>

          {product.description && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 14, marginBottom: 8 }}>Description</h2>
              <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{product.description}</p>
            </div>
          )}

          {product.nutritionalInfo && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 14, marginBottom: 8 }}>Valeurs nutritionnelles moyennes (pour 100g)</h2>
              <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{product.nutritionalInfo}</p>
            </div>
          )}

          {documents.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 14, marginBottom: 8 }}>Documents</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {documents.map((doc) => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="card interactive" style={{ padding: "10px 14px", fontSize: 13, fontWeight: 500 }}>
                    {doc.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
