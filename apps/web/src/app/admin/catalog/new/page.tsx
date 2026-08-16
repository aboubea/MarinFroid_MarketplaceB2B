import Link from "next/link";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { ProductForm } from "@/components/ProductForm";
import { PageHeader } from "@/components/PageHeader";

export default async function NewProductPage() {
  await requireMarinFroidAdminSession();

  return (
    <>
      <Link href="/admin/catalog" style={{ fontSize: 13, color: "var(--color-text-muted)", display: "inline-block", marginBottom: 16 }}>
        ← Retour au catalogue
      </Link>
      <PageHeader title="Nouveau produit" />
      <ProductForm />
    </>
  );
}
