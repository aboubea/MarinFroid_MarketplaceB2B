import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { products, productImages, productDocuments } from "@marin-froid/db";
import { ProductForm } from "@/components/ProductForm";
import { PageHeader } from "@/components/PageHeader";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidAdminSession();
  const db = getDb();

  const product = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!product) notFound();

  const [images, documents] = await Promise.all([
    db.query.productImages.findMany({ where: eq(productImages.productId, id) }),
    db.query.productDocuments.findMany({ where: eq(productDocuments.productId, id) }),
  ]);

  return (
    <>
      <Link href="/admin/catalog" style={{ fontSize: 13, color: "var(--color-text-muted)", display: "inline-block", marginBottom: 16 }}>
        ← Retour au catalogue
      </Link>
      <PageHeader title={product.name} />
      <ProductForm existing={product} images={images} documents={documents} />
    </>
  );
}
