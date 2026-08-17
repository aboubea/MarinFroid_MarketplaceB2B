import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { products, productImages, productDocuments } from "@marin-froid/db";
import { ProductDetailAdd } from "@/components/ProductDetailAdd";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const product = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!product) notFound();

  const [images, documents] = await Promise.all([
    db.query.productImages.findMany({ where: eq(productImages.productId, id) }),
    db.query.productDocuments.findMany({ where: eq(productDocuments.productId, id) }),
  ]);

  return (
    <>
      <Link href="/catalog" style={{ fontSize: 13, color: "var(--color-text-muted)", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        ← Retour au catalogue
      </Link>

      <div className="grid-media-420" style={{ gap: 40, alignItems: "start" }}>
        <div>
          <div className="product-thumb" style={{ aspectRatio: "1 / 1", fontSize: 13, marginBottom: 10 }}>
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0].url} alt={product.name} fetchPriority="high" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              product.sku
            )}
          </div>
          {images.length > 1 && (
            <div className="product-thumb-grid">
              {images.slice(1).map((img) => (
                <div key={img.id} className="product-thumb" style={{ aspectRatio: "1 / 1" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="has-buy-bar">
          <span className={`badge ${product.active ? "badge-completed" : "badge-cancelled"}`}>
            {product.active ? "En stock" : "Indisponible"}
          </span>
          <h1 style={{ fontSize: 32, margin: "12px 0 6px", letterSpacing: "-0.035em", lineHeight: 1.15 }}>{product.name}</h1>
          <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginBottom: 24 }}>
            {product.origin ?? "Provenance non renseignée"} · Réf. {product.sku}
          </p>

          {product.indicativePrice && (
            <div style={{ fontSize: 36, fontWeight: 750, marginBottom: 4, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              {Number(product.indicativePrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-muted)", letterSpacing: "-0.01em" }}> / {product.unit}</span>
            </div>
          )}
          {product.packaging && (
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 8 }}>Soit {product.packaging}</p>
          )}
          <p style={{ fontSize: 12.5, color: "var(--color-text-faint)", marginBottom: 24 }}>
            Prix indicatif HT · confirmé par l&apos;équipe Marin Froid
          </p>

          <ProductDetailAdd productId={product.id} />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              marginTop: 20,
              fontSize: 12.5,
              color: "var(--color-text-muted)",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="6" width="14" height="11" rx="1.5" />
                <path d="M15 10h4l3 3.5V17h-7z" />
                <circle cx="6" cy="19" r="2" /><circle cx="17.5" cy="19" r="2" />
              </svg>
              Livraison le jeudi
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="m9 12 2 2 4-4" />
              </svg>
              Aucun paiement en ligne
            </span>
          </div>

          <div className="card product-specs-grid" style={{ padding: 20, marginTop: 28 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Conditionnement</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{product.packaging ?? "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Stockage</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{product.storageInfo ?? "—"}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Validité</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{product.validityInfo ?? "—"}</div>
            </div>
          </div>

          {product.description && (
            <div style={{ marginTop: 24 }}>
              <h2 className="section-title">Description</h2>
              <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", lineHeight: 1.6 }}>{product.description}</p>
            </div>
          )}

          {product.specifications && (
            <div style={{ marginTop: 24 }}>
              <h2 className="section-title">Caractéristiques techniques</h2>
              <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", lineHeight: 1.6, whiteSpace: "pre-line" }}>{product.specifications}</p>
            </div>
          )}

          {documents.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 className="section-title">Documents</h2>
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
    </>
  );
}
