import Link from "next/link";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { AdminShell } from "@/components/AdminShell";
import { ProductForm } from "@/components/ProductForm";

export default async function NewProductPage() {
  const session = await requireMarinFroidSession();

  return (
    <AdminShell fullName={session.fullName}>
      <Link href="/admin/catalog" style={{ fontSize: 13, color: "var(--color-text-muted)", display: "inline-block", marginBottom: 16 }}>
        ← Retour au catalogue
      </Link>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Nouveau produit</h1>
      <ProductForm />
    </AdminShell>
  );
}
